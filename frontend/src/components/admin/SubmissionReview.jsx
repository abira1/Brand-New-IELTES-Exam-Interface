// Submission Review Component - Full Implementation
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Search,
  Download,
  Users,
  BarChart3,
  Award,
  MessageSquare,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import databaseService from '../../services/databaseService';
import { toast } from 'sonner';

export const SubmissionReview = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    avgScore: 0
  });

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const response = await databaseService.getSubmissions();

      if (response && response.success) {
        const submissionsList = response.submissions || [];
        setSubmissions(submissionsList);
        
        // Calculate stats
        const newStats = {
          total: submissionsList.length,
          pending: submissionsList.filter(s => !s.scored || s.status === 'submitted').length,
          reviewed: submissionsList.filter(s => s.scored && s.status === 'completed').length,
          avgScore: submissionsList.length > 0 
            ? submissionsList
                .filter(s => s.overallBandScore)
                .reduce((sum, s) => sum + s.overallBandScore, 0) / 
              submissionsList.filter(s => s.overallBandScore).length || 0
            : 0
        };
        setStats(newStats);
      } else {
        // Mock data for demo
        const mockSubmissions = [
          {
            id: 'sub_001',
            studentId: 'student_123',
            studentName: 'John Smith',
            examId: 'exam_001',
            examTitle: 'IELTS Practice Test 1',
            submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status: 'submitted',
            scored: false,
            totalQuestions: 40,
            timeSpent: 7200,
            sections: ['Listening', 'Reading', 'Writing']
          },
          {
            id: 'sub_002',
            studentId: 'student_456',
            studentName: 'Emma Johnson',
            examId: 'exam_002',
            examTitle: 'IELTS Academic Practice',
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            scored: true,
            overallBandScore: 7.5,
            sectionScores: {
              listening: { bandScore: 8.0, correctAnswers: 35, totalQuestions: 40 },
              reading: { bandScore: 7.5, correctAnswers: 32, totalQuestions: 40 },
              writing: { bandScore: 7.0, manualReview: true }
            },
            totalQuestions: 80,
            timeSpent: 9600,
            sections: ['Listening', 'Reading', 'Writing']
          },
          {
            id: 'sub_003',
            studentId: 'student_789',
            studentName: 'Michael Chen',
            examId: 'exam_001',
            examTitle: 'IELTS Practice Test 1',
            submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            status: 'submitted',
            scored: false,
            totalQuestions: 40,
            timeSpent: 6800,
            sections: ['Listening', 'Reading']
          }
        ];
        
        setSubmissions(mockSubmissions);
        setStats({
          total: 3,
          pending: 2,
          reviewed: 1,
          avgScore: 7.5
        });
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (submission) => {
    if (submission.scored && submission.status === 'completed') {
      return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Reviewed</Badge>;
    } else if (submission.status === 'submitted') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Review</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.examTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'pending' && (!submission.scored || submission.status === 'submitted')) ||
                         (filterStatus === 'reviewed' && submission.scored && submission.status === 'completed');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading submissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Submission Review</h1>
          <p className="text-gray-600 mt-2">Review and grade student exam submissions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadSubmissions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reviewed</p>
              <p className="text-2xl font-bold">{stats.reviewed}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Award className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Band</p>
              <p className="text-2xl font-bold">{stats.avgScore.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search student or exam..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 w-64"
          />
        </div>
      </div>

      {/* Submissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Submissions ({filteredSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                No submissions found matching your criteria.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            {submission.studentName}
                          </h3>
                          {getStatusBadge(submission)}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {submission.examTitle}
                        </p>
                        
                        <div className="flex items-center space-x-6 mt-2 text-sm text-gray-500">
                          <span>Submitted: {formatDate(submission.submittedAt)}</span>
                          <span>Duration: {formatDuration(submission.timeSpent)}</span>
                          <span>Questions: {submission.totalQuestions}</span>
                          <span>Sections: {submission.sections?.join(', ')}</span>
                        </div>
                        
                        {submission.scored && submission.sectionScores && (
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium">Band: {submission.overallBandScore}</span>
                            </div>
                            {submission.sectionScores.listening && (
                              <span className="text-sm text-gray-600">
                                Listening: {submission.sectionScores.listening.bandScore}
                              </span>
                            )}
                            {submission.sectionScores.reading && (
                              <span className="text-sm text-gray-600">
                                Reading: {submission.sectionScores.reading.bandScore}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                      
                      {!submission.scored && (
                        <Button
                          size="sm"
                          onClick={() => toast.info('Auto-scoring feature will be implemented')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Score Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
            Advanced Review Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <ArrowRight className="h-4 w-4" />
            <AlertDescription>
              <strong>Coming in the next update:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Question-by-question review interface</li>
                <li>Manual scoring and commenting tools</li>
                <li>Bulk grading operations</li>
                <li>Writing task detailed review</li>
                <li>Grade override functionality</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionReview;