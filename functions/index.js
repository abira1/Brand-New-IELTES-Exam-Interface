const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const Busboy = require('busboy');
const { v4: uuidv4 } = require('uuid');
const cheerio = require('cheerio');
const archiver = require('archiver');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.database();
const storage = admin.storage();

// ============================================================================
// STUDENT MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get all students
 */
exports.getStudents = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const snapshot = await db.ref('students').once('value');
      const students = [];
      
      snapshot.forEach((child) => {
        students.push({
          id: child.key,
          ...child.val()
        });
      });
      
      res.status(200).json(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Update student approval status
 */
exports.updateStudentStatus = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      const { studentId, status } = req.body;
      
      if (!studentId || !status) {
        return res.status(400).json({ error: 'Missing studentId or status' });
      }
      
      await db.ref(`students/${studentId}`).update({
        status: status,
        updatedAt: new Date().toISOString()
      });
      
      res.status(200).json({ 
        success: true, 
        message: `Student ${status} successfully` 
      });
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============================================================================
// EXAM MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get all exams (light metadata)
 */
exports.getExams = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const snapshot = await db.ref('exams').once('value');
      const exams = [];
      
      snapshot.forEach((child) => {
        exams.push({
          id: child.key,
          ...child.val()
        });
      });
      
      res.status(200).json(exams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Get full exam details with questions
 */
exports.getExamById = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const examId = req.query.id || req.params.id;
      
      if (!examId) {
        return res.status(400).json({ error: 'Exam ID required' });
      }
      
      const snapshot = await db.ref(`exams_full/${examId}`).once('value');
      
      if (!snapshot.exists()) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      
      res.status(200).json({
        id: snapshot.key,
        ...snapshot.val()
      });
    } catch (error) {
      console.error('Error fetching exam:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Create or update exam metadata
 */
exports.saveExam = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      const examData = req.body;
      const examId = examData.id || uuidv4();
      
      const metadata = {
        id: examId,
        title: examData.title,
        description: examData.description,
        type: examData.type,
        duration: examData.duration,
        totalQuestions: examData.totalQuestions || 0,
        createdAt: examData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: examData.status || 'draft'
      };
      
      // Save light metadata
      await db.ref(`exams/${examId}`).set(metadata);
      
      // Save full data if questions provided
      if (examData.questions) {
        await db.ref(`exams_full/${examId}`).set({
          ...metadata,
          questions: examData.questions
        });
      }
      
      res.status(200).json({ 
        success: true, 
        examId: examId,
        message: 'Exam saved successfully' 
      });
    } catch (error) {
      console.error('Error saving exam:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Delete exam
 */
exports.deleteExam = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'DELETE' && req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      const examId = req.query.id || req.body.examId;
      
      if (!examId) {
        return res.status(400).json({ error: 'Exam ID required' });
      }
      
      await db.ref(`exams/${examId}`).remove();
      await db.ref(`exams_full/${examId}`).remove();
      
      res.status(200).json({ 
        success: true, 
        message: 'Exam deleted successfully' 
      });
    } catch (error) {
      console.error('Error deleting exam:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============================================================================
// ZIP IMPORT FUNCTION
// ============================================================================

/**
 * Upload and parse ZIP file containing IELTS exam
 */
exports.uploadZip = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest((req, res) => {
    return cors(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const busboy = Busboy({ headers: req.headers });
      const uploadedFiles = [];
      const fields = {};
      let examTitle = '';

      busboy.on('field', (fieldname, val) => {
        fields[fieldname] = val;
        if (fieldname === 'examTitle') {
          examTitle = val;
        }
      });

      busboy.on('file', (fieldname, file, info) => {
        const { filename, mimeType } = info;

        console.log(`Processing file: ${filename}`);

        // Collect file data
        const chunks = [];
        file.on('data', (data) => {
          chunks.push(data);
        });

        file.on('end', () => {
          uploadedFiles.push({
            filename,
            mimeType,
            buffer: Buffer.concat(chunks)
          });
        });
      });

      busboy.on('finish', async () => {
        try {
          if (uploadedFiles.length === 0) {
            return res.status(400).json({ error: 'No file uploaded' });
          }

          const zipFile = uploadedFiles[0];

          // Parse ZIP and extract content
          const examData = await parseZipFile(zipFile.buffer, examTitle || 'Untitled Exam');

          // Save to database
          const examId = uuidv4();

          const metadata = {
            id: examId,
            title: examData.title,
            description: examData.description || '',
            type: examData.type,
            duration: examData.duration || 60,
            totalQuestions: examData.totalQuestions,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'draft',
            importedFrom: 'zip',
            sections: examData.sections || []
          };

          await db.ref(`exams/${examId}`).set(metadata);
          await db.ref(`exams_full/${examId}`).set({
            ...metadata,
            questions: examData.questions,
            assets: examData.assets
          });

          res.status(200).json({
            success: true,
            examId: examId,
            message: 'ZIP imported successfully',
            data: {
              title: examData.title,
              totalQuestions: examData.totalQuestions,
              sections: examData.sections
            }
          });
        } catch (error) {
          console.error('Error processing ZIP:', error);
          res.status(500).json({
            error: 'Failed to process ZIP file',
            details: error.message
          });
        }
      });

      busboy.end(req.rawBody);
    });
  });

// ============================================================================
// JSON IMPORT FUNCTION
// ============================================================================

/**
 * Upload and parse JSON file containing IELTS exam
 */
exports.uploadJson = functions
  .runWith({ timeoutSeconds: 540, memory: '2GB' })
  .https.onRequest((req, res) => {
    return cors(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const busboy = Busboy({ headers: req.headers });
      const uploadedFiles = [];
      const fields = {};
      let examTitle = '';

      busboy.on('field', (fieldname, val) => {
        fields[fieldname] = val;
        if (fieldname === 'examTitle') {
          examTitle = val;
        }
      });

      busboy.on('file', (fieldname, file, info) => {
        const { filename } = info;

        console.log(`📝 [uploadJson] Processing file: ${filename}`);

        const chunks = [];
        file.on('data', (data) => {
          chunks.push(data);
        });

        file.on('end', () => {
          uploadedFiles.push({
            filename,
            buffer: Buffer.concat(chunks)
          });
        });
      });

      busboy.on('finish', async () => {
        try {
          console.log('📝 [uploadJson] Busboy finish event triggered');

          if (uploadedFiles.length === 0) {
            console.error('❌ [uploadJson] No file uploaded');
            return res.status(400).json({ error: 'No file uploaded' });
          }

          const jsonFile = uploadedFiles[0];
          console.log(`📝 [uploadJson] Processing file: ${jsonFile.filename}, Size: ${jsonFile.buffer.length} bytes`);

          // Validate it's a JSON file
          if (!jsonFile.filename.endsWith('.json')) {
            console.error('❌ [uploadJson] File is not JSON:', jsonFile.filename);
            return res.status(400).json({ error: 'File must be a JSON file' });
          }

          console.log('📝 [uploadJson] Parsing JSON file...');
          const jsonContent = jsonFile.buffer.toString('utf8');
          let jsonData;

          try {
            jsonData = JSON.parse(jsonContent);
            console.log('✅ [uploadJson] JSON parsed successfully');
          } catch (parseError) {
            console.error('❌ [uploadJson] JSON parse error:', parseError.message);
            return res.status(400).json({
              error: 'Invalid JSON format',
              details: parseError.message
            });
          }

          // Parse and validate JSON structure
          console.log('📝 [uploadJson] Parsing exam structure...');
          const examData = parseJsonExam(jsonData, examTitle || jsonData.title || 'Untitled Exam');
          console.log(`✅ [uploadJson] Parsed ${examData.totalQuestions} questions from JSON`);

          const examId = uuidv4();
          console.log(`📝 [uploadJson] Generated exam ID: ${examId}`);

          const metadata = {
            id: examId,
            title: examData.title,
            description: examData.description || '',
            type: examData.type,
            duration: examData.duration || 60,
            totalQuestions: examData.totalQuestions,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'draft',
            importedFrom: 'json',
            sections: examData.sections || [],
            audioFile: examData.audioFile || null,
            audioUrl: examData.audioUrl || null
          };

          console.log('📝 [uploadJson] Saving metadata to Firebase...');
          await db.ref(`exams/${examId}`).set(metadata);
          console.log('✅ [uploadJson] Metadata saved');

          console.log('📝 [uploadJson] Saving full exam data to Firebase...');
          await db.ref(`exams_full/${examId}`).set({
            ...metadata,
            questions: examData.questions
          });
          console.log('✅ [uploadJson] Full exam data saved');

          console.log(`✅ [uploadJson] Exam saved successfully with ID: ${examId}`);

          res.json({
            success: true,
            examId: examId,
            message: 'JSON imported successfully',
            data: {
              title: examData.title,
              totalQuestions: examData.totalQuestions,
              sections: examData.sections
            }
          });
        } catch (error) {
          console.error('❌ [uploadJson] Error processing JSON:', error);
          res.status(500).json({
            error: 'Failed to process JSON file',
            details: error.message
          });
        }
      });

      busboy.end(req.rawBody);
    });
  });

// ============================================================================
// ZIP PARSING HELPER FUNCTIONS
// ============================================================================

async function parseZipFile(zipBuffer, examTitle) {
  const AdmZip = require('adm-zip');
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();
  
  const examData = {
    title: examTitle,
    type: 'full_test',
    totalQuestions: 0,
    questions: [],
    assets: {
      images: [],
      audio: [],
      css: []
    },
    sections: []
  };

  const xhtmlFiles = [];
  const assetFiles = {
    images: [],
    audio: [],
    css: []
  };

  // Categorize files
  zipEntries.forEach((entry) => {
    const fileName = entry.entryName;
    
    if (!entry.isDirectory) {
      if (fileName.endsWith('.xhtml') && !fileName.includes('instructions')) {
        xhtmlFiles.push(entry);
      } else if (fileName.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
        assetFiles.images.push(entry);
      } else if (fileName.match(/\.(mp3|ogg|wav|m4a)$/i)) {
        assetFiles.audio.push(entry);
      } else if (fileName.endsWith('.css')) {
        assetFiles.css.push(entry);
      }
    }
  });

  // Upload assets to Firebase Storage
  const bucket = storage.bucket();
  const storagePrefix = `exams/${Date.now()}/`;

  // Upload images
  for (const entry of assetFiles.images) {
    const fileName = entry.entryName.split('/').pop();
    const file = bucket.file(`${storagePrefix}images/${fileName}`);
    await file.save(entry.getData(), {
      metadata: { contentType: getContentType(fileName) }
    });
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });
    examData.assets.images.push({ name: fileName, url });
  }

  // Upload audio
  for (const entry of assetFiles.audio) {
    const fileName = entry.entryName.split('/').pop();
    const file = bucket.file(`${storagePrefix}audio/${fileName}`);
    await file.save(entry.getData(), {
      metadata: { contentType: getContentType(fileName) }
    });
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });
    examData.assets.audio.push({ name: fileName, url });
  }

  // Upload CSS
  for (const entry of assetFiles.css) {
    const fileName = entry.entryName.split('/').pop();
    const file = bucket.file(`${storagePrefix}css/${fileName}`);
    await file.save(entry.getData(), {
      metadata: { contentType: 'text/css' }
    });
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });
    examData.assets.css.push({ name: fileName, url });
  }

  // Parse XHTML files
  let questionNumber = 1;
  const sectionMap = {};

  for (const entry of xhtmlFiles) {
    const content = entry.getData().toString('utf8');
    const $ = cheerio.load(content, { xmlMode: true });
    
    // Detect section type from path
    const path = entry.entryName;
    let sectionType = 'Unknown';
    if (path.includes('Listening')) sectionType = 'Listening';
    else if (path.includes('Reading')) sectionType = 'Reading';
    else if (path.includes('Writing')) sectionType = 'Writing';
    
    // Detect question type from path
    const questionType = detectQuestionType(path);
    
    if (!sectionMap[sectionType]) {
      sectionMap[sectionType] = {
        name: sectionType,
        questionTypes: [],
        questionCount: 0
      };
    }
    
    if (!sectionMap[sectionType].questionTypes.includes(questionType)) {
      sectionMap[sectionType].questionTypes.push(questionType);
    }

    // Extract questions based on type
    const questions = parseQuestionsByType($, questionType, sectionType, questionNumber);
    
    examData.questions.push(...questions);
    questionNumber += questions.length;
    sectionMap[sectionType].questionCount += questions.length;
  }

  examData.totalQuestions = questionNumber - 1;
  examData.sections = Object.values(sectionMap);

  return examData;
}

function detectQuestionType(path) {
  const typeMap = {
    'Fill in the gaps short': 'fill_gaps_short',
    'Fill in the gaps': 'fill_gaps',
    'Multiple Choice (one answer)': 'mcq_single',
    'Multiple Choice (more than one)': 'mcq_multiple',
    'True/False/Not Given': 'true_false_ng',
    'Identifying Information': 'true_false_ng',
    'Matching': 'matching',
    'Sentence Completion': 'sentence_completion',
    'Table Completion': 'table_completion',
    'Flow-chart Completion': 'flowchart_completion',
    'Form Completion': 'form_completion',
    'Note Completion': 'note_completion',
    'Summary Completion': 'summary_completion',
    'Matching Headings': 'matching_headings',
    'Matching Features': 'matching_features',
    'Matching Sentence Endings': 'matching_endings',
    'Labelling on a map': 'map_labelling',
    'writing-part-1': 'writing_task1',
    'writing-part-2': 'writing_task2'
  };

  for (const [key, value] of Object.entries(typeMap)) {
    if (path.includes(key)) {
      return value;
    }
  }

  return 'unknown';
}

function parseQuestionsByType($, questionType, section, startNumber) {
  const questions = [];
  
  // Find all question items
  $('[connect\\:class="assessmentItemRef"]').each((i, elem) => {
    const questionId = $(elem).attr('connect:identifier');
    const questionLabel = $(elem).find('.question-number').text().trim();
    
    const question = {
      id: questionId || `q_${startNumber + i}`,
      number: startNumber + i,
      type: questionType,
      section: section,
      text: '',
      options: [],
      correctAnswer: null,
      points: 1
    };

    // Extract question text
    const questionText = $(elem).find('.question-text, .stimulus, p').first().text().trim();
    question.text = questionText;

    // Type-specific parsing
    switch (questionType) {
      case 'mcq_single':
      case 'mcq_multiple':
        $(elem).find('.option, .choice').each((j, opt) => {
          const optionText = $(opt).text().trim();
          const isCorrect = $(opt).hasClass('correct') || $(opt).attr('connect:correct') === 'true';
          question.options.push({
            id: `opt_${j}`,
            text: optionText,
            correct: isCorrect
          });
        });
        break;

      case 'true_false_ng':
        question.options = [
          { id: 'true', text: 'True', correct: false },
          { id: 'false', text: 'False', correct: false },
          { id: 'not_given', text: 'Not Given', correct: false }
        ];
        break;

      case 'fill_gaps':
      case 'fill_gaps_short':
      case 'sentence_completion':
        question.inputType = 'text';
        question.maxLength = 50;
        break;

      default:
        question.inputType = 'text';
    }

    questions.push(question);
  });

  // If no questions found with the above method, try alternative parsing
  if (questions.length === 0) {
    const allQuestions = $('div[id^="question"], li.question, .question-item').toArray();
    
    allQuestions.forEach((elem, i) => {
      const $elem = $(elem);
      const question = {
        id: `q_${startNumber + i}`,
        number: startNumber + i,
        type: questionType,
        section: section,
        text: $elem.find('p, .question-text').first().text().trim() || 'Question ' + (startNumber + i),
        options: [],
        correctAnswer: null,
        points: 1,
        inputType: 'text'
      };

      questions.push(question);
    });
  }

  return questions;
}

function getContentType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'ogg': 'audio/ogg',
    'wav': 'audio/wav',
    'm4a': 'audio/mp4',
    'css': 'text/css'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// ============================================================================
// JSON PARSING HELPER FUNCTIONS
// ============================================================================

/**
 * Parse JSON exam data and extract questions
 */
function parseJsonExam(jsonData, examTitle) {
  // Validate JSON structure
  if (!jsonData || typeof jsonData !== 'object') {
    throw new Error('Invalid JSON structure');
  }

  const examData = {
    title: examTitle || jsonData.title || 'Untitled Exam',
    description: jsonData.description || '',
    type: jsonData.section ? jsonData.section.toLowerCase() : 'practice',
    duration: jsonData.duration || 60,
    questions: [],
    sections: [],
    totalQuestions: 0
  };

  // Handle different JSON structures
  let allQuestions = [];
  let sectionType = jsonData.section || 'Unknown';

  // Check if it's a Listening/Reading section with questions array
  if (jsonData.questions && Array.isArray(jsonData.questions)) {
    allQuestions = jsonData.questions;

    const sectionData = {
      name: sectionType,
      questionTypes: [...new Set(allQuestions.map(q => q.type || 'unknown'))],
      questionCount: allQuestions.length
    };

    // Add audio metadata for Listening sections
    if (sectionType.toLowerCase() === 'listening' && jsonData.audioFile) {
      sectionData.audioFile = jsonData.audioFile;
      sectionData.audioUrl = `/audio/${jsonData.audioFile}`;
      examData.audioFile = jsonData.audioFile;
      examData.audioUrl = `/audio/${jsonData.audioFile}`;
    }

    examData.sections.push(sectionData);
  }
  // Check if it's a Reading section with passages
  else if (jsonData.passages && Array.isArray(jsonData.passages)) {
    sectionType = 'Reading';
    jsonData.passages.forEach((passage, pIndex) => {
      if (passage.questions && Array.isArray(passage.questions)) {
        passage.questions.forEach(q => {
          allQuestions.push({
            ...q,
            passageNumber: passage.passageNumber || pIndex + 1,
            passageTitle: passage.title || `Passage ${pIndex + 1}`,
            passageText: passage.text || ''
          });
        });
      }
    });

    examData.sections.push({
      name: sectionType,
      questionTypes: [...new Set(allQuestions.map(q => q.type || 'unknown'))],
      questionCount: allQuestions.length
    });
  }
  // Check if it's a Writing section with tasks
  else if (jsonData.tasks && Array.isArray(jsonData.tasks)) {
    sectionType = 'Writing';
    jsonData.tasks.forEach((task, tIndex) => {
      allQuestions.push({
        id: `writing_task_${task.taskNumber || tIndex + 1}`,
        number: task.taskNumber || tIndex + 1,
        type: task.type || 'writing_task1',
        section: sectionType,
        title: task.title || `Task ${tIndex + 1}`,
        instructions: task.instructions || '',
        prompt: task.prompt || '',
        wordLimit: task.wordLimit || 150,
        timeAllocation: task.timeAllocation || 20,
        criteria: task.criteria || [],
        points: 1
      });
    });

    examData.sections.push({
      name: sectionType,
      questionTypes: [...new Set(allQuestions.map(q => q.type || 'unknown'))],
      questionCount: allQuestions.length
    });
  } else {
    throw new Error('Invalid JSON structure: must contain questions, passages, or tasks array');
  }

  // Process and validate questions
  let questionNumber = 1;
  allQuestions.forEach((q, index) => {
    const question = {
      id: q.id || `q_${questionNumber}`,
      number: q.number || questionNumber,
      type: autoDetectQuestionType(q),
      section: sectionType,
      text: q.text || q.prompt || q.instructions || '',
      points: q.points || 1
    };

    // Add question-type specific fields
    if (q.options && Array.isArray(q.options)) {
      question.options = q.options;
    }

    if (q.answer !== undefined && q.answer !== null) {
      question.correctAnswer = q.answer;
    }

    // Reading passage specific fields
    if (q.passageNumber) {
      question.passageNumber = q.passageNumber;
      question.passageTitle = q.passageTitle;
      question.passageText = q.passageText;
    }

    // Listening specific fields
    if (q.audioTimestamp) {
      question.audioTimestamp = q.audioTimestamp;
    }

    // Writing task specific fields
    if (question.type.includes('writing')) {
      question.title = q.title;
      question.instructions = q.instructions;
      question.prompt = q.prompt;
      question.wordLimit = q.wordLimit;
      question.timeAllocation = q.timeAllocation;
      question.criteria = q.criteria;
    }

    examData.questions.push(question);
    questionNumber++;
  });

  examData.totalQuestions = examData.questions.length;

  return examData;
}

/**
 * Auto-detect question type from JSON question object
 */
function autoDetectQuestionType(question) {
  const validTypes = [
    'mcq_single', 'mcq_multiple', 'fill_gaps', 'fill_gaps_short',
    'true_false_ng', 'matching', 'matching_headings', 'matching_features',
    'matching_endings', 'sentence_completion', 'summary_completion',
    'form_completion', 'note_completion', 'table_completion',
    'flowchart_completion', 'map_labelling', 'writing_task1', 'writing_task2'
  ];

  if (question.type && validTypes.includes(question.type)) {
    return question.type;
  }

  // Auto-detection based on question structure
  if (question.type && question.type.includes('writing')) {
    return question.type.includes('task2') ? 'writing_task2' : 'writing_task1';
  }

  if (question.options && Array.isArray(question.options)) {
    if (question.text && (
      question.text.toLowerCase().includes('select one') ||
      question.text.toLowerCase().includes('choose one') ||
      question.type === 'mcq_single'
    )) {
      return 'mcq_single';
    }
    return 'mcq_multiple';
  }

  if (question.answer && typeof question.answer === 'string') {
    const answerLower = question.answer.toLowerCase();
    if (['true', 'false', 'not given'].includes(answerLower)) {
      return 'true_false_ng';
    }
  }

  return 'sentence_completion';
}

// ============================================================================
// SUBMISSION MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Submit exam attempt
 */
exports.submitExam = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const { examId, studentId, answers, timeSpent } = req.body;
      
      if (!examId || !studentId || !answers) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const submissionId = uuidv4();
      
      const submission = {
        id: submissionId,
        examId,
        studentId,
        answers,
        timeSpent: timeSpent || 0,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        scored: false
      };

      await db.ref(`submissions/${submissionId}`).set(submission);

      res.status(200).json({
        success: true,
        submissionId,
        message: 'Exam submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting exam:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * Get student submissions
 */
exports.getSubmissions = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const studentId = req.query.studentId;
      
      let query = db.ref('submissions');
      if (studentId) {
        query = query.orderByChild('studentId').equalTo(studentId);
      }
      
      const snapshot = await query.once('value');
      const submissions = [];
      
      snapshot.forEach((child) => {
        submissions.push({
          id: child.key,
          ...child.val()
        });
      });
      
      res.status(200).json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

exports.healthCheck = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    res.status(200).json({ 
      status: 'ok', 
      service: 'IELTS Platform Functions',
      timestamp: new Date().toISOString()
    });
  });
});
