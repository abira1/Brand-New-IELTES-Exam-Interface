// Admin Overview/Dashboard Component
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Users, 
  FileText, 
  ClipboardList, 
  TrendingUp,
  Plus,
  Upload,
  UserCheck,
  BarChart3
} from 'lucide-react';
import databaseService from '../../services/databaseService';
import { toast } from 'sonner';

export const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalSubmissions: 0,
    avgScore: 0,
    pendingApprovals: 0,
    activeExams: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load students (with fallback for mock data)
      const studentsResult = await databaseService.getAllStudents();
      const students = studentsResult && studentsResult.success ? studentsResult.students || [] : [];
      
      // Load exams (light version) 
      const examsResult = await databaseService.query('exams');
      const exams = examsResult && examsResult.success ? Object.values(examsResult.data || {}) : [];
      
      // Load submissions
      const submissionsResult = await databaseService.query('submissions');
      const submissions = submissionsResult && submissionsResult.success ? Object.values(submissionsResult.data || {}) : [];
      
      // Calculate stats
      const pendingStudents = students.filter(s => s.status === 'pending').length;
      const activeExams = exams.filter(e => e.is_active && e.published).length;
      const completedSubmissions = submissions.filter(s => s.status === 'submitted').length;
      
      // Calculate average score
      const scoredSubmissions = submissions.filter(s => s.score !== undefined && s.score !== null);
      const avgScore = scoredSubmissions.length > 0 
        ? scoredSubmissions.reduce((sum, s) => sum + s.score, 0) / scoredSubmissions.length 
        : 0;
      
      setStats({
        totalStudents: students.length,
        totalExams: exams.length,
        totalSubmissions: submissions.length,
        avgScore: Math.round(avgScore * 10) / 10,
        pendingApprovals: pendingStudents,
        activeExams
      });
      
      // Generate recent activity (mock for now)
      setRecentActivity([
        { type: 'student_registered', message: 'New student registration pending approval', time: '2 minutes ago' },
        { type: 'exam_completed', message: 'Student completed IELTS Practice Test 1', time: '15 minutes ago' },
        { type: 'exam_imported', message: 'New exam imported: Reading Comprehension Set A', time: '1 hour ago' },
        { type: 'result_published', message: 'Results published for 5 students', time: '2 hours ago' }
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Import New Exam',
      description: 'Upload ZIP file with exam content',
      icon: Upload,
      action: () => toast.info('Exam import feature coming soon!'),
      color: 'bg-blue-500'
    },
    {
      title: 'Create Exam',
      description: 'Build exam from scratch',
      icon: Plus,
      action: () => toast.info('Exam builder coming soon!'),
      color: 'bg-green-500'
    },
    {
      title: 'Approve Students',
      description: `${stats.pendingApprovals} students waiting`,
      icon: UserCheck,
      action: () => toast.info('Student management coming soon!'),
      color: 'bg-orange-500'
    },
    {
      title: 'View Analytics',
      description: 'Detailed performance reports',
      icon: BarChart3,
      action: () => toast.info('Analytics dashboard coming soon!'),
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome to your IELTS platform administration center</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Quick Action
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingApprovals} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalExams}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeExams} currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Submissions</CardTitle>
            <ClipboardList className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total exam attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.avgScore}%</div>
            <p className="text-xs text-gray-500 mt-1">
              Across all submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">{action.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Students</span>
                <span className="text-sm font-medium">{stats.totalStudents - stats.pendingApprovals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Approvals</span>
                <span className="text-sm font-medium text-orange-600">{stats.pendingApprovals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Published Exams</span>
                <span className="text-sm font-medium">{stats.activeExams}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="text-sm font-medium">
                  {stats.totalSubmissions > 0 ? Math.round((stats.totalSubmissions / (stats.totalStudents || 1)) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Firebase Setup Alert */}
      <Alert>
        <AlertDescription>
          <strong>Firebase Setup Required:</strong> Please configure your Firebase project credentials in the environment variables to enable full functionality.
          The current demo is using mock data.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default AdminOverview;