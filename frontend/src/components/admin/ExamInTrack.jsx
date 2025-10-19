import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, CheckCircle, AlertCircle, Loader2, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from '../ui/sonner';
import databaseService from '../../services/databaseService';

export default function ExamInTrack({ track, onTrackUpdated }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingExamId, setUpdatingExamId] = useState(null);
  const [removingExamId, setRemovingExamId] = useState(null);

  useEffect(() => {
    fetchExamsInTrack();
  }, [track.id]);

  const fetchExamsInTrack = async () => {
    setLoading(true);
    try {
      // Get all exams
      const examsResponse = await databaseService.getExams();
      if (!examsResponse.success) {
        console.error('Failed to fetch exams');
        setExams([]);
        return;
      }

      const allExams = examsResponse.exams || [];
      console.log('All exams:', allExams);
      console.log('Track exams array:', track.exams);

      // Get exams that are in this track's exams array
      const trackExams = allExams.filter(exam =>
        track.exams && track.exams.includes(exam.id)
      );

      console.log('Filtered track exams:', trackExams);
      setExams(trackExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (examId, currentVisibility) => {
    setUpdatingExamId(examId);
    try {
      const response = await databaseService.updateExam(examId, {
        is_visible: !currentVisibility
      });
      if (response.success) {
        toast.success(
          !currentVisibility ? '✅ Exam is now visible to students' : '✅ Exam is now hidden'
        );
        fetchExamsInTrack();
      } else {
        toast.error('Failed to update exam visibility');
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Error updating exam');
    } finally {
      setUpdatingExamId(null);
    }
  };

  const handleToggleActive = async (examId, currentActive) => {
    setUpdatingExamId(examId);
    try {
      const response = await databaseService.updateExam(examId, {
        is_active: !currentActive
      });
      if (response.success) {
        toast.success(
          !currentActive ? '✅ Exam is now active' : '✅ Exam is now inactive'
        );
        fetchExamsInTrack();
      } else {
        toast.error('Failed to update exam status');
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Error updating exam');
    } finally {
      setUpdatingExamId(null);
    }
  };

  const handleRemoveExam = async (examId) => {
    if (!window.confirm('Remove this exam from the track?')) {
      return;
    }

    setRemovingExamId(examId);
    try {
      const response = await databaseService.removeExamFromTrack(examId, track.id);
      if (response.success) {
        toast.success('Exam removed from track');
        fetchExamsInTrack();
        onTrackUpdated();
      } else {
        toast.error('Failed to remove exam');
      }
    } catch (error) {
      console.error('Error removing exam:', error);
      toast.error('Error removing exam');
    } finally {
      setRemovingExamId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {exams.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No exams in this track yet. Add exams from the Exam Management section.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{exam.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {exam.totalQuestions} questions • {exam.duration} minutes
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={exam.published ? 'default' : 'secondary'}>
                      {exam.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Status Indicators */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    {exam.is_active ? (
                      <><CheckCircle className="h-4 w-4 text-green-600" /> Active</>
                    ) : (
                      <><AlertCircle className="h-4 w-4 text-gray-400" /> Inactive</>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {exam.is_visible ? (
                      <><CheckCircle className="h-4 w-4 text-green-600" /> Visible</>
                    ) : (
                      <><AlertCircle className="h-4 w-4 text-gray-400" /> Hidden</>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={exam.is_visible ? 'default' : 'outline'}
                    onClick={() => handleToggleVisibility(exam.id, exam.is_visible)}
                    disabled={updatingExamId === exam.id}
                    className="flex-1"
                  >
                    {updatingExamId === exam.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : exam.is_visible ? (
                      <Eye className="mr-2 h-4 w-4" />
                    ) : (
                      <EyeOff className="mr-2 h-4 w-4" />
                    )}
                    {exam.is_visible ? 'Visible' : 'Hidden'}
                  </Button>

                  <Button
                    size="sm"
                    variant={exam.is_active ? 'default' : 'outline'}
                    onClick={() => handleToggleActive(exam.id, exam.is_active)}
                    disabled={updatingExamId === exam.id}
                    className="flex-1"
                  >
                    {updatingExamId === exam.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    {exam.is_active ? 'Active' : 'Inactive'}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemoveExam(exam.id)}
                    disabled={removingExamId === exam.id}
                  >
                    {removingExamId === exam.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

