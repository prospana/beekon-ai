import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { profileService, UserProfile } from '@/services/profileService';
import { apiKeyService, ApiKey } from '@/services/apiKeyService';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { Settings as SettingsIcon, User, Bell, Shield, Save, Lock, Key } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  
  // Form state for password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [competitorAlerts, setCompetitorAlerts] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(true);
  
  // API keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [primaryApiKey, setPrimaryApiKey] = useState<string>('');
  
  // Load profile data on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        const userProfile = await profileService.getProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
          setFirstName(userProfile.first_name || '');
          setLastName(userProfile.last_name || '');
          setCompany(userProfile.company || '');
          setEmailNotifications(userProfile.notification_settings.email_notifications);
          setWeeklyReports(userProfile.notification_settings.weekly_reports);
          setCompetitorAlerts(userProfile.notification_settings.competitor_alerts);
          setAnalysisComplete(userProfile.notification_settings.analysis_complete);
        }
        
        // Load API keys
        const userApiKeys = await apiKeyService.getApiKeys(user.id);
        setApiKeys(userApiKeys);
        if (userApiKeys.length > 0) {
          setPrimaryApiKey(userApiKeys[0].key_prefix + '...');
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProfile();
  }, [user?.id, toast]);
  
  const handleProfileSave = async () => {
    if (!user?.id) return;
    
    setIsProfileSaving(true);
    try {
      const updatedProfile = await profileService.updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        company: company,
      });
      
      setProfile(updatedProfile);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProfileSaving(false);
    }
  };
  
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsPasswordUpdating(true);
    try {
      await profileService.changePassword(currentPassword, newPassword);
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to update password:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPasswordUpdating(false);
    }
  };
  
  const handleNotificationChange = async (setting: 'email_notifications' | 'weekly_reports' | 'competitor_alerts' | 'analysis_complete', value: boolean) => {
    if (!user?.id || !profile) return;
    
    try {
      const updatedProfile = await profileService.updateNotificationSettings(user.id, {
        [setting]: value,
      });
      
      setProfile(updatedProfile);
      
      // Update local state
      switch (setting) {
        case 'email_notifications':
          setEmailNotifications(value);
          break;
        case 'weekly_reports':
          setWeeklyReports(value);
          break;
        case 'competitor_alerts':
          setCompetitorAlerts(value);
          break;
        case 'analysis_complete':
          setAnalysisComplete(value);
          break;
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={profile?.email || user?.email || ''} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input 
              id="company" 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your Company" 
            />
          </div>
          <LoadingButton
            onClick={handleProfileSave}
            loading={isProfileSaving}
            loadingText="Saving..."
            icon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </LoadingButton>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about your analysis results
              </p>
            </div>
            <Switch 
              checked={emailNotifications}
              onCheckedChange={(value) => handleNotificationChange('email_notifications', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">
                Get weekly summaries of your AI visibility performance
              </p>
            </div>
            <Switch 
              checked={weeklyReports}
              onCheckedChange={(value) => handleNotificationChange('weekly_reports', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Competitor Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when competitors gain or lose visibility
              </p>
            </div>
            <Switch 
              checked={competitorAlerts}
              onCheckedChange={(value) => handleNotificationChange('competitor_alerts', value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label>Analysis Complete</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when website analysis is complete
              </p>
            </div>
            <Switch 
              checked={analysisComplete}
              onCheckedChange={(value) => handleNotificationChange('analysis_complete', value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input 
              id="currentPassword" 
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input 
              id="newPassword" 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input 
              id="confirmPassword" 
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <LoadingButton
            onClick={handlePasswordUpdate}
            loading={isPasswordUpdating}
            loadingText="Updating..."
            icon={<Lock className="h-4 w-4" />}
          >
            Update Password
          </LoadingButton>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <CardTitle>API Access</CardTitle>
          </div>
          <CardDescription>
            Manage your API keys and access tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="flex gap-3">
              <Input id="apiKey" value={primaryApiKey || 'No API key'} disabled className="font-mono" />
              <Button 
                variant="outline"
                onClick={() => setIsApiModalOpen(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Manage Keys
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Use API keys to integrate Beekon.ai with your applications. Keep them secure and don't share them publicly.
          </p>
        </CardContent>
      </Card>
          </>
        )}
      </div>
      
      <ApiKeyModal 
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onApiKeyChange={() => {
          // Refresh API keys when modal closes
          if (user?.id) {
            apiKeyService.getApiKeys(user.id).then(keys => {
              setApiKeys(keys);
              if (keys.length > 0) {
                setPrimaryApiKey(keys[0].key_prefix + '...');
              } else {
                setPrimaryApiKey('');
              }
            });
          }
        }}
      />
    </>
  );
}