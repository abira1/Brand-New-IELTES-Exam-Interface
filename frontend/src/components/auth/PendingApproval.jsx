// Pending Approval Component
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Clock, Mail, User, CheckCircle } from 'lucide-react';
import { database } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';
import { toast } from 'sonner';

export const PendingApproval = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isApproved, setIsApproved] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Set up real-time listener for student status changes
  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔍 [PendingApproval] Setting up real-time listener for user:', user.uid);

    try {
      // Create reference to student record
      const studentRef = ref(database, `students/${user.uid}`);

      // Set up real-time listener
      const unsubscribe = onValue(
        studentRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const studentData = snapshot.val();
            console.log('📊 [PendingApproval] Student data updated:', studentData);

            // Check if status changed to approved
            if (studentData.status === 'approved') {
              console.log('✅ [PendingApproval] Student approved! Redirecting to dashboard...');
              setIsApproved(true);
              setStatusMessage('Your account has been approved! Redirecting to dashboard...');
              toast.success('Your account has been approved! Welcome!');

              // Redirect after a short delay to show the message
              setTimeout(() => {
                navigate('/student', { replace: true });
              }, 1500);
            }
            // Check if status changed to rejected
            else if (studentData.status === 'rejected') {
              console.log('❌ [PendingApproval] Student rejected');
              setIsRejected(true);
              setStatusMessage('Your account has been rejected. Please contact support for more information.');
              toast.error('Your account has been rejected.');
            }
          }
        },
        (error) => {
          console.error('❌ [PendingApproval] Error listening to student status:', error);
        }
      );

      // Cleanup listener on unmount
      return () => {
        console.log('🧹 [PendingApproval] Cleaning up listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ [PendingApproval] Error setting up listener:', error);
    }
  }, [user?.uid, navigate]);

  const handleSignOut = async () => {
    await signOut();
  };

  // Show approved state
  if (isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Success Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Approved!</h2>
            <p className="text-gray-600">Welcome to the IELTS Mock Exam Platform</p>
          </div>

          {/* Success Card */}
          <Card className="shadow-xl border-0">
            <CardContent className="space-y-4 pt-6">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Account Status:</strong> Approved
                  <br />
                  <strong>Email:</strong> {user?.email}
                </AlertDescription>
              </Alert>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  {statusMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show rejected state
  if (isRejected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100 p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Rejected Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Rejected</h2>
            <p className="text-gray-600">Your account application was not approved</p>
          </div>

          {/* Rejected Card */}
          <Card className="shadow-xl border-0">
            <CardContent className="space-y-4 pt-6">
              <Alert className="bg-red-50 border-red-200">
                <Mail className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Account Status:</strong> Rejected
                  <br />
                  <strong>Email:</strong> {user?.email}
                </AlertDescription>
              </Alert>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  {statusMessage}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Need help?</h3>
                <p className="text-sm text-blue-700">
                  Contact our support team at{' '}
                  <a href="mailto:support@ielts-platform.com" className="underline">
                    support@ielts-platform.com
                  </a>
                </p>
              </div>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full"
              >
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show pending state (default)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Status Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-amber-500 rounded-full flex items-center justify-center mb-4 animate-spin">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Account Pending</h2>
          <p className="text-gray-600">Your account is awaiting admin approval</p>
        </div>

        {/* Status Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center justify-center">
              <User className="mr-2 h-5 w-5" />
              Welcome, {user?.displayName}!
            </CardTitle>
            <CardDescription className="text-gray-500">
              We're reviewing your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Account Status:</strong> Pending Approval
                <br />
                <strong>Email:</strong> {user?.email}
              </AlertDescription>
            </Alert>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-medium text-amber-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Our admin team will review your account</li>
                <li>• Your status will update automatically when approved</li>
                <li>• Approval typically takes 1-2 business days</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Real-time Updates</h3>
              <p className="text-sm text-blue-700">
                This page automatically monitors your account status. You'll be redirected to the dashboard as soon as your account is approved!
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Need help?</h3>
              <p className="text-sm text-blue-700">
                Contact our support team at{' '}
                <a href="mailto:support@ielts-platform.com" className="underline">
                  support@ielts-platform.com
                </a>
              </p>
            </div>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Thank you for your patience! Status updates in real-time.</p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;