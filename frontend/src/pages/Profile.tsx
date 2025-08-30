import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Camera, Save, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface User {
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

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'admin' | 'worker' | 'user';
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User>({
    firstName: '',
    lastName: '',
    userType: 'user',
    currentEmployer: '',
    language: 'en',
    workHistory: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'work' | 'hierarchy'>('work');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const languages = {
    en: 'English',
    es: 'Español', 
    fr: 'Français',
    de: 'Deutsch'
  };

  useEffect(() => {
    fetchUserData();
    if (user?.userType === 'admin') {
      fetchTeamMembers();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const data = response.data.user;
      setUserData({
        firstName: data.firstName,
        lastName: data.lastName,
        userType: data.userType,
        currentEmployer: data.currentEmployer || 'RoadGuard Services',
        language: data.language || 'en',
        profileImage: data.profileImage,
        workHistory: data.workHistory || []
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await authAPI.getAllUsers();
      setTeamMembers(response.data.users);
    } catch (error) {
      console.error('Failed to fetch team members');
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

  const handleRoleUpdate = async (userId: string, newRole: 'admin' | 'worker' | 'user') => {
    try {
      await authAPI.updateUserRole(userId, newRole);
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === userId ? { ...member, userType: newRole } : member
        )
      );
      toast({ title: "Success", description: "Role updated successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="rounded-lg">
              Dashboard
            </Button>
            {userData.userType === 'admin' && (
              <Button onClick={() => navigate('/admin')} className="rounded-lg bg-blue-600 hover:bg-blue-700">
                Admin
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Section */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Image */}
              <div className="relative">
                <Avatar className="w-32 h-32 rounded-full">
                  <AvatarImage src={userData.profileImage} />
                  <AvatarFallback className="text-2xl bg-gray-200">
                    {userData.firstName[0]}{userData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              {/* Profile Fields */}
              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={userData.firstName}
                          onChange={(e) => setUserData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="First Name"
                          className="rounded-lg"
                        />
                        <Input
                          value={userData.lastName}
                          onChange={(e) => setUserData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Last Name"
                          className="rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userData.firstName} {userData.lastName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <div className="p-3 bg-gray-50 rounded-lg capitalize">
                      {userData.userType === 'admin' ? 'Admin/Workshop Owner' : userData.userType}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Employer</label>
                    {isEditing ? (
                      <Input
                        value={userData.currentEmployer}
                        onChange={(e) => setUserData(prev => ({ ...prev, currentEmployer: e.target.value }))}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {userData.currentEmployer}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <Select
                      value={userData.language}
                      onValueChange={(value) => setUserData(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(languages).map(([code, name]) => (
                          <SelectItem key={code} value={code}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-3">
                  {isEditing ? (
                    <Button onClick={handleSave} className="rounded-lg bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="rounded-lg">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setActiveTab('work')}
            className={`rounded-lg px-6 py-3 ${
              activeTab === 'work' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border'
            }`}
          >
            Work History
          </Button>
          <Button
            onClick={() => setActiveTab('hierarchy')}
            className={`rounded-lg px-6 py-3 ${
              activeTab === 'hierarchy' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border'
            }`}
          >
            Hierarchy
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'work' && (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Work History</h3>
              <div className="space-y-4">
                {userData.workHistory?.map((job, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold">{job.position}</h4>
                    <p className="text-blue-600">{job.company}</p>
                    <p className="text-sm text-gray-600">{job.startDate} - {job.endDate}</p>
                    <p className="text-sm text-gray-700 mt-1">{job.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'hierarchy' && (
          <Card className="rounded-xl shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Organization Hierarchy</h3>
              <div className="space-y-6">
                {/* Workshop Owner */}
                <div className="text-center">
                  <div className="inline-block p-4 bg-red-100 rounded-lg">
                    <h4 className="font-semibold">Workshop Owner</h4>
                    <p className="text-sm text-gray-600">Michael Johnson</p>
                  </div>
                </div>
                
                {/* Connection Line */}
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-gray-300"></div>
                </div>

                {/* Senior Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-blue-100 rounded-lg">
                      <h4 className="font-semibold">Senior Mechanic</h4>
                      <p className="text-sm text-gray-600">
                        {userData.userType === 'worker' ? 'You' : 'Sarah Davis'}
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block p-4 bg-blue-100 rounded-lg">
                      <h4 className="font-semibold">Operations Manager</h4>
                      <p className="text-sm text-gray-600">Emma Wilson</p>
                    </div>
                  </div>
                </div>

                {/* Junior Level */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['Alex Wilson - Junior Mechanic', 'Tom Garcia - Dispatcher', 'Lisa Chen - Junior Mechanic'].map((member, index) => (
                    <div key={index} className="text-center">
                      <div className="inline-block p-3 bg-green-100 rounded-lg">
                        <p className="text-sm font-medium">{member}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Role Management */}
              {userData.userType === 'admin' && (
                <div className="mt-8 pt-6 border-t">
                  <h4 className="text-lg font-semibold mb-4">Team Management</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium">{member.firstName} {member.lastName}</h5>
                        <p className="text-sm text-gray-600 mb-2">{member.email}</p>
                        <Select 
                          value={member.userType} 
                          onValueChange={(value: 'admin' | 'worker' | 'user') => handleRoleUpdate(member.id, value)}
                        >
                          <SelectTrigger className="w-full rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="worker">Worker</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;