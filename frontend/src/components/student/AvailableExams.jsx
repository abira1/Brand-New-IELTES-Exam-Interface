// Available Exams Component
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Clock, 
  FileText, 
  Search, 
  Filter,
  PlayCircle, 
  BookOpen, 
  PenTool,
  Headphones,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import databaseService from '../../services/databaseService';
import { useAuth } from '../../contexts/AuthContext';

export const AvailableExams = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Load exams on component mount
  useEffect(() => {
    loadExams();
  }, []);

  // Filter exams when search/filter changes
  useEffect(() => {
    filterExams();
  }, [exams, searchTerm, filterType]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const result = await databaseService.getAvailableExams();

      if (result.success) {
        setExams(result.exams || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to load exams');
      }
    } catch (err) {
      setError('Error loading exams: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = exams;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(exam => exam.type === filterType);
    }

    setFilteredExams(filtered);
  };

  const getSectionIcon = (sectionName) => {
    switch (sectionName?.toLowerCase()) {
      case 'listening': return <Headphones className="h-4 w-4" />;
      case 'reading': return <BookOpen className="h-4 w-4" />;
      case 'writing': return <PenTool className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'full_test': return 'bg-blue-100 text-blue-800';
      case 'practice': return 'bg-green-100 text-green-800';
      case 'mock': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const handlePreviewExam = async (examId) => {
    // Show exam details in preview mode
    console.log('Preview exam:', examId);
    // Could implement a modal with exam details
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Exams</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading exams...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Exams</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadExams} className="mt-4" variant="outline">
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Exams</h1>
      
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search exams by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full_test">Full Tests</SelectItem>
              <SelectItem value="practice">Practice Tests</SelectItem>
              <SelectItem value="mock">Mock Tests</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterType !== 'all'
                ? 'No exams match your current filters.'
                : 'No exams are available at the moment.'
              }
            </p>
            {(searchTerm || filterType !== 'all') && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {exam.title || 'Untitled Exam'}
                    </CardTitle>
                    <Badge className={`${getTypeColor(exam.type)} mb-2`}>
                      {exam.type === 'full_test' ? 'Full Test' : 
                       exam.type === 'practice' ? 'Practice' : 
                       exam.type === 'mock' ? 'Mock Test' : exam.type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Exam Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{exam.totalQuestions || 0} Questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{exam.duration || 180} mins</span>
                  </div>
                </div>

                {/* Sections */}
                {exam.sections && exam.sections.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">Sections:</div>
                    <div className="flex flex-wrap gap-1">
                      {exam.sections.map((section, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs"
                        >
                          {getSectionIcon(section.name)}
                          <span>{section.name}</span>
                          <span className="text-gray-500">({section.questionCount})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStartExam(exam.id)}
                    className="flex-1"
                    size="sm"
                  >
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Start Exam
                  </Button>
                  <Button
                    onClick={() => handlePreviewExam(exam.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableExams;