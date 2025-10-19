import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import databaseService from '../../services/databaseService';
import { toast } from 'sonner';

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('📋 [StudentManagement] Fetching students from database...');
      console.log('📋 [StudentManagement] Is refresh:', isRefresh);

      const result = await databaseService.getAllStudents();
      console.log('📋 [StudentManagement] Result from getAllStudents:', result);

      if (result.success) {
        const studentsList = result.students || [];
        console.log(`📋 [StudentManagement] Successfully fetched ${studentsList.length} students`);
        console.log('📋 [StudentManagement] Students list:', studentsList);

        setStudents(studentsList);

        // Calculate stats
        const newStats = {
          total: studentsList.length,
          pending: studentsList.filter(s => s.status === 'pending').length,
          approved: studentsList.filter(s => s.status === 'approved').length,
          rejected: studentsList.filter(s => s.status === 'rejected').length
        };
        console.log('📋 [StudentManagement] Calculated stats:', newStats);
        setStats(newStats);

        if (isRefresh) {
          toast.success('Student list refreshed');
        }
      } else {
        console.error('❌ [StudentManagement] Failed to fetch students:', result.error);
        toast.error('Failed to load students: ' + (result.error || 'Unknown error'));
        setStudents([]);
      }
    } catch (error) {
      console.error('❌ [StudentManagement] Error fetching students:', error);
      console.error('❌ [StudentManagement] Error stack:', error.stack);
      toast.error('Failed to load students: ' + error.message);
      setStudents([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const updateStudentStatus = async (uid, newStatus) => {
    try {
      const result = await databaseService.updateStudentStatus(uid, newStatus);

      if (result.success) {
        toast.success(`Student ${newStatus} successfully`);
        fetchStudents(); // Refresh the list
      } else {
        console.error('Failed to update student status:', result.error);
        toast.error('Failed to update student status');
      }
    } catch (error) {
      console.error('Error updating student status:', error);
      toast.error('Failed to update student status');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600' },
      approved: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      rejected: { variant: 'destructive', icon: XCircle, color: 'text-red-600' }
    };
    
    const config = variants[status] || variants.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {status}
      </Badge>
    );
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
        <Button
          onClick={() => fetchStudents(true)}
          variant="outline"
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <UserCheck className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <UserX className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>All Students</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No students found. Students will appear here after they sign up.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.uid}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    {student.photoURL ? (
                      <img
                        src={student.photoURL}
                        alt={student.displayName}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium">{student.displayName}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-3 w-3 mr-1" />
                        {student.email}
                      </div>
                      {student.createdAt && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Joined: {formatDate(student.createdAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {getStatusBadge(student.status)}
                    
                    {student.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => updateStudentStatus(student.uid, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateStudentStatus(student.uid, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {student.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStudentStatus(student.uid, 'pending')}
                      >
                        Reset to Pending
                      </Button>
                    )}
                    
                    {student.status === 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStudentStatus(student.uid, 'approved')}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagement;