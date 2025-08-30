import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Camera, Save, Edit2, User, Building, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  firstName: string;
  lastName: string;
  userType: 'admin' | 'worker' | 'user';
  currentEmployer: string;
  language: string;
  profileImage?: string;
  workHistory?: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    userType: 'user',
    currentEmployer: '',
    language: 'en',
    workHistory: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeView, setActiveView] = useState<'work' | 'hierarchy'>('work');

  const languages = {
    en: 'English',
    es: 'Español', 
    fr: 'Français',
    de: 'Deutsch'
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log('Fetching user data...');
      const response = await authAPI.getCurrentUser();
      console.log('API Response:', response.data);
      const data = response.data.user || response.data;
      setUserData({
        firstName: data.firstName || user?.firstName || 'John',
        lastName: data.lastName || user?.lastName || 'Doe',
        userType: data.userType || user?.userType || 'user',
        currentEmployer: data.currentEmployer || 'RoadGuard Services',
        language: data.language || 'en',
        profileImage: data.profileImage,
        workHistory: data.workHistory || [
          {
            position: 'Senior Mechanic',
            company: 'AutoFix Pro',
            startDate: '2022-01',
            endDate: 'Present',
            description: 'Lead mechanic specializing in engine diagnostics and repair'
          },
          {
            position: 'Junior Mechanic',
            company: 'Quick Repair Shop',
            startDate: '2020-06',
            endDate: '2021-12',
            description: 'General automotive maintenance and basic repairs'
          }
        ]
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      // Fallback to user context data
      if (user) {
        setUserData({
          firstName: user.firstName || 'John',
          lastName: user.lastName || 'Doe',
          userType: user.userType || 'user',
          currentEmployer: 'RoadGuard Services',
          language: 'en',
          workHistory: [
            {
              position: 'Senior Mechanic',
              company: 'AutoFix Pro',
              startDate: '2022-01',
              endDate: 'Present',
              description: 'Lead mechanic specializing in engine diagnostics and repair'
            }
          ]
        });
      }
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      await authAPI.updateProfile(userData);
      setIsEditing(false);
      toast({ title: "Success", description: "Profile updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData(prev => ({ ...prev, profileImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin/Workshop Owner';
      case 'worker': return 'Worker';
      case 'user': return 'User';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'worker': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Top Bar */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Badge className={`px-3 py-1 ${getRoleBadgeColor(userData.userType)}`}>
            {getRoleDisplay(userData.userType)}
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Card */}
        <Card className="glass-effect border-primary/20 mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground">Profile</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Side - Form Fields */}
              <div className="flex-1 space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name:
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        value={userData.firstName}
                        onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="First Name"
                        className="glass-effect border-primary/20"
                      />
                      <Input
                        value={userData.lastName}
                        onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last Name"
                        className="glass-effect border-primary/20"
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-border">
                      {userData.firstName} {userData.lastName}
                    </div>
                  )}
                </div>

                {/* Role Field */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Role:
                  </label>
                  <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-border">
                    {getRoleDisplay(userData.userType)}
                  </div>
                </div>

                {/* Current Employer Field */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Current Employer:
                  </label>
                  {isEditing ? (
                    <Input
                      value={userData.currentEmployer}
                      onChange={(e) => setUserData(prev => ({ ...prev, currentEmployer: e.target.value }))}
                      className="glass-effect border-primary/20"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg border border-dashed border-border">
                      {userData.currentEmployer}
                    </div>
                  )}
                </div>

                {/* Language Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Change Language:
                  </label>
                  <Select
                    value={userData.language}
                    onValueChange={(value) => setUserData(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger className="glass-effect border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(languages).map(([code, name]) => (
                        <SelectItem key={code} value={code}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Edit Button */}
                <div className="pt-4">
                  {isEditing ? (
                    <Button onClick={handleSave} className="gradient-emergency">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="glass-effect border-primary/20">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Side - Profile Image */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={userData.profileImage} />
                    <AvatarFallback className="text-2xl bg-muted">
                      {userData.firstName?.[0] || 'U'}{userData.lastName?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/80 transition-smooth">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-sm text-muted-foreground text-center">Profile Image<br/>(circle placeholder)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveView('work')}
            className={activeView === 'work' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
          >
            Work History
          </Button>
          <Button
            onClick={() => setActiveView('hierarchy')}
            className={activeView === 'hierarchy' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}
          >
            Hierarchy
          </Button>
        </div>

        {/* Content Based on Active View */}
        {activeView === 'work' && (
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Work History</CardTitle>
              <p className="text-sm text-muted-foreground">Shows list of employee's past work</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.workHistory?.map((job, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4 py-3 bg-muted/30 rounded-r-lg">
                    <h4 className="font-semibold text-foreground">{job.position}</h4>
                    <p className="text-primary font-medium">{job.company}</p>
                    <p className="text-sm text-muted-foreground">{job.startDate} - {job.endDate}</p>
                    <p className="text-sm text-foreground mt-1">{job.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeView === 'hierarchy' && (
          <Card className="glass-effect border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">Hierarchy</CardTitle>
              <p className="text-sm text-muted-foreground">Displays employer hierarchy</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 bg-white p-6 rounded-lg">
                {/* Workshop Owner */}
                <div className="text-center">
                  <div className="inline-block p-6 bg-red-50 border-2 border-red-300 rounded-xl shadow-sm">
                    <h4 className="font-bold text-red-900 text-lg">Workshop Owner</h4>
                    <p className="text-red-700 font-medium mt-1">Michael Johnson</p>
                  </div>
                </div>
                
                {/* Connection Line */}
                <div className="flex justify-center">
                  <div className="w-1 h-12 bg-gray-400 rounded"></div>
                </div>

                {/* Senior Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  <div className="text-center">
                    <div className="inline-block p-5 bg-blue-50 border-2 border-blue-300 rounded-xl shadow-sm">
                      <h4 className="font-bold text-blue-900 text-base">Senior Mechanic</h4>
                      <p className="text-blue-700 font-medium mt-1">
                        {userData.userType === 'worker' ? `${userData.firstName} ${userData.lastName} (You)` : 'Sarah Davis'}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block p-5 bg-blue-50 border-2 border-blue-300 rounded-xl shadow-sm">
                      <h4 className="font-bold text-blue-900 text-base">Operations Manager</h4>
                      <p className="text-blue-700 font-medium mt-1">Emma Wilson</p>
                    </div>
                  </div>
                </div>

                {/* Connection Lines */}
                <div className="flex justify-center">
                  <div className="w-1 h-12 bg-gray-400 rounded"></div>
                </div>

                {/* Junior Level */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Alex Wilson', role: 'Junior Mechanic' },
                    { name: 'Tom Garcia', role: 'Dispatcher' },
                    { name: 'Lisa Chen', role: 'Junior Mechanic' }
                  ].map((member, index) => (
                    <div key={index} className="text-center">
                      <div className="inline-block p-4 bg-green-50 border-2 border-green-300 rounded-xl shadow-sm">
                        <h5 className="font-bold text-green-900 text-sm">{member.name}</h5>
                        <p className="text-green-700 text-xs mt-1">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Role-based Access Note */}
                {userData.userType === 'admin' && (
                  <div className="mt-8 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                    <p className="text-yellow-900 font-semibold text-center">
                      🔑 Admin Access: You can manage team roles and view complete hierarchy
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;