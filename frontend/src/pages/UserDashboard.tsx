import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI, workshopAPI } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { 
  Car, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  AlertTriangle,
  Navigation,
  Wrench,
  Shield,
  User,
  Edit2,
  Save,
  Camera,
  Users,
  Settings,
  Search,
  Filter,
  List,
  Grid,
  Map,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    currentEmployer: '',
    language: 'en',
    profileImage: '',
    workHistory: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Workshop state
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('');
  const [customDistance, setCustomDistance] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // Default NYC

  const languages = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch'
  };

  const distanceOptions = [
    { value: '2', label: '2 km' },
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: 'custom', label: 'Custom' }
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        currentEmployer: user.currentEmployer || 'RoadGuard Services',
        language: user.language || 'en',
        profileImage: user.profileImage || '',
        workHistory: user.workHistory || []
      });
    }
    fetchWorkshops();
    getUserLocation();
  }, [user]);

  useEffect(() => {
    fetchWorkshops();
  }, [searchQuery, statusFilter, distanceFilter, customDistance, currentPage]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied, using default location');
        }
      );
    }
  };

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchQuery,
        status: statusFilter,
        distance: distanceFilter === 'custom' ? customDistance : distanceFilter,
        userLat: userLocation.lat,
        userLng: userLocation.lng,
        page: currentPage,
        limit: 6
      };
      
      const response = await workshopAPI.getWorkshops(params);
      setWorkshops(response.data.workshops);
      setPagination(response.data.pagination);
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch workshops", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchWorkshops();
  };

  const renderWorkshopCard = (workshop: any) => (
    <Card key={workshop._id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <img 
            src={workshop.thumbnail} 
            alt={workshop.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{workshop.name}</h3>
              <Badge variant={workshop.status === 'open' ? 'default' : 'secondary'}>
                {workshop.status}
              </Badge>
            </div>
            <div className="flex items-center space-x-1 mb-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-medium">{workshop.rating}</span>
              <span className="text-sm text-muted-foreground">({workshop.reviewCount} reviews)</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>{workshop.location.city}</span>
              </div>
              {workshop.distance && (
                <div className="flex items-center space-x-1">
                  <Navigation className="w-3 h-3" />
                  <span>{workshop.distance} km away</span>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{workshop.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">By {workshop.owner.name}</span>
              <Button size="sm" variant="outline">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkshopList = (workshop: any) => (
    <div key={workshop._id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <img 
        src={workshop.thumbnail} 
        alt={workshop.name}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold">{workshop.name}</h3>
          <Badge variant={workshop.status === 'open' ? 'default' : 'secondary'}>
            {workshop.status}
          </Badge>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-500 fill-current" />
            <span>{workshop.rating} ({workshop.reviewCount})</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-3 h-3" />
            <span>{workshop.location.city}</span>
          </div>
          {workshop.distance && (
            <div className="flex items-center space-x-1">
              <Navigation className="w-3 h-3" />
              <span>{workshop.distance} km</span>
            </div>
          )}
          <span>By {workshop.owner.name}</span>
        </div>
      </div>
      <Button size="sm" variant="outline">
        View Details
      </Button>
    </div>
  );

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      const userData = response.data.user;
      setProfileData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        currentEmployer: userData.currentEmployer || 'RoadGuard Services',
        language: userData.language || 'en',
        profileImage: userData.profileImage || '',
        workHistory: userData.workHistory || []
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to load profile", variant: "destructive" });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await authAPI.updateProfile(profileData);
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
        setProfileData(prev => ({ ...prev, profileImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">RoadGuard</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {user?.firstName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>User</span>
              </Badge>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search workshops (e.g., Automobile workshop)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Distance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Distance</SelectItem>
                        {distanceOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {distanceFilter === 'custom' && (
                      <Input
                        placeholder="Custom km"
                        value={customDistance}
                        onChange={(e) => setCustomDistance(e.target.value)}
                        className="w-24"
                        type="number"
                      />
                    )}
                    
                    <div className="flex items-center space-x-2 border rounded-lg p-1">
                      <Button
                        type="button"
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={viewMode === 'card' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('card')}
                      >
                        <Grid className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={viewMode === 'map' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('map')}
                      >
                        <Map className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Workshop Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wrench className="w-5 h-5" />
                    <span>Workshops ({pagination.totalItems})</span>
                  </div>
                  {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading workshops...</p>
                  </div>
                ) : workshops.length > 0 ? (
                  <div className="space-y-4">
                    {viewMode === 'map' ? (
                      <div className="h-96 bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Map className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">Map view would be implemented here</p>
                          <p className="text-sm text-muted-foreground">Showing {workshops.length} workshops</p>
                        </div>
                      </div>
                    ) : viewMode === 'card' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {workshops.map(renderWorkshopCard)}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {workshops.map(renderWorkshopList)}
                      </div>
                    )}
                    
                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-center space-x-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={!pagination.hasPrev}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                          disabled={!pagination.hasNext}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No workshops found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Request Button */}
            <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">
                        Need Emergency Help?
                      </h3>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Get roadside assistance in minutes
                      </p>
                    </div>
                  </div>
                  <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
                    <Phone className="w-4 h-4 mr-2" />
                    Request Help
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Car className="w-4 h-4 mr-2" />
                  Flat Tire
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="w-4 h-4 mr-2" />
                  Battery Jump
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Towing Service
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Shield className="w-4 h-4 mr-2" />
                  Lockout Service
                </Button>
              </CardContent>
            </Card>

            {/* Profile Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{user?.firstName} {user?.lastName}</h4>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span>Jan 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total requests</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>4.8</span>
                    </div>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200" onClick={fetchUserProfile}>
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-0 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 pointer-events-none"></div>
                    <div className="relative z-10">
                      <DialogHeader className="pb-6 border-b border-gradient-to-r from-blue-200 to-purple-200">
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          Profile Settings
                        </DialogTitle>
                      </DialogHeader>
                      
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
                        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-slate-700 to-slate-600 p-1 rounded-xl">
                          <TabsTrigger value="profile" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-gray-300">Profile</TabsTrigger>
                          <TabsTrigger value="history" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-gray-300">Work History</TabsTrigger>
                          <TabsTrigger value="hierarchy" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-gray-300">Hierarchy</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-8 mt-8">
                          <div className="flex flex-col items-center space-y-6">
                            <div className="relative group">
                              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                              <Avatar className="relative w-32 h-32 border-4 border-white shadow-xl">
                                <AvatarImage src={profileData.profileImage} className="object-cover" />
                                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                  {profileData.firstName[0]}{profileData.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <label className="absolute bottom-2 right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200">
                                <Camera className="w-4 h-4" />
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                              </label>
                            </div>
                            <div className="text-center">
                              <h3 className="text-xl font-semibold text-white">{profileData.firstName} {profileData.lastName}</h3>
                              <p className="text-gray-300 capitalize">{user?.userType}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-200 mb-2">First Name</label>
                              {isEditing ? (
                                <Input
                                  value={profileData.firstName}
                                  onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                  className="border-2 border-gray-600 bg-slate-700 text-white focus:border-blue-500 rounded-xl px-4 py-3 transition-all duration-200"
                                />
                              ) : (
                                <div className="p-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl border border-gray-600 font-medium text-white">{profileData.firstName}</div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-200 mb-2">Last Name</label>
                              {isEditing ? (
                                <Input
                                  value={profileData.lastName}
                                  onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                  className="border-2 border-gray-600 bg-slate-700 text-white focus:border-blue-500 rounded-xl px-4 py-3 transition-all duration-200"
                                />
                              ) : (
                                <div className="p-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl border border-gray-600 font-medium text-white">{profileData.lastName}</div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-200 mb-2">Current Employer</label>
                              {isEditing ? (
                                <Input
                                  value={profileData.currentEmployer}
                                  onChange={(e) => setProfileData(prev => ({ ...prev, currentEmployer: e.target.value }))}
                                  className="border-2 border-gray-600 bg-slate-700 text-white focus:border-blue-500 rounded-xl px-4 py-3 transition-all duration-200"
                                />
                              ) : (
                                <div className="p-4 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl border border-gray-600 font-medium text-white">{profileData.currentEmployer}</div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-200 mb-2">Language</label>
                              <Select
                                value={profileData.language}
                                onValueChange={(value) => setProfileData(prev => ({ ...prev, language: value }))}
                              >
                                <SelectTrigger className="border-2 border-gray-600 bg-slate-700 text-white focus:border-blue-500 rounded-xl px-4 py-3 transition-all duration-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-0 shadow-xl bg-slate-700 text-white">
                                  {Object.entries(languages).map(([code, name]) => (
                                    <SelectItem key={code} value={code} className="rounded-lg hover:bg-slate-600">{name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex gap-4 pt-6">
                            {isEditing ? (
                              <>
                                <Button onClick={handleSaveProfile} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                                  <Save className="w-4 h-4 mr-2" />
                                  Save Changes
                                </Button>
                                <Button onClick={() => setIsEditing(false)} variant="outline" className="px-8 py-3 rounded-xl border-2 hover:bg-gray-50 transition-all duration-200">
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button onClick={() => setIsEditing(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Profile
                              </Button>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="history" className="mt-8">
                          <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <Wrench className="w-4 h-4 text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-white">Work History</h3>
                            </div>
                            {profileData.workHistory?.map((job, index) => (
                              <div key={index} className="relative pl-8 pb-6 group">
                                <div className="absolute left-0 top-0 w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full border-4 border-slate-800 shadow-lg"></div>
                                {index < profileData.workHistory.length - 1 && (
                                  <div className="absolute left-2 top-4 w-0.5 h-full bg-gradient-to-b from-blue-400 to-purple-400"></div>
                                )}
                                <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-600 hover:shadow-xl transition-all duration-200 ml-6">
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className="font-bold text-lg text-white">{job.position}</h4>
                                    {job.isCurrent && (
                                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs">Current</Badge>
                                    )}
                                  </div>
                                  <p className="text-blue-400 font-semibold mb-2">{job.company}</p>
                                  <p className="text-sm text-gray-300 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {job.startDate} - {job.endDate}
                                  </p>
                                  <p className="text-gray-200 leading-relaxed">{job.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="hierarchy" className="mt-8">
                          <div className="space-y-8">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <h3 className="text-xl font-bold text-white">Organization Hierarchy</h3>
                            </div>
                            
                            <div className="text-center">
                              <div className="inline-block p-6 bg-gradient-to-br from-red-900/50 to-pink-900/50 rounded-2xl shadow-lg border border-red-500/30 hover:shadow-xl transition-all duration-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Shield className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="font-bold text-lg text-white">Workshop Owner</h4>
                                <p className="text-gray-300">Michael Johnson</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-center">
                              <div className="w-0.5 h-12 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full"></div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                              <div className="text-center">
                                <div className="inline-block p-6 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-2xl shadow-lg border border-blue-500/30 hover:shadow-xl transition-all duration-200">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Wrench className="w-5 h-5 text-white" />
                                  </div>
                                  <h4 className="font-bold text-white">Senior Mechanic</h4>
                                  <p className="text-gray-300 font-medium">You</p>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="inline-block p-6 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl shadow-lg border border-purple-500/30 hover:shadow-xl transition-all duration-200">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Settings className="w-5 h-5 text-white" />
                                  </div>
                                  <h4 className="font-bold text-white">Operations Manager</h4>
                                  <p className="text-gray-300">Emma Wilson</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;