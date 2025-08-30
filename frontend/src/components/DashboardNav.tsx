import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { User, LogOut, Home, Shield } from "lucide-react";

export const DashboardNav = () => {
  const { user, logout } = useAuth();

  const roleColors = {
    admin: 'bg-red-500',
    worker: 'bg-blue-500',
    user: 'bg-green-500'
  };

  return (
    <div className="flex items-center justify-between p-4 border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          RoadGuard
        </h1>
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="hover:bg-blue-50">
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link to="/profile">
          <Button variant="ghost" size="sm" className="hover:bg-blue-50">
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </Link>
        {user?.userType === 'admin' && (
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="hover:bg-red-50 text-red-600">
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </Link>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImage} alt="Profile" />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {user?.firstName} {user?.lastName}
              </span>
              <Badge className={`${roleColors[user?.userType || 'user']} text-white text-xs`}>
                {user?.userType === 'admin' ? 'Admin' : 
                 user?.userType === 'worker' ? 'Worker' : 'User'}
              </Badge>
            </div>
          </div>
        </div>
        <Button onClick={logout} variant="outline" size="sm" className="hover:bg-red-50 text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};