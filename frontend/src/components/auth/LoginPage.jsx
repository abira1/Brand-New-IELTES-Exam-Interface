// Login Page Component
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, LogIn } from 'lucide-react';

export const LoginPage = () => {
  const { signIn, loading, error, isAuthenticated, userRole } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated()) {
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (userRole === 'student') {
      return <Navigate to="/student" replace />;
    } else if (userRole === 'pending') {
      return <Navigate to="/pending" replace />;
    }
  }

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    const result = await signIn();
    setSigningIn(false);

    if (!result.success) {
      console.error('Sign in failed:', result.error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center space-x-3">
          <Loader2 className="animate-spin h-6 w-6 text-indigo-600" />
          <span className="text-lg font-medium text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">IELTS</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to IELTS Mock Test</h2>
          <p className="text-gray-600">Sign in to access your exam portal</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              Sign In to Your Account
            </CardTitle>
            <CardDescription className="text-gray-500">
              Use your Google account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button
              onClick={handleGoogleSignIn}
              disabled={signingIn || loading}
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              size="lg"
            >
              {signingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                New here?{' '}
                <span className="font-medium text-indigo-600">
                  Your account will be created automatically
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 IELTS Mock Test Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;