import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight,
  Wrench,
  Shield,
  Star,
  Users
} from "lucide-react";

const WorkerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: "Welcome back!",
        description: "Successfully logged in as worker",
      });
      navigate('/worker-dashboard');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-background"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-secondary/5 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-secondary/15 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-secondary/20 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <Wrench className="w-8 h-8 text-secondary-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-secondary">
                  Worker Login
                </CardTitle>
                <p className="text-muted-foreground">
                  Sign in to start helping drivers in need
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="worker@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 border-secondary/20 focus:border-secondary/50"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10 border-secondary/20 focus:border-secondary/50"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Link to="/forgot-password" className="text-secondary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  variant="secondary"
                  size="lg" 
                  className="w-full font-semibold"
                  disabled={isLoading}
                >
                  <Wrench className="w-5 h-5 mr-2" />
                  {isLoading ? 'Signing in...' : 'Sign In as Worker'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Don't have a worker account?{" "}
                  <Link to="/signup" className="text-secondary hover:underline font-medium">
                    Sign up here
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  Need help as a user?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    User Login
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Worker Benefits */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center p-4 border-secondary/20">
              <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold text-secondary">Flexible Hours</h3>
              <p className="text-xs text-muted-foreground">Work when you want</p>
            </Card>
            <Card className="text-center p-4 border-secondary/20">
              <Star className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold text-secondary">Earn More</h3>
              <p className="text-xs text-muted-foreground">Competitive rates</p>
            </Card>
            <Card className="text-center p-4 border-secondary/20">
              <Shield className="w-8 h-8 text-secondary mx-auto mb-2" />
              <h3 className="font-semibold text-secondary">Secure Platform</h3>
              <p className="text-xs text-muted-foreground">Safe & reliable</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerLogin;