// Profile Component - Placeholder
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Construction } from 'lucide-react';

export const Profile = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Construction className="mr-2 h-5 w-5 text-orange-600" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              The profile management interface is currently under development. This will include:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Personal information editing</li>
                <li>Institution and contact details</li>
                <li>Learning preferences and goals</li>
                <li>Account security settings</li>
                <li>Notification preferences</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;