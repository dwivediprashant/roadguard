import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit2, Save, X, Users, Briefcase, Camera } from 'lucide-react';

type UserRole = 'admin' | 'worker' | 'user';
type Language = 'en' | 'es' | 'fr' | 'de';

interface ProfileData {
  name: string;
  role: UserRole;
  currentEmployer: string;
  language: Language;
  profileImage?: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showWorkHistory, setShowWorkHistory] = useState(false);
  const [showHierarchy, setShowHierarchy] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user ? `${user.firstName} ${user.lastName}` : 'John Doe',
    role: (user?.userType as UserRole) || 'user',
    currentEmployer: 'RoadGuard Services',
    language: 'en',
    profileImage: undefined
  });

  const [editData, setEditData] = useState<ProfileData>(profileData);

  const languages = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch'
  };

  const roleColors = {
    admin: 'bg-red-500',
    worker: 'bg-blue-500',
    user: 'bg-green-500'
  };

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (isEditing) {
          setEditData(prev => ({ ...prev, profileImage: imageUrl }));
        } else {
          setProfileData(prev => ({ ...prev, profileImage: imageUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const canEditRoles = profileData.role === 'admin';

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Profile
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="w-4 h-4" />
                      Save
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage 
                    src={isEditing ? editData.profileImage : profileData.profileImage} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="text-2xl">
                    {(isEditing ? editData.name : profileData.name)
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                {isEditing ? (
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="p-3 border rounded-md bg-muted/50">
                    {profileData.name}
                  </div>
                )}
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                {isEditing && canEditRoles ? (
                  <Select
                    value={editData.role}
                    onValueChange={(value: UserRole) => setEditData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin/Workshop Owner</SelectItem>
                      <SelectItem value="worker">Worker</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge className={`${roleColors[profileData.role]} text-white`}>
                      {profileData.role === 'admin' ? 'Admin/Workshop Owner' : 
                       profileData.role === 'worker' ? 'Worker' : 'User'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Current Employer Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Employer</label>
                {isEditing ? (
                  <Input
                    value={editData.currentEmployer}
                    onChange={(e) => setEditData(prev => ({ ...prev, currentEmployer: e.target.value }))}
                    placeholder="Enter current employer"
                  />
                ) : (
                  <div className="p-3 border rounded-md bg-muted/50">
                    {profileData.currentEmployer}
                  </div>
                )}
              </div>

              {/* Language Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Language</label>
                <Select
                  value={isEditing ? editData.language : profileData.language}
                  onValueChange={(value: Language) => {
                    if (isEditing) {
                      setEditData(prev => ({ ...prev, language: value }));
                    } else {
                      setProfileData(prev => ({ ...prev, language: value }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languages).map(([code, name]) => (
                      <SelectItem key={code} value={code}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => setShowWorkHistory(!showWorkHistory)}
            variant="outline"
            className="flex-1"
          >
            <Briefcase className="w-4 h-4" />
            Work History
          </Button>
          <Button
            onClick={() => setShowHierarchy(!showHierarchy)}
            variant="outline"
            className="flex-1"
          >
            <Users className="w-4 h-4" />
            Hierarchy
          </Button>
        </div>

        {/* Work History Section */}
        {showWorkHistory && (
          <Card>
            <CardHeader>
              <CardTitle>Work History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-primary pl-4">
                  <h4 className="font-semibold">Senior Mechanic</h4>
                  <p className="text-sm text-muted-foreground">RoadGuard Services • 2022 - Present</p>
                  <p className="text-sm mt-1">Leading roadside assistance operations and managing emergency repairs.</p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h4 className="font-semibold">Automotive Technician</h4>
                  <p className="text-sm text-muted-foreground">AutoCare Plus • 2020 - 2022</p>
                  <p className="text-sm mt-1">Performed vehicle diagnostics and repairs in workshop environment.</p>
                </div>
                <div className="border-l-2 border-muted pl-4">
                  <h4 className="font-semibold">Junior Mechanic</h4>
                  <p className="text-sm text-muted-foreground">QuickFix Motors • 2018 - 2020</p>
                  <p className="text-sm mt-1">Entry-level position focusing on basic maintenance and repairs.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hierarchy Section */}
        {showHierarchy && (
          <Card>
            <CardHeader>
              <CardTitle>Organization Hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-block p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <h4 className="font-semibold">Workshop Owner</h4>
                    <p className="text-sm text-muted-foreground">Michael Johnson</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-border"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold">Senior Mechanic</h4>
                      <p className="text-sm text-muted-foreground">You</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold">Operations Manager</h4>
                      <p className="text-sm text-muted-foreground">Sarah Davis</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-border"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="inline-block p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold">Junior Mechanic</h4>
                      <p className="text-sm text-muted-foreground">Alex Wilson</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold">Junior Mechanic</h4>
                      <p className="text-sm text-muted-foreground">Emma Brown</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="inline-block p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <h4 className="font-semibold">Dispatcher</h4>
                      <p className="text-sm text-muted-foreground">Tom Garcia</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Role Management Section */}
        {canEditRoles && (
          <Card>
            <CardHeader>
              <CardTitle>Role Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  As an admin, you can modify roles and grant permissions to other users.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Alex Wilson', role: 'worker', email: 'alex@roadguard.com' },
                    { name: 'Emma Brown', role: 'worker', email: 'emma@roadguard.com' },
                    { name: 'Tom Garcia', role: 'user', email: 'tom@roadguard.com' },
                  ].map((member, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <Select defaultValue={member.role}>
                        <SelectTrigger className="w-full">
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
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;