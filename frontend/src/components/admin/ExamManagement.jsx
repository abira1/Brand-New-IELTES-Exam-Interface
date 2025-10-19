import React, { useState, useEffect } from 'react';
import { Trash2, Eye, Edit, Plus, FileText, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import databaseService from '../../services/databaseService';
import ExamImport from './ExamImport';

export default function ExamManagement() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);

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
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('Failed to delete exam');
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

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
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