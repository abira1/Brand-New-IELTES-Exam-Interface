// Local Firebase Functions Emulator
// This runs the Firebase Functions locally using Express
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const Busboy = require('busboy');
const { v4: uuidv4 } = require('uuid');
const cheerio = require('cheerio');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCGTgMm-OG1ObUOjYRmIWlPFY-ZTpqsEqw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "exam-interface-shah-sultan.firebaseapp.com",
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL || "https://exam-interface-shah-sultan-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "exam-interface-shah-sultan",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "exam-interface-shah-sultan.firebasestorage.app",
};

// Initialize Firebase Admin with credentials
let db, storage;
let firebaseInitialized = false;

// Check if we have proper credentials for Firebase
const hasServiceAccount = fs.existsSync('./serviceAccountKey.json') || process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (hasServiceAccount) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      databaseURL: firebaseConfig.databaseURL,
      storageBucket: firebaseConfig.storageBucket
    });
    db = admin.database();
    storage = admin.storage();
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization error:', error.message);
    firebaseInitialized = false;
  }
}

if (!firebaseInitialized) {
  console.log('📝 No service account key found, attempting client SDK connection...');
  
  try {
    // Use Firebase client SDK as fallback
    const { initializeApp, getApps } = require('firebase/app');
    const { getDatabase, ref, get, set, update, push, remove } = require('firebase/database');
    
    // Initialize Firebase client app if not already initialized
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const database = getDatabase(app);
    console.log('✅ Firebase client SDK initialized successfully');
    
    // Create wrapper to mimic Admin SDK interface
    db = {
      ref: (path) => ({
        once: async (eventType) => {
          console.log(`Client DB: Reading from ${path}`);
          try {
            const snapshot = await get(ref(database, path));
            return {
              exists: () => snapshot.exists(),
              key: snapshot.key,
              val: () => snapshot.val(),
              forEach: (callback) => {
                if (snapshot.exists()) {
                  const data = snapshot.val();
                  if (data && typeof data === 'object') {
                    Object.keys(data).forEach(key => {
                      callback({ key, val: () => data[key] });
                    });
                  }
                }
              }
            };
          } catch (error) {
            console.error(`Error reading from ${path}:`, error);
            return {
              exists: () => false,
              key: null,
              val: () => null,
              forEach: () => {}
            };
          }
        },
        set: async (data) => {
          console.log(`Client DB: Writing to ${path}`, data);
          try {
            await set(ref(database, path), data);
            return { success: true };
          } catch (error) {
            console.error(`Error writing to ${path}:`, error);
            throw error;
          }
        },
        update: async (data) => {
          console.log(`Client DB: Updating ${path}`, data);
          try {
            await update(ref(database, path), data);
            return { success: true };
          } catch (error) {
            console.error(`Error updating ${path}:`, error);
            throw error;
          }
        },
        push: async (data) => {
          console.log(`Client DB: Pushing to ${path}`, data);
          try {
            const newRef = push(ref(database, path), data);
            return { key: newRef.key };
          } catch (error) {
            console.error(`Error pushing to ${path}:`, error);
            throw error;
          }
        },
        remove: async () => {
          console.log(`Client DB: Removing ${path}`);
          try {
            await remove(ref(database, path));
            return { success: true };
          } catch (error) {
            console.error(`Error removing ${path}:`, error);
            throw error;
          }
        }
      })
    };
    
    firebaseInitialized = true;
    console.log('🔥 Using Firebase Realtime Database via client SDK');
  } catch (error) {
    console.warn('⚠️  Firebase client SDK initialization failed:', error.message);
    console.log('📝 Falling back to mock mode...');
    
    // Create mock database and storage for testing
    // In-memory storage for mock database
    const mockData = {};
  
  db = {
    ref: (path) => ({
      once: async (eventType) => {
        console.log(`Mock DB: Reading from ${path}`);
        return {
          exists: () => {
            // Check if the exact path exists in mockData
            return mockData[path] !== undefined;
          },
          key: path.split('/').pop(),
          val: () => {
            // Return the actual stored data from mockData
            return mockData[path] || null;
          },
          forEach: (callback) => {
            // Iterate over stored data that matches the path pattern
            if (path === 'students') {
              Object.keys(mockData).forEach(key => {
                if (key.startsWith('students/')) {
                  const id = key.split('/')[1];
                  callback({ key: id, val: () => mockData[key] });
                }
              });
            } else if (path === 'exams') {
              Object.keys(mockData).forEach(key => {
                if (key.startsWith('exams/')) {
                  const id = key.split('/')[1];
                  callback({ key: id, val: () => mockData[key] });
                }
              });
            } else if (path === 'submissions') {
              Object.keys(mockData).forEach(key => {
                if (key.startsWith('submissions/')) {
                  const id = key.split('/')[1];
                  callback({ key: id, val: () => mockData[key] });
                }
              });
            } else if (path === 'exams_full') {
              Object.keys(mockData).forEach(key => {
                if (key.startsWith('exams_full/')) {
                  const id = key.split('/')[1];
                  callback({ key: id, val: () => mockData[key] });
                }
              });
            }
          }
        };
      },
      set: async (data) => {
        console.log(`Mock DB: Writing to ${path}`, data);
        mockData[path] = data;
        return { success: true };
      },
      update: async (data) => {
        console.log(`Mock DB: Updating ${path}`, data);
        if (mockData[path]) {
          mockData[path] = { ...mockData[path], ...data };
        } else {
          mockData[path] = data;
        }
        return { success: true };
      },
      remove: async () => {
        console.log(`Mock DB: Removing ${path}`);
        delete mockData[path];
        return { success: true };
      },
      orderByChild: (field) => ({
        equalTo: (value) => ({
          once: async (eventType) => ({
            forEach: (callback) => {
              // Filter stored data by the specified field and value
              Object.keys(mockData).forEach(key => {
                if (key.startsWith(path + '/')) {
                  const data = mockData[key];
                  if (data && data[field] === value) {
                    const id = key.split('/')[1];
                    callback({ key: id, val: () => data });
                  }
                }
              });
            }
          })
        })
      })
    })
  };
  
  storage = {
    bucket: () => ({
      file: (path) => ({
        save: async (data, options) => {
          console.log(`Mock Storage: Saving ${path}`);
          return { success: true };
        },
        getSignedUrl: async (options) => {
          console.log(`Mock Storage: Getting signed URL for ${path}`);
          return [`https://mock-storage.com/${path}`];
        }
      })
    })
  };
  
  // Initialize sample data for testing and demonstration
  console.log('📝 Initializing sample data for mock database...');
  
  // Sample student data
  const sampleStudents = {
    'students/demo-student-1': {
      uid: 'demo-student-1',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
      status: 'pending',
      registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      statusUpdatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    'students/demo-student-2': {
      uid: 'demo-student-2', 
      email: 'jane.smith@example.com',
      displayName: 'Jane Smith',
      status: 'approved',
      registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
      statusUpdatedAt: new Date(Date.now() - 86400000 * 3).toISOString() // 3 days ago
    },
    'students/demo-student-3': {
      uid: 'demo-student-3',
      email: 'mike.johnson@example.com', 
      displayName: 'Mike Johnson',
      status: 'approved',
      registeredAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
      statusUpdatedAt: new Date(Date.now() - 86400000 * 6).toISOString() // 6 days ago
    },
    'students/demo-student-4': {
      uid: 'demo-student-4',
      email: 'sarah.wilson@example.com',
      displayName: 'Sarah Wilson', 
      status: 'rejected',
      registeredAt: new Date(Date.now() - 86400000 * 4).toISOString(), // 4 days ago
      statusUpdatedAt: new Date(Date.now() - 86400000 * 1).toISOString() // 1 day ago
    }
  };
  
  // Add sample students to mock database
  Object.entries(sampleStudents).forEach(([key, data]) => {
    mockData[key] = data;
  });
  
  console.log(`✅ Initialized ${Object.keys(sampleStudents).length} sample students for testing`);
  }
}

// Helper Functions
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
  
  $('[connect\\:class="assessmentItemRef"]').each((i, elem) => {
    const questionId = $(elem).attr('connect:identifier');
    
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

    const questionText = $(elem).find('.question-text, .stimulus, p').first().text().trim();
    question.text = questionText || `Question ${startNumber + i}`;

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

      default:
        question.inputType = 'text';
    }

    questions.push(question);
  });

  if (questions.length === 0) {
    const allQuestions = $('div[id^="question"], li.question, .question-item').toArray();
    
    allQuestions.forEach((elem, i) => {
      const $elem = $(elem);
      const question = {
        id: `q_${startNumber + i}`,
        number: startNumber + i,
        type: questionType,
        section: section,
        text: $elem.find('p, .question-text').first().text().trim() || `Question ${startNumber + i}`,
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

// JSON PARSING HELPER FUNCTION
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
      // audioFile should be in format: "questionType/filename.ogg"
      // e.g., "Multiple Choice (one answer)/sample-audio.ogg"
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

// Auto-detect question type from JSON question object
function autoDetectQuestionType(question) {
  // If type is explicitly provided and valid, use it
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
    // MCQ detection
    if (question.text && (
      question.text.toLowerCase().includes('select one') ||
      question.text.toLowerCase().includes('choose one') ||
      question.type === 'mcq_single'
    )) {
      return 'mcq_single';
    }
    if (question.text && (
      question.text.toLowerCase().includes('select all') ||
      question.text.toLowerCase().includes('choose all') ||
      question.type === 'mcq_multiple'
    )) {
      return 'mcq_multiple';
    }
    return 'mcq_single'; // Default for options
  }

  // True/False/Not Given detection
  if (question.answer && ['True', 'False', 'Not Given', 'Yes', 'No'].includes(question.answer)) {
    return 'true_false_ng';
  }

  // Fill in the gaps detection
  if (question.text && (
    question.text.includes('_____') ||
    question.text.includes('___') ||
    question.text.toLowerCase().includes('fill in') ||
    question.text.toLowerCase().includes('complete')
  )) {
    return 'fill_gaps';
  }

  // Matching detection
  if (question.text && (
    question.text.toLowerCase().includes('match') ||
    question.text.toLowerCase().includes('pair')
  )) {
    return 'matching';
  }

  // Table/Form/Note completion
  if (question.text && question.text.toLowerCase().includes('table')) {
    return 'table_completion';
  }
  if (question.text && question.text.toLowerCase().includes('form')) {
    return 'form_completion';
  }
  if (question.text && question.text.toLowerCase().includes('note')) {
    return 'note_completion';
  }

  // Sentence completion
  if (question.text && question.text.toLowerCase().includes('sentence')) {
    return 'sentence_completion';
  }

  // Default
  return 'fill_gaps_short';
}

async function parseZipFile(zipBuffer, examTitle) {
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

  // For now, store assets as base64 URLs (in production, upload to Storage)
  const storagePrefix = `exams/${Date.now()}/`;

  for (const entry of assetFiles.images) {
    const fileName = entry.entryName.split('/').pop();
    const data = entry.getData();
    const base64 = data.toString('base64');
    const mimeType = getContentType(fileName);
    const url = `data:${mimeType};base64,${base64}`;
    examData.assets.images.push({ name: fileName, url, path: `${storagePrefix}images/${fileName}` });
  }

  for (const entry of assetFiles.audio) {
    const fileName = entry.entryName.split('/').pop();
    const data = entry.getData();
    const base64 = data.toString('base64');
    const mimeType = getContentType(fileName);
    const url = `data:${mimeType};base64,${base64}`;
    examData.assets.audio.push({ name: fileName, url, path: `${storagePrefix}audio/${fileName}` });
  }

  for (const entry of assetFiles.css) {
    const fileName = entry.entryName.split('/').pop();
    const content = entry.getData().toString('utf8');
    examData.assets.css.push({ name: fileName, content, path: `${storagePrefix}css/${fileName}` });
  }

  let questionNumber = 1;
  const sectionMap = {};

  for (const entry of xhtmlFiles) {
    const content = entry.getData().toString('utf8');
    const $ = cheerio.load(content, { xmlMode: true });
    
    const path = entry.entryName;
    let sectionType = 'Unknown';
    if (path.includes('Listening')) sectionType = 'Listening';
    else if (path.includes('Reading')) sectionType = 'Reading';
    else if (path.includes('Writing')) sectionType = 'Writing';
    
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

    const questions = parseQuestionsByType($, questionType, sectionType, questionNumber);
    
    examData.questions.push(...questions);
    questionNumber += questions.length;
    sectionMap[sectionType].questionCount += questions.length;
  }

  examData.totalQuestions = questionNumber - 1;
  examData.sections = Object.values(sectionMap);

  return examData;
}

// ============================================================================
// ROUTES
// ============================================================================

// Health Check
app.get('/healthCheck', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'IELTS Platform Functions (Local)',
    timestamp: new Date().toISOString()
  });
});

// Get Students
app.get('/getStudents', async (req, res) => {
  try {
    const snapshot = await db.ref('students').once('value');
    const students = [];
    
    snapshot.forEach((child) => {
      students.push({
        id: child.key,
        ...child.val()
      });
    });
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update Student Status
app.post('/updateStudentStatus', async (req, res) => {
  try {
    const { studentId, status } = req.body;
    
    if (!studentId || !status) {
      return res.status(400).json({ error: 'Missing studentId or status' });
    }
    
    await db.ref(`students/${studentId}`).update({
      status: status,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ 
      success: true, 
      message: `Student ${status} successfully` 
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Exams
app.get('/getExams', async (req, res) => {
  try {
    const snapshot = await db.ref('exams').once('value');
    const exams = [];
    
    snapshot.forEach((child) => {
      exams.push({
        id: child.key,
        ...child.val()
      });
    });
    
    res.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Exam By ID
app.get('/getExamById', async (req, res) => {
  try {
    const examId = req.query.id;
    
    if (!examId) {
      return res.status(400).json({ error: 'Exam ID required' });
    }
    
    const snapshot = await db.ref(`exams_full/${examId}`).once('value');
    
    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    res.json({
      id: snapshot.key,
      ...snapshot.val()
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save Exam
app.post('/saveExam', async (req, res) => {
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
    
    await db.ref(`exams/${examId}`).set(metadata);
    
    if (examData.questions) {
      await db.ref(`exams_full/${examId}`).set({
        ...metadata,
        questions: examData.questions
      });
    }
    
    res.json({ 
      success: true, 
      examId: examId,
      message: 'Exam saved successfully' 
    });
  } catch (error) {
    console.error('Error saving exam:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete Exam
app.post('/deleteExam', async (req, res) => {
  try {
    const examId = req.body.examId;
    
    if (!examId) {
      return res.status(400).json({ error: 'Exam ID required' });
    }
    
    await db.ref(`exams/${examId}`).remove();
    await db.ref(`exams_full/${examId}`).remove();
    
    res.json({ 
      success: true, 
      message: 'Exam deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload ZIP
app.post('/uploadZip', (req, res) => {
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
    
    console.log(`Processing file: ${filename}`);
    
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
      if (uploadedFiles.length === 0) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const zipFile = uploadedFiles[0];
      
      console.log('Parsing ZIP file...');
      const examData = await parseZipFile(zipFile.buffer, examTitle || 'Untitled Exam');
      
      console.log(`Parsed ${examData.totalQuestions} questions`);
      
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

      console.log(`Exam saved with ID: ${examId}`);

      res.json({
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

  req.pipe(busboy);
});

// Upload JSON
app.post('/uploadJson', (req, res) => {
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
    
    console.log(`Processing JSON file: ${filename}`);
    
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

  req.pipe(busboy);
});

// Submit Exam
app.post('/submitExam', async (req, res) => {
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

    // Automatically trigger scoring after submission
    try {
      console.log(`Auto-scoring submission ${submissionId}...`);
      await scoreSubmission(submissionId);
      console.log(`Auto-scoring completed for submission ${submissionId}`);
    } catch (scoringError) {
      console.error('Auto-scoring failed:', scoringError);
      // Don't fail the submission if scoring fails - can be done manually later
    }

    res.json({
      success: true,
      submissionId,
      message: 'Exam submitted and scored successfully'
    });
  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Submissions
app.get('/getSubmissions', async (req, res) => {
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
    
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save Exam Progress (Auto-save)
app.post('/saveProgress', async (req, res) => {
  try {
    const { examId, studentId, answers, reviewFlags, currentQuestionIndex, timeSpent, audioProgress } = req.body;
    
    if (!examId || !studentId) {
      return res.status(400).json({ error: 'Exam ID and Student ID are required' });
    }
    
    const progressId = `${examId}_${studentId}`;
    const progressData = {
      examId,
      studentId,
      answers: answers || {},
      reviewFlags: reviewFlags || [],
      currentQuestionIndex: currentQuestionIndex || 0,
      timeSpent: timeSpent || 0,
      audioProgress: audioProgress || 0, // Save audio progress
      lastSaved: new Date().toISOString(),
      status: 'in_progress'
    };

    await db.ref(`exam_progress/${progressId}`).set(progressData);

    res.json({
      success: true,
      message: 'Progress saved successfully',
      lastSaved: progressData.lastSaved
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Exam Progress
app.get('/getProgress', async (req, res) => {
  try {
    const { examId, studentId } = req.query;
    
    if (!examId || !studentId) {
      return res.status(400).json({ error: 'Exam ID and Student ID are required' });
    }
    
    const progressId = `${examId}_${studentId}`;
    const snapshot = await db.ref(`exam_progress/${progressId}`).once('value');
    
    if (snapshot.exists()) {
      res.json({
        success: true,
        progress: snapshot.val()
      });
    } else {
      res.json({
        success: true,
        progress: null
      });
    }
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear Exam Progress (after submission)
app.post('/clearProgress', async (req, res) => {
  try {
    const { examId, studentId } = req.body;
    
    if (!examId || !studentId) {
      return res.status(400).json({ error: 'Exam ID and Student ID are required' });
    }
    
    const progressId = `${examId}_${studentId}`;
    await db.ref(`exam_progress/${progressId}`).remove();

    res.json({
      success: true,
      message: 'Progress cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing progress:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================================================
// AUTOMATED SCORING SYSTEM (Phase 6)
// ============================================================================

// IELTS Band Score Conversion Tables
const IELTS_BAND_CONVERSION = {
  // Listening Section (40 questions max)
  listening: {
    39: 9.0, 37: 8.5, 35: 8.0, 32: 7.5, 30: 7.0, 26: 6.5, 23: 6.0, 18: 5.5, 16: 5.0, 13: 4.5, 10: 4.0, 8: 3.5, 6: 3.0, 4: 2.5, 3: 2.0, 2: 1.5, 1: 1.0, 0: 0.0
  },
  // Reading Section (40 questions max)
  reading: {
    39: 9.0, 37: 8.5, 35: 8.0, 33: 7.5, 30: 7.0, 27: 6.5, 23: 6.0, 19: 5.5, 15: 5.0, 13: 4.5, 10: 4.0, 8: 3.5, 6: 3.0, 4: 2.5, 3: 2.0, 2: 1.5, 1: 1.0, 0: 0.0
  }
};

// Convert raw score to IELTS band
function getRawScoreToBand(rawScore, totalQuestions, sectionType) {
  if (totalQuestions === 0) return 0.0;
  
  const conversionTable = IELTS_BAND_CONVERSION[sectionType.toLowerCase()];
  if (!conversionTable) return 0.0;
  
  // Find the closest score in the conversion table
  const scores = Object.keys(conversionTable).map(Number).sort((a, b) => b - a);
  
  for (const score of scores) {
    if (rawScore >= score) {
      return conversionTable[score];
    }
  }
  
  return 0.0;
}

// Score individual question
function scoreQuestion(question, userAnswer) {
  const result = {
    questionId: question.id,
    questionNumber: question.number,
    questionType: question.type,
    userAnswer: userAnswer,
    correctAnswer: question.correctAnswer || null,
    isCorrect: false,
    points: 0,
    maxPoints: question.points || 1,
    feedback: ''
  };

  // Skip scoring for writing tasks (manual review)
  if (question.type && question.type.includes('writing')) {
    result.feedback = 'Writing tasks require manual review by instructor.';
    result.needsManualReview = true;
    return result;
  }

  // Handle different question types
  switch (question.type) {
    case 'mcq_single':
      result.isCorrect = scoreMCQSingle(question, userAnswer);
      break;
      
    case 'mcq_multiple':
      result.isCorrect = scoreMCQMultiple(question, userAnswer);
      break;
      
    case 'true_false_ng':
      result.isCorrect = scoreTrueFalseNG(question, userAnswer);
      break;
      
    case 'fill_gaps':
    case 'fill_gaps_short':
    case 'sentence_completion':
    case 'summary_completion':
    case 'form_completion':
    case 'note_completion':
    case 'table_completion':
    case 'flowchart_completion':
      result.isCorrect = scoreFillInBlank(question, userAnswer);
      break;
      
    case 'matching':
    case 'matching_headings':
    case 'matching_features':
    case 'matching_endings':
      result.isCorrect = scoreMatching(question, userAnswer);
      break;
      
    case 'map_labelling':
      result.isCorrect = scoreMapLabelling(question, userAnswer);
      break;
      
    default:
      console.warn(`Unknown question type for scoring: ${question.type}`);
      result.isCorrect = false;
  }

  // Award points if correct
  if (result.isCorrect) {
    result.points = result.maxPoints;
    result.feedback = 'Correct!';
  } else {
    result.points = 0;
    result.feedback = `Incorrect. The correct answer is: ${question.correctAnswer || 'See answer key'}`;
  }

  return result;
}

// Scoring functions for different question types
function scoreMCQSingle(question, userAnswer) {
  if (!question.options || !userAnswer) return false;
  
  // Find correct option
  const correctOption = question.options.find(opt => opt.correct === true);
  if (!correctOption) {
    // Fallback to correctAnswer field
    return normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer);
  }
  
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctOption.id) || 
         normalizeAnswer(userAnswer) === normalizeAnswer(correctOption.text);
}

function scoreMCQMultiple(question, userAnswer) {
  if (!question.options || !userAnswer) return false;
  
  const correctOptions = question.options.filter(opt => opt.correct === true);
  if (correctOptions.length === 0) return false;
  
  const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
  const correctAnswerIds = correctOptions.map(opt => normalizeAnswer(opt.id));
  const normalizedUserAnswers = userAnswers.map(ans => normalizeAnswer(ans));
  
  // Check if arrays match (same length and same elements)
  return correctAnswerIds.length === normalizedUserAnswers.length &&
         correctAnswerIds.every(id => normalizedUserAnswers.includes(id));
}

function scoreTrueFalseNG(question, userAnswer) {
  if (!userAnswer) return false;
  return normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer);
}

function scoreFillInBlank(question, userAnswer) {
  if (!userAnswer || !question.correctAnswer) return false;
  
  const normalizedUser = normalizeAnswer(userAnswer);
  const correctAnswers = Array.isArray(question.correctAnswer) ? 
    question.correctAnswer : [question.correctAnswer];
  
  return correctAnswers.some(answer => 
    normalizeAnswer(answer) === normalizedUser
  );
}

function scoreMatching(question, userAnswer) {
  if (!userAnswer || !question.correctAnswer) return false;
  
  // For matching questions, userAnswer might be an object or array
  if (typeof userAnswer === 'object' && typeof question.correctAnswer === 'object') {
    return JSON.stringify(normalizeObject(userAnswer)) === 
           JSON.stringify(normalizeObject(question.correctAnswer));
  }
  
  return normalizeAnswer(userAnswer) === normalizeAnswer(question.correctAnswer);
}

function scoreMapLabelling(question, userAnswer) {
  return scoreFillInBlank(question, userAnswer);
}

// Normalize answer for comparison (case-insensitive, trim whitespace, etc.)
function normalizeAnswer(answer) {
  if (answer === null || answer === undefined) return '';
  return String(answer).toLowerCase().trim();
}

function normalizeObject(obj) {
  const normalized = {};
  for (const key in obj) {
    normalized[normalizeAnswer(key)] = normalizeAnswer(obj[key]);
  }
  return normalized;
}

// Main scoring function for a complete submission
async function scoreSubmission(submissionId) {
  try {
    console.log(`Starting scoring for submission: ${submissionId}`);
    
    // Get submission data
    const submissionSnapshot = await db.ref(`submissions/${submissionId}`).once('value');
    if (!submissionSnapshot.exists()) {
      throw new Error('Submission not found');
    }
    
    const submission = submissionSnapshot.val();
    const { examId, studentId, answers } = submission;
    
    // Get exam data with questions
    const examSnapshot = await db.ref(`exams_full/${examId}`).once('value');
    if (!examSnapshot.exists()) {
      throw new Error('Exam not found');
    }
    
    const exam = examSnapshot.val();
    const questions = exam.questions || [];
    
    console.log(`Scoring ${questions.length} questions for student ${studentId}`);
    
    // Score each question
    const questionResults = [];
    const sectionScores = {};
    
    for (const question of questions) {
      const userAnswer = answers[question.id] || answers[`q_${question.number}`] || null;
      const result = scoreQuestion(question, userAnswer);
      questionResults.push(result);
      
      // Aggregate by section
      const section = question.section || 'Unknown';
      if (!sectionScores[section]) {
        sectionScores[section] = {
          totalQuestions: 0,
          correctAnswers: 0,
          totalPoints: 0,
          maxPoints: 0,
          rawScore: 0,
          bandScore: 0.0,
          needsManualReview: false
        };
      }
      
      sectionScores[section].totalQuestions++;
      sectionScores[section].maxPoints += result.maxPoints;
      sectionScores[section].totalPoints += result.points;
      
      if (result.isCorrect) {
        sectionScores[section].correctAnswers++;
      }
      
      if (result.needsManualReview) {
        sectionScores[section].needsManualReview = true;
      }
    }
    
    // Calculate band scores for each section
    for (const [sectionName, sectionData] of Object.entries(sectionScores)) {
      if (sectionData.needsManualReview) {
        sectionData.bandScore = null; // Will be set manually
        sectionData.status = 'manual_review';
      } else {
        sectionData.rawScore = sectionData.correctAnswers;
        sectionData.bandScore = getRawScoreToBand(
          sectionData.correctAnswers,
          sectionData.totalQuestions,
          sectionName
        );
        sectionData.status = 'auto_scored';
      }
    }
    
    // Calculate overall band score (average of non-manual sections)
    const autoScoredSections = Object.values(sectionScores).filter(s => s.bandScore !== null);
    const overallBandScore = autoScoredSections.length > 0 ? 
      autoScoredSections.reduce((sum, s) => sum + s.bandScore, 0) / autoScoredSections.length : 0;
    
    // Round to nearest 0.5
    const roundedBandScore = Math.round(overallBandScore * 2) / 2;
    
    // Update submission with scores
    const scoringResult = {
      scored: true,
      scoredAt: new Date().toISOString(),
      sectionScores: sectionScores,
      questionResults: questionResults,
      overallBandScore: roundedBandScore,
      totalCorrect: Object.values(sectionScores).reduce((sum, s) => sum + s.correctAnswers, 0),
      totalQuestions: questions.length,
      percentage: questions.length > 0 ? 
        Math.round((Object.values(sectionScores).reduce((sum, s) => sum + s.correctAnswers, 0) / questions.length) * 100) : 0
    };
    
    await db.ref(`submissions/${submissionId}`).update(scoringResult);
    
    console.log(`Scoring completed for submission ${submissionId}. Band Score: ${roundedBandScore}`);
    
    return {
      success: true,
      submissionId,
      scoringResult
    };
    
  } catch (error) {
    console.error('Error scoring submission:', error);
    throw error;
  }
}

// Auto-scoring endpoint
app.post('/scoreSubmission', async (req, res) => {
  try {
    const { submissionId } = req.body;
    
    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID is required' });
    }
    
    const result = await scoreSubmission(submissionId);
    
    res.json({
      success: true,
      message: 'Submission scored successfully',
      data: result.scoringResult
    });
    
  } catch (error) {
    console.error('Error in score submission endpoint:', error);
    res.status(500).json({ 
      error: 'Failed to score submission',
      details: error.message
    });
  }
});

// Bulk scoring endpoint (score all unscored submissions)
app.post('/scoreAllSubmissions', async (req, res) => {
  try {
    const snapshot = await db.ref('submissions').orderByChild('scored').equalTo(false).once('value');
    const uncoredSubmissions = [];
    
    snapshot.forEach((child) => {
      uncoredSubmissions.push({ id: child.key, ...child.val() });
    });
    
    console.log(`Found ${uncoredSubmissions.length} unscored submissions`);
    
    const results = [];
    for (const submission of uncoredSubmissions) {
      try {
        const result = await scoreSubmission(submission.id);
        results.push({ submissionId: submission.id, success: true });
      } catch (error) {
        console.error(`Failed to score submission ${submission.id}:`, error);
        results.push({ submissionId: submission.id, success: false, error: error.message });
      }
    }
    
    res.json({
      success: true,
      message: `Processed ${results.length} submissions`,
      results
    });
    
  } catch (error) {
    console.error('Error in bulk scoring:', error);
    res.status(500).json({ 
      error: 'Failed to score submissions',
      details: error.message
    });
  }
});

// Serve Audio Files
// GET /audio/:questionType/:filename - Serve audio files from Listening folder
app.get('/audio/:questionType/:filename', (req, res) => {
  try {
    const { questionType, filename } = req.params;
    
    // Security: Validate parameters to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    if (!questionType || questionType.includes('..') || questionType.includes('\\')) {
      return res.status(400).json({ error: 'Invalid question type' });
    }
    
    // Only allow .ogg files
    if (!filename.endsWith('.ogg')) {
      return res.status(400).json({ error: 'Only .ogg audio files are supported' });
    }
    
    // Construct path to audio file in Listening folder
    const audioPath = path.join(__dirname, '..', 'Listening', questionType, filename);
    
    console.log(`Serving audio file: ${audioPath}`);
    
    // Check if file exists
    if (!fs.existsSync(audioPath)) {
      console.error(`Audio file not found: ${audioPath}`);
      return res.status(404).json({ error: 'Audio file not found', path: questionType + '/' + filename });
    }
    
    // Get file stats for content-length
    const stat = fs.statSync(audioPath);
    
    // Set headers for audio streaming
    res.set({
      'Content-Type': 'audio/ogg',
      'Content-Length': stat.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600'
    });
    
    // Stream the file
    const stream = fs.createReadStream(audioPath);
    stream.pipe(res);
    
  } catch (error) {
    console.error('Error serving audio file:', error);
    res.status(500).json({ error: 'Failed to serve audio file' });
  }
});

// Get Audio Info - Return metadata about available audio files
app.get('/audioInfo/:questionType/:filename', (req, res) => {
  try {
    const { questionType, filename } = req.params;
    
    // Security: Validate parameters
    if (!filename || filename.includes('..') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    if (!questionType || questionType.includes('..') || questionType.includes('\\')) {
      return res.status(400).json({ error: 'Invalid question type' });
    }
    
    const audioPath = path.join(__dirname, '..', 'Listening', questionType, filename);
    
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: 'Audio file not found' });
    }
    
    const stat = fs.statSync(audioPath);
    
    res.json({
      success: true,
      filename: filename,
      questionType: questionType,
      size: stat.size,
      url: `/audio/${questionType}/${filename}`,
      type: 'audio/ogg'
    });
    
  } catch (error) {
    console.error('Error getting audio info:', error);
    res.status(500).json({ error: 'Failed to get audio info' });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 Firebase Functions Emulator started');
  console.log(`📡 Listening on http://0.0.0.0:${PORT}`);
  console.log(`📝 Project: ${firebaseConfig.projectId}`);
  console.log('');
  console.log('Available functions:');
  console.log('  - GET  /healthCheck');
  console.log('  - GET  /getStudents');
  console.log('  - POST /updateStudentStatus');
  console.log('  - GET  /getExams');
  console.log('  - GET  /getExamById');
  console.log('  - POST /saveExam');
  console.log('  - POST /deleteExam');
  console.log('  - POST /uploadZip');
  console.log('  - POST /uploadJson');
  console.log('  - POST /submitExam');
  console.log('  - GET  /getSubmissions');
  console.log('  - POST /saveProgress');
  console.log('  - GET  /getProgress');
  console.log('  - POST /clearProgress');
  console.log('  - POST /scoreSubmission');
  console.log('  - POST /scoreAllSubmissions');
  console.log('  - GET  /audio/:questionType/:filename (Audio streaming)');
  console.log('  - GET  /audioInfo/:questionType/:filename (Audio metadata)');
});
