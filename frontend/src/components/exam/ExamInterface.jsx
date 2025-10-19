// Exam Interface Component - Authentic IELTS Layout
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  SkipBack, 
  SkipForward, 
  Clock, 
  CheckSquare, 
  Square,
  Flag,
  ArrowLeft,
  ArrowRight,
  Save,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import functionsService from '../../services/functionsService';
import databaseService from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';
import { QuestionRenderer } from './QuestionRenderer';
import { AudioPlayer } from './AudioPlayer';

export const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Exam state
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState(null);
  const [navigationVisible, setNavigationVisible] = useState(true);
  
  // Answer state
  const [answers, setAnswers] = useState({});
  const [reviewFlags, setReviewFlags] = useState(new Set());
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStartTime, setExamStartTime] = useState(null);
  
  // Audio state
  const [audioProgress, setAudioProgress] = useState(0);
  
  // Auto-save state
  const [lastSaved, setLastSaved] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'

  // Load exam data
  useEffect(() => {
    if (examId) {
      loadExam();
    }
  }, [examId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && examStartTime) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, examStartTime]);

  // Auto-save effect
  useEffect(() => {
    if (exam && Object.keys(answers).length > 0) {
      const autoSaveTimer = setTimeout(() => {
        autoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(autoSaveTimer);
    }
  }, [answers, exam]);

  const loadExam = async () => {
    try {
      setLoading(true);
      console.log('🎯 [ExamInterface] Loading exam:', examId);

      // Try to get exam from backend first, fallback to Firebase if backend fails
      let result;
      try {
        console.log('🎯 [ExamInterface] Attempting to fetch from backend...');
        result = await functionsService.getExamById(examId);
        console.log('🎯 [ExamInterface] Backend response:', result.success ? 'Success' : 'Failed');
      } catch (backendError) {
        console.warn('⚠️  [ExamInterface] Backend failed, falling back to Firebase:', backendError.message);
        // Fallback to Firebase if backend fails
        result = await databaseService.getExamById(examId);
      }

      if (result.success) {
        const examData = result.exam;
        console.log('🎯 [ExamInterface] Exam loaded successfully:', examData.id);
        setExam(examData);

        // Try to load existing progress
        console.log('🎯 [ExamInterface] Loading progress for student:', user.uid);
        const progressResult = await functionsService.getProgress(examId, user.uid);

        if (progressResult.success && progressResult.progress) {
          // Restore progress
          const progress = progressResult.progress;
          setAnswers(progress.answers || {});
          setReviewFlags(new Set(progress.reviewFlags || []));
          setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
          setAudioProgress(progress.audioProgress || 0); // Restore audio progress

          // Calculate remaining time
          const totalDuration = examData.duration ? examData.duration * 60 : 10800;
          const timeSpent = progress.timeSpent || 0;
          setTimeLeft(Math.max(0, totalDuration - timeSpent));
          setExamStartTime(new Date(Date.now() - (timeSpent * 1000)));

          console.log('✅ [ExamInterface] Progress restored:', {
            answers: Object.keys(progress.answers || {}).length,
            currentQuestion: progress.currentQuestionIndex,
            timeSpent: timeSpent,
            audioProgress: progress.audioProgress || 0
          });
        } else {
          // New exam session
          console.log('✅ [ExamInterface] New exam session started');
          setTimeLeft(examData.duration ? examData.duration * 60 : 10800);
          setExamStartTime(new Date());
        }

        // Initialize current section
        if (examData.sections && examData.sections.length > 0) {
          setCurrentSection(examData.sections[0].name);
        }

        setError(null);
      } else {
        console.error('❌ [ExamInterface] Failed to load exam:', result.error);
        setError(result.error || 'Failed to load exam');
      }
    } catch (err) {
      console.error('❌ [ExamInterface] Error loading exam:', err);
      setError('Error loading exam: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async () => {
    if (!exam || !examStartTime) return;

    try {
      setSaveStatus('saving');
      const timeSpent = Math.floor((new Date() - examStartTime) / 1000);
      
      const result = await functionsService.saveProgress(
        examId, 
        user.uid, 
        answers, 
        reviewFlags, 
        currentQuestionIndex, 
        timeSpent,
        audioProgress // Include audio progress
      );
      
      if (result.success) {
        setLastSaved(new Date());
        setSaveStatus('saved');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleReviewToggle = (questionIndex) => {
    setReviewFlags(prev => {
      const newFlags = new Set(prev);
      if (newFlags.has(questionIndex)) {
        newFlags.delete(questionIndex);
      } else {
        newFlags.add(questionIndex);
      }
      return newFlags;
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleTimeUp = () => {
    // Auto-submit when time is up
    handleSubmit(true);
  };

  const handleSubmit = async (timeUp = false) => {
    const confirmMessage = timeUp 
      ? 'Time is up! Your exam will be submitted automatically.'
      : 'Are you sure you want to submit your exam? This action cannot be undone.';
    
    if (timeUp || window.confirm(confirmMessage)) {
      try {
        const totalTimeSpent = exam.duration ? (exam.duration * 60) - timeLeft : 0;
        
        // Submit the exam
        const submitResult = await functionsService.submitExam(
          examId,
          user.uid,
          answers,
          totalTimeSpent
        );
        
        if (submitResult.success) {
          // Clear progress after successful submission
          await functionsService.clearProgress(examId, user.uid);
          
          navigate('/student/results', { 
            state: { 
              examId, 
              submitted: true,
              timeUp,
              submissionId: submitResult.data.submissionId
            } 
          });
        } else {
          throw new Error(submitResult.error);
        }
      } catch (error) {
        console.error('Submission failed:', error);
        alert('Failed to submit exam. Please try again.');
      }
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index) => {
    const question = exam.questions[index];
    const hasAnswer = answers[question.id] !== undefined && answers[question.id] !== '';
    const isReviewed = reviewFlags.has(index);
    
    if (isReviewed) return 'review';
    if (hasAnswer) return 'answered';
    return 'unanswered';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'review': return 'bg-yellow-500 text-white';
      case 'current': return 'bg-blue-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 flex gap-2">
              <Button onClick={loadExam} variant="outline" className="flex-1">
                Retry
              </Button>
              <Button onClick={() => navigate('/student/exams')} className="flex-1">
                Back to Exams
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!exam || !exam.questions || exam.questions.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This exam has no questions available.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate('/student/exams')} 
              className="w-full mt-4"
            >
              Back to Exams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* IELTS Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/images/ielts-logo.png" 
                alt="IELTS" 
                className="h-8"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="text-sm">
                <span className="font-medium">Candidate: {user?.displayName || 'Student'}</span>
                <span className="mx-2">-</span>
                <span>ID: {user?.uid?.slice(-6).toUpperCase()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Timer */}
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-sm opacity-75">minutes left</span>
              </div>
              
              {/* Save Status */}
              <div className="flex items-center space-x-2 text-sm">
                <Save className={`h-4 w-4 ${saveStatus === 'saving' ? 'animate-spin' : ''}`} />
                <span className={saveStatus === 'error' ? 'text-red-300' : 'text-green-300'}>
                  {saveStatus === 'saved' && lastSaved ? 
                    `Saved ${lastSaved.toLocaleTimeString()}` : 
                    saveStatus === 'saving' ? 'Saving...' : 
                    saveStatus === 'error' ? 'Save failed' : 'Auto-save'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Player (for Listening sections) */}
      {exam?.audioUrl && currentSection?.toLowerCase() === 'listening' && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <AudioPlayer 
              audioUrl={exam.audioUrl}
              onProgressChange={setAudioProgress}
              initialTime={audioProgress}
            />
          </div>
        </div>
      )}

      <div className="flex h-full">
        {/* Navigation Sidebar */}
        {navigationVisible && (
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Navigation</h3>
              <Progress value={progress} className="mb-2" />
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </p>
            </div>

            {/* Section Navigation */}
            {exam.sections && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Sections</h4>
                <div className="space-y-1">
                  {exam.sections.map((section, index) => (
                    <div 
                      key={index}
                      className={`text-sm p-2 rounded ${
                        section.name === currentSection 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'text-gray-600'
                      }`}
                    >
                      {section.name} ({section.questionCount})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-1">
              {exam.questions.map((question, index) => {
                const status = index === currentQuestionIndex ? 'current' : getQuestionStatus(index);
                return (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionJump(index)}
                    className={`
                      w-10 h-10 text-sm font-medium rounded transition-colors
                      ${getStatusColor(status)}
                      hover:opacity-80
                    `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 text-xs space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Flagged for review</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <span>Not answered</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <QuestionRenderer
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswerChange={handleAnswerChange}
                examType={exam.type}
                sectionName={currentSection}
              />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setNavigationVisible(!navigationVisible)}
                >
                  {navigationVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {navigationVisible ? 'Hide' : 'Show'} Navigation
                </Button>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewFlags.has(currentQuestionIndex)}
                    onChange={() => handleReviewToggle(currentQuestionIndex)}
                    className="form-checkbox h-4 w-4 text-yellow-600"
                  />
                  <Flag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Flag for review</span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentQuestionIndex === exam.questions.length - 1 ? (
                  <Button onClick={() => handleSubmit()} className="bg-red-600 hover:bg-red-700">
                    Submit Exam
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamInterface;