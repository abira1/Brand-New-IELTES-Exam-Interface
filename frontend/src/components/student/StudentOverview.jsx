// Student Overview Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  Calendar,
  Target,
  Award
} from 'lucide-react';
import databaseService from '../../services/databaseService';
import { toast } from 'sonner';

export const StudentOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [studentStats, setStudentStats] = useState({
    totalAttempts: 0,
    completedExams: 0,
    averageScore: 0,
    bestScore: 0,
    inProgressExams: 0
  });
  const [availableExams, setAvailableExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      // Load student submissions
      const submissionsResult = await databaseService.getStudentSubmissions(user.uid);
      const submissions = submissionsResult.success ? submissionsResult.submissions : [];
      
      // Load available exams
      const examsResult = await databaseService.getAvailableExams();
      const exams = examsResult.success ? examsResult.exams : [];
      
      // Calculate stats
      const completedSubmissions = submissions.filter(s => s.status === 'submitted');
      const scoredSubmissions = completedSubmissions.filter(s => s.score !== undefined);
      const inProgressCount = submissions.filter(s => s.status === 'in_progress').length;
      
      const averageScore = scoredSubmissions.length > 0 
        ? scoredSubmissions.reduce((sum, s) => sum + s.score, 0) / scoredSubmissions.length 
        : 0;
      
      const bestScore = scoredSubmissions.length > 0 
        ? Math.max(...scoredSubmissions.map(s => s.score))
        : 0;
      
      setStudentStats({
        totalAttempts: submissions.length,
        completedExams: completedSubmissions.length,
        averageScore: Math.round(averageScore * 10) / 10,
        bestScore: Math.round(bestScore * 10) / 10,
        inProgressExams: inProgressCount
      });
      
      setAvailableExams(exams.slice(0, 3)); // Show first 3 exams
      
      // Mock recent results for demonstration
      setRecentResults([
        { examTitle: 'IELTS Practice Test 1', score: 7.5, date: '2024-01-15', band: 'B2' },
        { examTitle: 'Reading Comprehension Set A', score: 8.0, date: '2024-01-10', band: 'C1' },
        { examTitle: 'Listening Skills Test', score: 6.5, date: '2024-01-05', band: 'B2' }
      ]);
      
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const getBandColor = (score) => {
    if (score >= 8.5) return 'bg-green-500';
    if (score >= 7.0) return 'bg-blue-500';
    if (score >= 6.0) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!
            </h1>
            <p className="text-indigo-100 text-lg">
              Ready to continue your IELTS preparation journey?
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <Trophy className="h-12 w-12 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Attempts</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{studentStats.totalAttempts}</div>
            <p className="text-xs text-gray-500 mt-1">
              {studentStats.completedExams} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{studentStats.averageScore}</div>
            <p className="text-xs text-gray-500 mt-1">
              Out of 9.0 band score
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Best Score</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{studentStats.bestScore}</div>
            <p className="text-xs text-gray-500 mt-1">
              Personal best
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{studentStats.inProgressExams}</div>
            <p className="text-xs text-gray-500 mt-1">
              Unfinished exams
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="mr-2 h-5 w-5 text-indigo-600" />
              Available Exams
            </CardTitle>
            <CardDescription>Start a new practice test</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableExams.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No exams are currently available. Please check back later or contact your administrator.
                  </AlertDescription>
                </Alert>
              ) : (
                availableExams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{exam.title}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {Math.round(exam.duration_seconds / 60)} min
                        </span>
                        <Badge variant="secondary">{exam.exam_type}</Badge>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleStartExam(exam.id)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Start
                    </Button>
                  </div>
                ))
              )}
              
              {availableExams.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/student/exams')}
                >
                  View All Exams
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
              Recent Results
            </CardTitle>
            <CardDescription>Your latest exam performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>No results yet</p>
                  <p className="text-sm">Complete an exam to see your results here</p>
                </div>
              ) : (
                recentResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{result.examTitle}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{result.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getBandColor(result.score)}`}>
                        {result.score}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{result.band}</p>
                    </div>
                  </div>
                ))
              )}
              
              {recentResults.length > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate('/student/results')}
                >
                  View All Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your IELTS preparation journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-500">{studentStats.completedExams}/10 exams</span>
              </div>
              <Progress value={(studentStats.completedExams / 10) * 100} className="mb-4" />
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Target Score Progress</span>
                <span className="text-sm text-gray-500">{studentStats.averageScore}/8.0</span>
              </div>
              <Progress value={(studentStats.averageScore / 8.0) * 100} className="mb-4" />
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Next Milestone</h4>
                <p className="text-sm text-blue-700">
                  Complete 2 more exams to unlock advanced practice materials.
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Recommendation</h4>
                <p className="text-sm text-green-700">
                  Focus on listening skills to improve your overall band score.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentOverview;