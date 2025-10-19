import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Edit, Plus, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from '../ui/sonner';
import databaseService from '../../services/databaseService';
import functionsService from '../../services/functionsService';
import ExamImport from './ExamImport';

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [updatingExamId, setUpdatingExamId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await databaseService.getExams();
      if (response.success) {
        setExams(response.exams || []);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) {
      return;
    }

    try {
      const response = await functionsService.deleteExam(examId);
      if (response.success) {
        setExams(exams.filter(exam => exam.id !== examId));
        toast.success('Exam deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    }
  };

  const handlePublish = async (examId) => {
    setUpdatingExamId(examId);
    try {
      const result = await databaseService.updateExam(examId, {
        status: 'published',
        published: true
      });
      if (result.success) {
        toast.success('✅ Exam published successfully');
        fetchExams();
      } else {
        toast.error('Failed to publish exam');
      }
    } catch (error) {
      console.error('Error publishing exam:', error);
      toast.error('Error publishing exam');
    } finally {
      setUpdatingExamId(null);
    }
  };

  const handleActivate = async (examId) => {
    setUpdatingExamId(examId);
    try {
      const result = await databaseService.updateExam(examId, {
        is_active: true
      });
      if (result.success) {
        toast.success('✅ Exam activated successfully');
        fetchExams();
      } else {
        toast.error('Failed to activate exam');
      }
    } catch (error) {
      console.error('Error activating exam:', error);
      toast.error('Error activating exam');
    } finally {
      setUpdatingExamId(null);
    }
  };

  const handleMakeVisible = async (examId) => {
    setUpdatingExamId(examId);
    try {
      const result = await databaseService.updateExam(examId, {
        is_visible: true
      });
      if (result.success) {
        toast.success('✅ Exam is now visible to students');
        fetchExams();
      } else {
        toast.error('Failed to make exam visible');
      }
    } catch (error) {
      console.error('Error making exam visible:', error);
      toast.error('Error making exam visible');
    } finally {
      setUpdatingExamId(null);
    }
  };

  if (showImport) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Import New Exam</h2>
          <Button variant="outline" onClick={() => {
            setShowImport(false);
            fetchExams(); // Refresh list
          }}>
            Back to Exam List
          </Button>
        </div>
        <ExamImport />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exam Management</h2>
          <p className="text-gray-500">Manage IELTS exams, import from ZIP, and configure settings</p>
        </div>
        <Button onClick={() => setShowImport(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Import Exam
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <h3 className="text-lg font-medium">No exams yet</h3>
                <p className="text-gray-500">Get started by importing an IELTS exam from a ZIP file</p>
              </div>
              <Button onClick={() => setShowImport(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Import Your First Exam
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{exam.title}</CardTitle>
                    {exam.description && (
                      <p className="text-sm text-gray-500">{exam.description}</p>
                    )}
                  </div>
                  <Badge variant={exam.status === 'published' ? 'default' : 'secondary'}>
                    {exam.status || 'draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Type</p>
                    <p className="text-sm">{exam.type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-sm">{exam.duration || 60} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Questions</p>
                    <p className="text-sm">{exam.totalQuestions || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm">
                      {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {exam.sections && exam.sections.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Sections</p>
                    <div className="flex flex-wrap gap-2">
                      {exam.sections.map((section, idx) => (
                        <Badge key={idx} variant="outline">
                          {section.name} ({section.questionCount || 0} questions)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    {exam.published ? (
                      <><CheckCircle className="h-4 w-4 text-green-600" /> Published</>
                    ) : (
                      <><AlertCircle className="h-4 w-4 text-gray-400" /> Not Published</>
                    )}
                  </div>
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
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>

                  {/* Publish Button - Show if not published */}
                  {!exam.published && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(exam.id)}
                      disabled={updatingExamId === exam.id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {updatingExamId === exam.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Publish
                    </Button>
                  )}

                  {/* Activate Button - Show if published but not active */}
                  {exam.published && !exam.is_active && (
                    <Button
                      size="sm"
                      onClick={() => handleActivate(exam.id)}
                      disabled={updatingExamId === exam.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updatingExamId === exam.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-2 h-4 w-4" />
                      )}
                      Activate
                    </Button>
                  )}

                  {/* Make Visible Button - Show if active but not visible */}
                  {exam.is_active && !exam.is_visible && (
                    <Button
                      size="sm"
                      onClick={() => handleMakeVisible(exam.id)}
                      disabled={updatingExamId === exam.id}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {updatingExamId === exam.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="mr-2 h-4 w-4" />
                      )}
                      Make Visible
                    </Button>
                  )}

                  {/* Success Badge - Show if all three are true */}
                  {exam.published && exam.is_active && exam.is_visible && (
                    <Badge className="bg-green-600 text-white">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Ready for Students
                    </Badge>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(exam.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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