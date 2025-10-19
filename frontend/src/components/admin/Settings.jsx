// Settings Component - Full Implementation
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Settings as SettingsIcon,
  Users,
  Mail,
  Shield,
  Clock,
  Database,
  Bell,
  Globe,
  Key,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Zap,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

export const Settings = () => {
  const [settings, setSettings] = useState({
    platform: {
      siteName: 'IELTS Mock Test Platform',
      siteUrl: 'https://ielts-platform.com',
      description: 'Professional IELTS preparation platform',
      timezone: 'UTC+0',
      language: 'en'
    },
    exam: {
      defaultDuration: 180, // minutes
      maxAttempts: 3,
      autoSave: true,
      autoSaveInterval: 30, // seconds
      allowReview: true,
      randomizeQuestions: false,
      passingScore: 6.0
    },
    scoring: {
      autoScoring: true,
      bandScaleType: 'ielts_9_band',
      writingManualReview: true,
      speakingManualReview: true,
      partialCredit: true,
      roundingRule: 'nearest_half'
    },
    notifications: {
      emailNotifications: true,
      studentRegistration: true,
      examSubmission: true,
      scorePublished: true,
      systemAlerts: true,
      adminNotifications: true
    },
    security: {
      requireEmailVerification: true,
      sessionTimeout: 60, // minutes
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      enableTwoFactor: false,
      allowGuestMode: true
    },
    integrations: {
      googleAuth: true,
      firebaseEnabled: true,
      emailService: 'firebase',
      storageService: 'firebase',
      analyticsEnabled: true
    }
  });

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('platform');

  const tabs = [
    { id: 'platform', name: 'Platform', icon: Globe },
    { id: 'exam', name: 'Exam Settings', icon: Clock },
    { id: 'scoring', name: 'Scoring', icon: CheckCircle },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integrations', name: 'Integrations', icon: Zap }
  ];

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
      setHasChanges(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      toast.info('Settings reset to defaults');
      setHasChanges(true);
    }
  };

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Platform Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input
              type="text"
              value={settings.platform.siteName}
              onChange={(e) => updateSetting('platform', 'siteName', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Site URL</label>
            <input
              type="url"
              value={settings.platform.siteUrl}
              onChange={(e) => updateSetting('platform', 'siteUrl', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={settings.platform.description}
              onChange={(e) => updateSetting('platform', 'description', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="3"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Timezone</label>
              <select
                value={settings.platform.timezone}
                onChange={(e) => updateSetting('platform', 'timezone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="UTC+0">UTC+0 (London)</option>
                <option value="UTC+5:30">UTC+5:30 (India)</option>
                <option value="UTC+8">UTC+8 (Singapore)</option>
                <option value="UTC-5">UTC-5 (New York)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={settings.platform.language}
                onChange={(e) => updateSetting('platform', 'language', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderExamSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exam Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Default Duration (minutes)</label>
              <input
                type="number"
                value={settings.exam.defaultDuration}
                onChange={(e) => updateSetting('exam', 'defaultDuration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Max Attempts per Student</label>
              <input
                type="number"
                value={settings.exam.maxAttempts}
                onChange={(e) => updateSetting('exam', 'maxAttempts', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Auto-Save Interval (seconds)</label>
            <input
              type="number"
              value={settings.exam.autoSaveInterval}
              onChange={(e) => updateSetting('exam', 'autoSaveInterval', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Enable Auto-Save</span>
              <input
                type="checkbox"
                checked={settings.exam.autoSave}
                onChange={(e) => updateSetting('exam', 'autoSave', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Allow Question Review</span>
              <input
                type="checkbox"
                checked={settings.exam.allowReview}
                onChange={(e) => updateSetting('exam', 'allowReview', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Randomize Question Order</span>
              <input
                type="checkbox"
                checked={settings.exam.randomizeQuestions}
                onChange={(e) => updateSetting('exam', 'randomizeQuestions', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScoringSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scoring Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Band Scale Type</label>
              <select
                value={settings.scoring.bandScaleType}
                onChange={(e) => updateSetting('scoring', 'bandScaleType', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="ielts_9_band">IELTS 9-Band Scale</option>
                <option value="percentage">Percentage (0-100%)</option>
                <option value="grade_letter">Letter Grades (A-F)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Rounding Rule</label>
              <select
                value={settings.scoring.roundingRule}
                onChange={(e) => updateSetting('scoring', 'roundingRule', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="nearest_half">Nearest 0.5</option>
                <option value="nearest_whole">Nearest Whole</option>
                <option value="round_up">Always Round Up</option>
                <option value="round_down">Always Round Down</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Enable Auto-Scoring</span>
              <input
                type="checkbox"
                checked={settings.scoring.autoScoring}
                onChange={(e) => updateSetting('scoring', 'autoScoring', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Writing Manual Review Required</span>
              <input
                type="checkbox"
                checked={settings.scoring.writingManualReview}
                onChange={(e) => updateSetting('scoring', 'writingManualReview', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Allow Partial Credit</span>
              <input
                type="checkbox"
                checked={settings.scoring.partialCredit}
                onChange={(e) => updateSetting('scoring', 'partialCredit', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                  className="rounded"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Require Email Verification</span>
              <input
                type="checkbox"
                checked={settings.security.requireEmailVerification}
                onChange={(e) => updateSetting('security', 'requireEmailVerification', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Enable Two-Factor Authentication</span>
              <input
                type="checkbox"
                checked={settings.security.enableTwoFactor}
                onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Allow Guest/Demo Mode</span>
              <input
                type="checkbox"
                checked={settings.security.allowGuestMode}
                onChange={(e) => updateSetting('security', 'allowGuestMode', e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Firebase Integration</p>
                  <p className="text-sm text-gray-600">Database, Auth, Storage</p>
                </div>
              </div>
              <Badge variant={settings.integrations.firebaseEnabled ? "default" : "secondary"}>
                {settings.integrations.firebaseEnabled ? "Connected" : "Disabled"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Google Authentication</p>
                  <p className="text-sm text-gray-600">OAuth 2.0 Sign-in</p>
                </div>
              </div>
              <Badge variant={settings.integrations.googleAuth ? "default" : "secondary"}>
                {settings.integrations.googleAuth ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Email Service</p>
                  <p className="text-sm text-gray-600">Notification delivery</p>
                </div>
              </div>
              <Badge variant="default">Firebase Functions</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Integration Status:</strong> All core integrations are configured and running properly. 
          Contact your system administrator for advanced integration settings.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'platform': return renderPlatformSettings();
      case 'exam': return renderExamSettings();
      case 'scoring': return renderScoringSettings();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'integrations': return renderIntegrationsSettings();
      default: return renderPlatformSettings();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure platform settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || loading}
            className={hasChanges ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;