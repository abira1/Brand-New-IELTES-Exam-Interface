// Database Service for Firebase Realtime Database
import { database } from '../config/firebase';

// Check if Firebase is properly initialized
// Firebase database instance should be truthy (not null/undefined)
const isFirebaseEnabled = database !== null && database !== undefined;

console.log('🔧 [databaseService] Firebase database instance:', database);
console.log('🔧 [databaseService] isFirebaseEnabled:', isFirebaseEnabled);

// Mock or import Firebase database methods
let ref, set, get, push, update, remove, query, orderByChild, orderByKey, limitToLast, on, off;

if (isFirebaseEnabled) {
  console.log('✅ [databaseService] Firebase is enabled, importing Firebase database methods');
  const databaseModule = require('firebase/database');
  ref = databaseModule.ref;
  set = databaseModule.set;
  get = databaseModule.get;
  push = databaseModule.push;
  update = databaseModule.update;
  remove = databaseModule.remove;
  query = databaseModule.query;
  orderByChild = databaseModule.orderByChild;
  orderByKey = databaseModule.orderByKey;
  limitToLast = databaseModule.limitToLast;
  on = databaseModule.on;
  off = databaseModule.off;
  console.log('✅ [databaseService] Firebase database methods imported successfully');
} else {
  console.warn('⚠️ [databaseService] Firebase is NOT enabled, using mock implementations');
  // Mock implementations for development
  const mockSnapshot = {
    exists: () => false,
    val: () => null
  };

  ref = () => ({ key: 'mock-key' });
  set = () => Promise.resolve();
  get = () => Promise.resolve(mockSnapshot);
  push = () => ({ key: `mock-${Date.now()}` });
  update = () => Promise.resolve();
  remove = () => Promise.resolve();
  query = (ref) => ref;
  orderByChild = () => ({});
  orderByKey = () => ({});
  limitToLast = () => ({});
  on = () => {};
  off = () => {};
}

class DatabaseService {
  // Generic CRUD operations
  
  // Create a new record
  async create(path, data) {
    if (!isFirebaseEnabled) {
      // Return mock success for development
      const mockId = `mock-${Date.now()}`;
      return { 
        success: true, 
        id: mockId, 
        data: { ...data, id: mockId, createdAt: new Date().toISOString() } 
      };
    }
    
    try {
      const newRef = push(ref(database, path));
      await set(newRef, {
        ...data,
        id: newRef.key,
        createdAt: new Date().toISOString()
      });
      return { success: true, id: newRef.key, data };
    } catch (error) {
      console.error(`Error creating record at ${path}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Set a record at specific path
  async set(path, data) {
    if (!isFirebaseEnabled) {
      return { success: true };
    }
    
    try {
      await set(ref(database, path), data);
      return { success: true };
    } catch (error) {
      console.error(`Error setting record at ${path}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get a single record
  async get(path) {
    if (!isFirebaseEnabled) {
      return { 
        success: true, 
        exists: false,
        data: null 
      };
    }
    
    try {
      const snapshot = await get(ref(database, path));
      return { 
        success: true, 
        exists: snapshot.exists(),
        data: snapshot.val() 
      };
    } catch (error) {
      console.error(`Error getting record at ${path}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Update a record
  async update(path, updates) {
    if (!isFirebaseEnabled) {
      return { success: true };
    }
    
    try {
      await update(ref(database, path), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error(`Error updating record at ${path}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Delete a record
  async delete(path) {
    if (!isFirebaseEnabled) {
      return { success: true };
    }
    
    try {
      await remove(ref(database, path));
      return { success: true };
    } catch (error) {
      console.error(`Error deleting record at ${path}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Query records
  async query(path, orderBy, limitCount = null) {
    console.log(`🔍 [query] Starting query at path: ${path}, orderBy: ${orderBy}, limit: ${limitCount}`);
    console.log(`🔍 [query] Firebase enabled: ${isFirebaseEnabled}`);

    if (!isFirebaseEnabled) {
      console.warn(`⚠️ [query] Firebase not enabled, returning empty data`);
      return {
        success: true,
        data: {}
      };
    }

    try {
      console.log(`🔍 [query] Creating ref for path: ${path}`);
      let queryRef = ref(database, path);
      console.log(`🔍 [query] Ref created:`, queryRef);

      if (orderBy) {
        console.log(`🔍 [query] Adding orderBy: ${orderBy}`);
        if (orderBy === 'key') {
          queryRef = query(queryRef, orderByKey());
        } else {
          queryRef = query(queryRef, orderByChild(orderBy));
        }
      }

      if (limitCount) {
        console.log(`🔍 [query] Adding limit: ${limitCount}`);
        queryRef = query(queryRef, limitToLast(limitCount));
      }

      console.log(`🔍 [query] Executing query...`);
      const snapshot = await get(queryRef);
      console.log(`🔍 [query] Snapshot received`);
      console.log(`🔍 [query] Snapshot exists:`, snapshot.exists());
      console.log(`🔍 [query] Snapshot value:`, snapshot.val());

      const data = snapshot.val() || {};
      console.log(`✅ [query] Query successful, returning data:`, data);

      return {
        success: true,
        data: data
      };
    } catch (error) {
      console.error(`❌ [query] Error querying records at ${path}:`, error);
      console.error(`❌ [query] Error message:`, error.message);
      console.error(`❌ [query] Error stack:`, error.stack);
      return { success: false, error: error.message };
    }
  }

  // Real-time listener
  listen(path, callback, orderBy = null) {
    if (!isFirebaseEnabled) {
      // Mock listener - call callback with empty data
      callback(null);
      return () => {}; // Return cleanup function
    }
    
    let listenRef = ref(database, path);
    
    if (orderBy) {
      if (orderBy === 'key') {
        listenRef = query(listenRef, orderByKey());
      } else {
        listenRef = query(listenRef, orderByChild(orderBy));
      }
    }
    
    const listener = on(listenRef, 'value', (snapshot) => {
      callback(snapshot.val());
    });
    
    return () => off(listenRef, 'value', listener);
  }

  // Specific methods for IELTS platform
  
  // Exams
  async createExam(examData) {
    const examId = examData.id || push(ref(database, 'exams')).key;

    // Create light exam metadata
    const lightExam = {
      id: examId,
      title: examData.title,
      exam_type: examData.exam_type,
      duration_seconds: examData.duration_seconds,
      published: examData.published || false,
      is_visible: examData.is_visible || false,
      is_active: examData.is_active || false,
      question_count: examData.question_count || 0,
      createdAt: new Date().toISOString()
    };

    // Create full exam data
    const fullExam = {
      ...examData,
      id: examId,
      createdAt: new Date().toISOString()
    };

    try {
      // Save both versions
      await set(ref(database, `exams/${examId}`), lightExam);
      await set(ref(database, `exams_full/${examId}`), fullExam);

      return { success: true, examId, data: fullExam };
    } catch (error) {
      console.error('Error creating exam:', error);
      return { success: false, error: error.message };
    }
  }

  // Update exam status and metadata
  async updateExam(examId, updates) {
    try {
      // Update light metadata
      await update(ref(database, `exams/${examId}`), updates);

      // Also update full exam data
      await update(ref(database, `exams_full/${examId}`), updates);

      console.log(`✅ Exam ${examId} updated:`, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating exam:', error);
      return { success: false, error: error.message };
    }
  }

  // Submissions
  async createSubmission(examId, studentUid) {
    const submissionData = {
      examId,
      studentUid,
      status: 'in_progress',
      answers: {},
      startedAt: null, // Will be set by Cloud Function
      expiresAt: null, // Will be set by Cloud Function
      lastSavedAt: new Date().toISOString(),
      autoSubmitted: false,
      activityEvents: []
    };
    
    return await this.create('submissions', submissionData);
  }

  // Get available exams for student
  async getAvailableExams() {
    try {
      console.log('📚 [getAvailableExams] Fetching available exams for student...');

      // Use simple get instead of query to avoid index requirement
      const { data } = await this.get('exams');
      if (!data) {
        console.log('📚 [getAvailableExams] No exams found in database');
        return { success: true, exams: [] };
      }

      console.log('📚 [getAvailableExams] All exams from DB:', Object.keys(data).length);

      const exams = Object.values(data)
        .filter(exam => {
          const isPublished = exam.published === true;
          const isVisible = exam.is_visible === true;
          const isActive = exam.is_active === true;

          console.log(`📚 [getAvailableExams] Exam ${exam.id}:`, {
            published: isPublished,
            is_visible: isVisible,
            is_active: isActive,
            passes: isPublished && isVisible && isActive
          });

          return isPublished && isVisible && isActive;
        })
        .map(exam => ({
          id: exam.id,
          title: exam.title,
          exam_type: exam.exam_type,
          duration_seconds: exam.duration_seconds,
          question_count: exam.question_count,
          totalQuestions: exam.question_count || exam.totalQuestions,
          duration: exam.duration_seconds ? Math.ceil(exam.duration_seconds / 60) : 0,
          published: exam.published,
          is_visible: exam.is_visible,
          is_active: exam.is_active,
          createdAt: exam.createdAt
        }));

      console.log('📚 [getAvailableExams] Available exams for student:', exams.length);
      return { success: true, exams };
    } catch (error) {
      console.error('❌ [getAvailableExams] Error fetching available exams:', error);
      return { success: false, error: error.message };
    }
  }

  // Get student submissions
  async getStudentSubmissions(studentUid) {
    try {
      const { data } = await this.query('submissions');
      if (!data) return { success: true, submissions: [] };
      
      const submissions = Object.values(data).filter(sub => 
        sub.studentUid === studentUid
      );
      
      return { success: true, submissions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all students (admin)
  async getAllStudents() {
    try {
      console.log('🔍 [getAllStudents] Starting to fetch all students...');
      console.log('🔍 [getAllStudents] Firebase enabled:', isFirebaseEnabled);

      if (!isFirebaseEnabled) {
        console.warn('⚠️ [getAllStudents] Firebase not enabled, returning empty array');
        return { success: true, students: [] };
      }

      // Use simple read without ordering to avoid index requirements
      console.log('🔍 [getAllStudents] Creating ref for students path...');
      const studentsRef = ref(database, 'students');
      console.log('🔍 [getAllStudents] Ref created:', studentsRef);

      console.log('🔍 [getAllStudents] Fetching snapshot...');
      const snapshot = await get(studentsRef);
      console.log('🔍 [getAllStudents] Snapshot received');
      console.log('🔍 [getAllStudents] Snapshot exists:', snapshot.exists());

      if (!snapshot.exists()) {
        console.log('⚠️ [getAllStudents] No students found in database (snapshot does not exist)');
        return { success: true, students: [] };
      }

      const data = snapshot.val();
      console.log('📊 [getAllStudents] Raw data from Firebase:', data);
      console.log('📊 [getAllStudents] Data type:', typeof data);
      console.log('📊 [getAllStudents] Data keys:', Object.keys(data || {}));

      // Handle null/undefined data
      if (!data || typeof data !== 'object') {
        console.log('⚠️ [getAllStudents] Data is null, undefined, or not an object');
        return { success: true, students: [] };
      }

      // Convert object to array and ensure each student has required fields
      const students = Object.values(data).map(student => ({
        uid: student.uid || '',
        email: student.email || '',
        displayName: student.displayName || 'Unknown',
        photoURL: student.photoURL || null,
        status: student.status || 'pending',
        createdAt: student.createdAt || new Date().toISOString(),
        lastLogin: student.lastLogin || null,
        institution: student.institution || '',
        phone: student.phone || ''
      }));

      // Sort by createdAt in descending order (newest first)
      students.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log('✅ [getAllStudents] Successfully converted to array');
      console.log('✅ [getAllStudents] Total students:', students.length);
      console.log('✅ [getAllStudents] Students:', students);

      return { success: true, students };
    } catch (error) {
      console.error('❌ [getAllStudents] Error fetching all students:', error);
      console.error('❌ [getAllStudents] Error message:', error.message);
      console.error('❌ [getAllStudents] Error stack:', error.stack);
      return { success: false, error: error.message };
    }
  }

  // Approve/reject student
  async updateStudentStatus(studentUid, status, notes = '') {
    return await this.update(`students/${studentUid}`, {
      status,
      notes,
      reviewedAt: new Date().toISOString()
    });
  }

  // Get all exams (admin) - without ordering to avoid index requirement
  async getExams() {
    try {
      // Use simple get instead of query to avoid index requirement
      const { data } = await this.get('exams');
      if (!data) return { success: true, exams: [] };

      const exams = Object.values(data).map(exam => ({
        id: exam.id,
        title: exam.title,
        exam_type: exam.exam_type,
        duration_seconds: exam.duration_seconds,
        published: exam.published,
        is_visible: exam.is_visible,
        is_active: exam.is_active,
        question_count: exam.question_count,
        totalQuestions: exam.question_count || exam.totalQuestions,
        duration: exam.duration_seconds ? Math.ceil(exam.duration_seconds / 60) : 0,
        track_id: exam.track_id,
        createdAt: exam.createdAt
      }));

      return { success: true, exams };
    } catch (error) {
      console.error('Error fetching exams:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all submissions (admin)
  async getSubmissions(studentUid = null) {
    try {
      const { data } = await this.query('submissions', 'createdAt');
      if (!data) return { success: true, submissions: [] };

      let submissions = Object.values(data);

      // Filter by student if provided
      if (studentUid) {
        submissions = submissions.filter(sub => sub.studentUid === studentUid);
      }

      return { success: true, submissions };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return { success: false, error: error.message };
    }
  }

  // Get exam by ID with full details
  async getExamById(examId) {
    try {
      const { data } = await this.get(`exams_full/${examId}`);
      if (!data) {
        return { success: false, error: 'Exam not found' };
      }
      return { success: true, exam: data };
    } catch (error) {
      console.error('Error fetching exam:', error);
      return { success: false, error: error.message };
    }
  }

  // ==================== TRACK MANAGEMENT ====================

  // Create a new track
  async createTrack(trackData) {
    try {
      const trackId = trackData.id || this.generateId();
      const track = {
        id: trackId,
        name: trackData.name,
        description: trackData.description || '',
        difficulty: trackData.difficulty || 'intermediate',
        exams: trackData.exams || [],
        createdAt: new Date().toISOString(),
        createdBy: trackData.createdBy || 'admin',
        updatedAt: new Date().toISOString()
      };

      await set(ref(database, `exam_tracks/${trackId}`), track);
      console.log(`✅ Track ${trackId} created:`, track);
      return { success: true, trackId, track };
    } catch (error) {
      console.error('Error creating track:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all tracks
  async getTracks() {
    try {
      const snapshot = await get(ref(database, 'exam_tracks'));
      if (!snapshot.exists()) {
        return { success: true, tracks: [] };
      }
      const tracks = Object.values(snapshot.val() || {});
      console.log(`✅ Fetched ${tracks.length} tracks`);
      return { success: true, tracks };
    } catch (error) {
      console.error('Error fetching tracks:', error);
      return { success: false, error: error.message };
    }
  }

  // Get track by ID
  async getTrackById(trackId) {
    try {
      const snapshot = await get(ref(database, `exam_tracks/${trackId}`));
      if (!snapshot.exists()) {
        return { success: false, error: 'Track not found' };
      }
      return { success: true, track: snapshot.val() };
    } catch (error) {
      console.error('Error fetching track:', error);
      return { success: false, error: error.message };
    }
  }

  // Update track
  async updateTrack(trackId, updates) {
    try {
      updates.updatedAt = new Date().toISOString();
      await update(ref(database, `exam_tracks/${trackId}`), updates);
      console.log(`✅ Track ${trackId} updated:`, updates);
      return { success: true };
    } catch (error) {
      console.error('Error updating track:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete track
  async deleteTrack(trackId) {
    try {
      await remove(ref(database, `exam_tracks/${trackId}`));
      console.log(`✅ Track ${trackId} deleted`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting track:', error);
      return { success: false, error: error.message };
    }
  }

  // Add exam to track
  async addExamToTrack(examId, trackId) {
    try {
      // Get current track
      const trackResult = await this.getTrackById(trackId);
      if (!trackResult.success) {
        return trackResult;
      }

      const track = trackResult.track;
      const exams = track.exams || [];

      // Add exam if not already in track
      if (!exams.includes(examId)) {
        exams.push(examId);
        await this.updateTrack(trackId, { exams });
      }

      // Update exam with track_id
      await this.updateExam(examId, { track_id: trackId });

      console.log(`✅ Exam ${examId} added to track ${trackId}`);
      return { success: true };
    } catch (error) {
      console.error('Error adding exam to track:', error);
      return { success: false, error: error.message };
    }
  }

  // Remove exam from track
  async removeExamFromTrack(examId, trackId) {
    try {
      const trackResult = await this.getTrackById(trackId);
      if (!trackResult.success) {
        return trackResult;
      }

      const track = trackResult.track;
      const exams = (track.exams || []).filter(id => id !== examId);
      await this.updateTrack(trackId, { exams });

      // Clear track_id from exam
      await this.updateExam(examId, { track_id: null });

      console.log(`✅ Exam ${examId} removed from track ${trackId}`);
      return { success: true };
    } catch (error) {
      console.error('Error removing exam from track:', error);
      return { success: false, error: error.message };
    }
  }

  // Publish exam to track (one-click publish)
  async publishExamToTrack(examId, trackId) {
    try {
      console.log(`Publishing exam ${examId} to track ${trackId}...`);

      // Step 1: Update exam status and add track_id
      const updateResult = await this.updateExam(examId, {
        status: 'published',
        published: true,
        is_active: true,
        is_visible: true,
        track_id: trackId,
        updatedAt: new Date().toISOString()
      });

      if (!updateResult.success) {
        console.error('Failed to update exam:', updateResult.error);
        return { success: false, error: 'Failed to update exam' };
      }

      console.log(`✅ Exam ${examId} status updated`);

      // Step 2: Get current track data
      const trackResult = await this.getTrackById(trackId);
      if (!trackResult.success) {
        console.error('Failed to get track:', trackResult.error);
        return { success: false, error: 'Failed to get track' };
      }

      const track = trackResult.track;
      const exams = track.exams || [];

      // Step 3: Add exam to track's exams array if not already there
      if (!exams.includes(examId)) {
        exams.push(examId);
        console.log(`Adding exam ${examId} to track exams array:`, exams);

        const updateTrackResult = await this.updateTrack(trackId, { exams });
        if (!updateTrackResult.success) {
          console.error('Failed to update track:', updateTrackResult.error);
          return { success: false, error: 'Failed to update track' };
        }

        console.log(`✅ Track ${trackId} updated with exam ${examId}`);
      } else {
        console.log(`Exam ${examId} already in track ${trackId}`);
      }

      console.log(`✅ Exam ${examId} successfully published to track ${trackId}`);
      return { success: true };
    } catch (error) {
      console.error('Error publishing exam to track:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate unique ID
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new DatabaseService();