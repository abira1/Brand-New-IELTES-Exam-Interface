// Firebase Functions API Service
// This service handles communication with Firebase Cloud Functions

const FUNCTIONS_REGION = 'us-central1'; // Default Firebase Functions region
const PROJECT_ID = 'exam-interface-shah-sultan';

// Get Firebase Functions URL
const getFunctionsUrl = (functionName) => {
  // Development: Use proxy to connect to local backend (port 5001)
  if (process.env.NODE_ENV === 'development' && window.location.hostname === 'localhost') {
    return `/functions/${functionName}`;
  }

  // Production: Use backend URL from environment or Firebase Cloud Functions
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  if (backendUrl) {
    // If backend URL is configured, use it
    return `${backendUrl}/${functionName}`;
  }

  // Fallback: Try Firebase Cloud Functions (requires Blaze plan)
  return `https://us-central1-${PROJECT_ID}.cloudfunctions.net/${functionName}`;
};

class FunctionsService {
  constructor() {
    this.baseUrl = '';
  }

  /**
   * Upload ZIP file for exam import
   */
  async uploadZip(zipFile, examTitle, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('file', zipFile);
      formData.append('examTitle', examTitle);

      const url = getFunctionsUrl('uploadZip');

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - browser will set it with boundary for multipart
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error uploading ZIP:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload JSON file for exam import
   */
  async uploadJson(jsonFile, examTitle) {
    try {
      const formData = new FormData();
      formData.append('file', jsonFile);
      formData.append('examTitle', examTitle);

      const url = getFunctionsUrl('uploadJson');

      console.log('📤 [uploadJson] Starting JSON upload...');
      console.log('📤 [uploadJson] URL:', url);
      console.log('📤 [uploadJson] File:', jsonFile.name, 'Size:', jsonFile.size, 'bytes');
      console.log('📤 [uploadJson] Exam Title:', examTitle);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      console.log('📤 [uploadJson] Response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('📤 [uploadJson] Response headers:', {
        'content-type': contentType,
        'content-length': response.headers.get('content-length')
      });

      if (!response.ok) {
        let errorMessage = 'Upload failed';

        try {
          // Check content-type BEFORE reading body to avoid "body already used" error
          if (contentType && contentType.includes('application/json')) {
            try {
              const error = await response.json();
              errorMessage = error.error || error.message || 'Upload failed';
            } catch (jsonError) {
              console.error('❌ [uploadJson] Failed to parse JSON error response:', jsonError);
              errorMessage = `Backend error (HTTP ${response.status}): Failed to parse error response`;
            }
          } else if (contentType && contentType.includes('text/html')) {
            // Backend is returning HTML error page
            console.error('❌ [uploadJson] Backend returned HTML instead of JSON');

            // Check for 504 Gateway Timeout
            if (response.status === 504) {
              errorMessage = `Backend timeout (HTTP 504): The server took too long to process the request. This may indicate the Firebase write is slow. Please try again.`;
            } else {
              errorMessage = `Backend error (HTTP ${response.status}): Backend server may not be running or endpoint not found. Check if functions/server.js is running on port 5001.`;
            }
          } else {
            // Unknown content type - try to read as text
            try {
              const text = await response.text();
              console.error('❌ [uploadJson] Unexpected response:', text.substring(0, 500));
              errorMessage = `Backend error (HTTP ${response.status}): ${text.substring(0, 200)}`;
            } catch (textError) {
              errorMessage = `Backend error (HTTP ${response.status}): Unable to read response`;
            }
          }
        } catch (parseError) {
          console.error('❌ [uploadJson] Error handling error response:', parseError);
          errorMessage = `Backend error (HTTP ${response.status}): ${parseError.message}`;
        }

        throw new Error(errorMessage);
      }

      // Success response - parse JSON
      try {
        const result = await response.json();
        console.log('✅ [uploadJson] Upload successful:', result);
        return { success: true, data: result };
      } catch (jsonError) {
        console.error('❌ [uploadJson] Failed to parse success response:', jsonError);
        throw new Error('Failed to parse server response');
      }
    } catch (error) {
      console.error('❌ [uploadJson] Error uploading JSON:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all exams
   */
  async getExams() {
    try {
      const url = getFunctionsUrl('getExams');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      
      const exams = await response.json();
      return { success: true, exams };
    } catch (error) {
      console.error('Error fetching exams:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get exam by ID with full details
   */
  async getExamById(examId) {
    try {
      const url = getFunctionsUrl('getExamById') + `?id=${examId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch exam');
      }
      
      const exam = await response.json();
      return { success: true, exam };
    } catch (error) {
      console.error('Error fetching exam:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save exam data
   */
  async saveExam(examData) {
    try {
      const url = getFunctionsUrl('saveExam');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save exam');
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error saving exam:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete exam
   */
  async deleteExam(examId) {
    try {
      const url = getFunctionsUrl('deleteExam');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete exam');
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error deleting exam:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Submit exam answers
   */
  async submitExam(examId, studentId, answers, timeSpent) {
    try {
      const url = getFunctionsUrl('submitExam');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId,
          studentId,
          answers,
          timeSpent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error submitting exam:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get student submissions
   */
  async getSubmissions(studentId = null) {
    try {
      let url = getFunctionsUrl('getSubmissions');
      if (studentId) {
        url += `?studentId=${studentId}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const submissions = await response.json();
      return { success: true, submissions };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all students (uses Firebase Functions)
   */
  async getStudents() {
    try {
      const url = getFunctionsUrl('getStudents');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const students = await response.json();
      return { success: true, students };
    } catch (error) {
      console.error('Error fetching students:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update student status (uses Firebase Functions)
   */
  async updateStudentStatus(studentId, status) {
    try {
      const url = getFunctionsUrl('updateStudentStatus');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update student status');
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating student status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save exam progress (auto-save)
   */
  async saveProgress(examId, studentId, answers, reviewFlags = [], currentQuestionIndex = 0, timeSpent = 0, audioProgress = 0) {
    try {
      const url = getFunctionsUrl('saveProgress');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId,
          studentId,
          answers,
          reviewFlags: Array.from(reviewFlags), // Convert Set to Array
          currentQuestionIndex,
          timeSpent,
          audioProgress, // Add audio progress
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error saving progress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get exam progress
   */
  async getProgress(examId, studentId) {
    try {
      const url = getFunctionsUrl('getProgress') + `?examId=${examId}&studentId=${studentId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to get progress');
      }
      
      const result = await response.json();
      return { success: true, progress: result.progress };
    } catch (error) {
      console.error('Error getting progress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear exam progress
   */
  async clearProgress(examId, studentId) {
    try {
      const url = getFunctionsUrl('clearProgress');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ examId, studentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear progress');
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error clearing progress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Score a specific submission manually
   */
  async scoreSubmission(submissionId) {
    try {
      const url = getFunctionsUrl('scoreSubmission');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ submissionId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Scoring failed');
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error scoring submission:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Score all unscored submissions
   */
  async scoreAllSubmissions() {
    try {
      const url = getFunctionsUrl('scoreAllSubmissions');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bulk scoring failed');
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Error in bulk scoring:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const url = getFunctionsUrl('healthCheck');
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Health check failed');
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Health check error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new FunctionsService();
