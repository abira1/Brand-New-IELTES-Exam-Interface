// My Results Component
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Download,
  Calendar,
  Target,
  TrendingUp,
  Award,
  RefreshCw,
  AlertCircle,
  Headphones,
  BookOpen,
  PenTool
} from 'lucide-react';
import databaseService from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';

export const MyResults = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if we're coming from a successful submission
  const justSubmitted = location.state?.submitted;
  const submissionId = location.state?.submissionId;

  useEffect(() => {
    loadResults();
  }, [user]);

  const loadResults = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const result = await databaseService.getStudentSubmissions(user.uid);

      if (result.success) {
        // Sort by submission date (newest first)
        const sortedSubmissions = (result.submissions || []).sort((a, b) =>
          new Date(b.submittedAt) - new Date(a.submittedAt)
        );
        setSubmissions(sortedSubmissions);
        setError(null);
      } else {
        setError(result.error || 'Failed to load results');
      }
    } catch (err) {
      setError('Error loading results: ' + err.message);
    } finally {
      setLoading(false);
    }
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

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSectionIcon = (sectionName) => {
    switch (sectionName?.toLowerCase()) {
      case 'listening': return <Headphones className="h-4 w-4" />;
      case 'reading': return <BookOpen className="h-4 w-4" />;
      case 'writing': return <PenTool className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const calculateTotalScore = (submission) => {
    if (!submission.sectionScores) return { score: 0, maxScore: 0 };
    
    return Object.values(submission.sectionScores).reduce(
      (total, section) => ({
        score: total.score + (section.totalPoints || section.correctAnswers || 0),
        maxScore: total.maxScore + (section.maxPoints || section.totalQuestions || 0)
      }),
      { score: 0, maxScore: 0 }
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Results</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
        <Button onClick={loadResults} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Success Alert for just submitted exams */}
      {justSubmitted && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Exam submitted successfully!</strong> Your results will be processed and scored shortly.
            {submissionId && (
              <div className="mt-1 text-sm opacity-75">
                Submission ID: {submissionId}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't submitted any exams yet. Take your first exam to see results here.
            </p>
            <Button onClick={() => window.location.href = '/student/exams'}>
              Browse Available Exams
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Results Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{submissions.length}</div>
                  <div className="text-sm text-gray-600">Exams Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {submissions.filter(s => s.scored).length}
                  </div>
                  <div className="text-sm text-gray-600">Results Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      submissions.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / 60
                    )}m
                  </div>
                  <div className="text-sm text-gray-600">Total Study Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {submissions.filter(s => s.scored).length > 0 ? 
                      Math.round(
                        submissions
                          .filter(s => s.scored && s.sectionScores)
                          .map(s => calculateTotalScore(s))
                          .reduce((sum, score) => sum + (score.score / score.maxScore) * 100, 0) /
                        submissions.filter(s => s.scored).length
                      ) : 0
                    }%
                  </div>
                  <div className="text-sm text-gray-600">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results List */}
          <div className="space-y-4">
            {submissions.map((submission) => {
              const totalScore = calculateTotalScore(submission);
              const scorePercentage = totalScore.maxScore > 0 ? 
                (totalScore.score / totalScore.maxScore) * 100 : 0;

              return (
                <Card key={submission.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">
                          {submission.examTitle || 'Untitled Exam'}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(submission.submittedAt)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDuration(submission.timeSpent || 0)}
                          </div>
                          <div className="flex items-center">
                            <FileText className="mr-1 h-3 w-3" />
                            {Object.keys(submission.answers || {}).length} answers
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {submission.scored ? (
                          <div>
                            {submission.overallBandScore ? (
                              <div>
                                <div className="text-2xl font-bold text-indigo-600">
                                  Band {submission.overallBandScore}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {submission.totalCorrect || totalScore.score}/{submission.totalQuestions || totalScore.maxScore}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className={`text-2xl font-bold ${getScoreColor(totalScore.score, totalScore.maxScore)}`}>
                                  {totalScore.score}/{totalScore.maxScore}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {Math.round(scorePercentage)}%
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary">
                            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                            Processing
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {submission.scored && submission.sectionScores ? (
                      <div>
                        {/* Overall Band Score */}
                        {submission.overallBandScore && (
                          <div className="bg-indigo-50 rounded-lg p-4 mb-4 text-center">
                            <div className="text-3xl font-bold text-indigo-600 mb-1">
                              Band {submission.overallBandScore}
                            </div>
                            <div className="text-sm text-indigo-700">
                              Overall IELTS Band Score
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {submission.totalCorrect || 0}/{submission.totalQuestions || 0} correct ({submission.percentage || 0}%)
                            </div>
                          </div>
                        )}

                        {/* Section Scores */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          {Object.entries(submission.sectionScores).map(([section, score]) => (
                            <div key={section} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getSectionIcon(section)}
                                  <span className="font-medium text-sm">{section}</span>
                                </div>
                                <div className="text-right">
                                  {score.needsManualReview ? (
                                    <Badge variant="secondary" className="text-xs">
                                      Manual Review
                                    </Badge>
                                  ) : (
                                    <div>
                                      <div className="text-sm font-semibold text-indigo-600">
                                        Band {score.bandScore || 0}
                                      </div>
                                      <div className="text-xs text-gray-600">
                                        {score.correctAnswers || 0}/{score.totalQuestions || 0}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Progress 
                                value={score.totalQuestions > 0 ? (score.correctAnswers / score.totalQuestions) * 100 : 0} 
                                className="h-2"
                              />
                              {score.status && (
                                <div className="text-xs text-gray-500 mt-1 capitalize">
                                  {score.status.replace('_', ' ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            View Detailed Report
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download Certificate
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <RefreshCw className="mx-auto h-6 w-6 animate-spin mb-2" />
                        <p className="text-sm">Results are being processed...</p>
                        <p className="text-xs">This usually takes a few minutes.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyResults;