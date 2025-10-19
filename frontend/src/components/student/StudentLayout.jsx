// Student Layout Component
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  User,
  LogOut,
  BookOpen
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Overview', href: '/student/overview', icon: LayoutDashboard },
  { name: 'Available Exams', href: '/student/exams', icon: FileText },
  { name: 'My Results', href: '/student/results', icon: BarChart3 },
  { name: 'Profile', href: '/student/profile', icon: User },
];

export const StudentLayout = ({ children }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <span className="text-xl font-bold text-white">IELTS Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/student/overview' && location.pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 border-l-4 border-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm'
                )}
              >
                <Icon className={cn(
                  'mr-3 h-5 w-5',
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center space-x-3 mb-4">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <div className="h-10 w-10 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || 'Student'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="flex-1 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;