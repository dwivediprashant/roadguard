import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, Mail, Lock, User, Eye, EyeOff, 
  Chrome, Globe, ArrowRight, UserCheck, Crown, Settings2
} from "lucide-react";

const EnhancedLogin = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    userType: "user"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Role-based redirection
        const redirectPaths = {
          admin: '/admin-dashboard',
          worker: '/worker-dashboard', 
          user: '/user-dashboard'
        };
        
        toast({ 
          title: "Login Successful", 
          description: `Welcome back, ${data.user.firstName}!` 
        });
        
        window.location.href = redirectPaths[data.user.userType] || '/user-dashboard';
      } else {
        toast({ 
          title: "Login Failed", 
          description: data.message || "Invalid credentials",
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Connection failed. Please try again.",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google OAuth integration would go here
    toast({ 
      title: "Google Login", 
      description: "Google authentication coming soon!",
      variant: "default" 
    });
  };

  const handleEmailLogin = () => {
    // Magic link email login would go here
    toast({ 
      title: "Email Login", 
      description: "Magic link sent to your email!",
      variant: "default" 
    });
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'worker': return <Settings2 className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-green-500" />;
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'admin': return 'Workshop Owner & System Administrator';
      case 'worker': return 'Field Worker & Technician';
      default: return 'Service Requester & Customer';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">RoadGuard Login</CardTitle>
              <p className="text-gray-400">Access your dashboard</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-gray-300">Login as</Label>
              <Select 
                value={loginData.userType} 
                onValueChange={(value) => setLoginData({...loginData, userType: value})}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(loginData.userType)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="user" className="text-white">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-green-500" />
                      <div>
                        <p>User</p>
                        <p className="text-xs text-gray-400">Service Requester</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="worker" className="text-white">
                    <div className="flex items-center space-x-2">
                      <Settings2 className="h-4 w-4 text-blue-500" />
                      <div>
                        <p>Worker</p>
                        <p className="text-xs text-gray-400">Field Technician</p>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="text-white">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <div>
                        <p>Admin</p>
                        <p className="text-xs text-gray-400">Workshop Owner</p>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">{getRoleDescription(loginData.userType)}</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <Separator className="bg-gray-600" />
              <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-2 text-xs text-gray-400">
                OR
              </span>
            </div>

            {/* Third-party Login */}
            <div className="space-y-3">
              <Button 
                type="button"
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={handleGoogleLogin}
              >
                <Chrome className="h-4 w-4 mr-2" />
                Continue with Google
              </Button>

              <Button 
                type="button"
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={handleEmailLogin}
              >
                <Mail className="h-4 w-4 mr-2" />
                Sign in with Magic Link
              </Button>
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                Don't have an account?{" "}
                <a href="/register" className="text-green-500 hover:text-green-400 font-medium">
                  Sign up
                </a>
              </p>
              <p className="text-xs text-gray-500">
                <a href="/forgot-password" className="hover:text-gray-400">
                  Forgot your password?
                </a>
              </p>
            </div>

            {/* Demo Credentials */}
            <div className="bg-gray-700 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-gray-300">Demo Credentials:</p>
              <div className="text-xs text-gray-400 space-y-1">
                <p><strong>Admin:</strong> admin@roadguard.com / password123</p>
                <p><strong>Worker:</strong> worker@roadguard.com / password123</p>
                <p><strong>User:</strong> user@roadguard.com / password123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedLogin;