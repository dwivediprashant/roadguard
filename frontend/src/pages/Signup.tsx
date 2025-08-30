import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone,
  ArrowRight,
  Shield,
  Star,
  CheckCircle,
  Wrench,
  Car,
  Users,
  Zap,
  UserCheck
} from "lucide-react";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "user", // user or worker
    agreeToTerms: false,
    subscribeNewsletter: false
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      toast({
        title: "Registration successful",
        description: "Welcome to RoadGuard!",
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Registration failed",
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
      <div className="absolute inset-0 gradient-subtle"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 gradient-emergency rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 gradient-trust rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 gradient-hero rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-effect border-2 border-primary/20 emergency-glow animate-scale-in">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 gradient-hero rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
                <Star className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold text-foreground">
                  Create Account
                </CardTitle>
                <p className="text-muted-foreground">
                  Join RoadGuard for reliable roadside assistance
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">Account Type</Label>
                  <div className="relative">
                    <UserCheck className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
                    <Select value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
                      <SelectTrigger className="pl-10 glass-effect border-primary/20 focus:border-primary/50 h-12">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user" className="cursor-pointer">
                          <div className="flex items-center space-x-3 py-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Car className="w-4 h-4 text-primary" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">User</div>
                              <div className="text-xs text-muted-foreground">I need roadside assistance</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="worker" className="cursor-pointer">
                          <div className="flex items-center space-x-3 py-2">
                            <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                              <Wrench className="w-4 h-4 text-secondary" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium">Worker</div>
                              <div className="text-xs text-muted-foreground">I provide roadside services</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Role Description */}
                  {formData.userType && (
                    <div className={`p-4 rounded-lg border transition-all duration-300 ${
                      formData.userType === "user" 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-secondary/5 border-secondary/20"
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          formData.userType === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        }`}>
                          {formData.userType === "user" ? <Car className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold capitalize">{formData.userType}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formData.userType === "user" 
                              ? "Get instant help with roadside emergencies, flat tires, battery jumps, and more."
                              : "Earn money by helping drivers in need. Set your own schedule and work flexibly."
                            }
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {formData.userType === "user" ? (
                            <>
                              <Badge variant="secondary" className="text-xs">24/7 Help</Badge>
                              <Badge variant="secondary" className="text-xs">Instant</Badge>
                            </>
                          ) : (
                            <>
                              <Badge variant="outline" className="text-xs">Flexible</Badge>
                              <Badge variant="outline" className="text-xs">Earn More</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="pl-10 glass-effect border-primary/20 focus:border-primary/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="glass-effect border-primary/20 focus:border-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Contact Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10 glass-effect border-primary/20 focus:border-primary/50"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="pl-10 glass-effect border-primary/20 focus:border-primary/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10 glass-effect border-primary/20 focus:border-primary/50"
                        required
                        minLength={6}
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
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className="pl-10 pr-10 glass-effect border-primary/20 focus:border-primary/50"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newsletter"
                      checked={formData.subscribeNewsletter}
                      onCheckedChange={(checked) => handleInputChange("subscribeNewsletter", checked as boolean)}
                    />
                    <Label htmlFor="newsletter" className="text-sm">
                      Subscribe to our newsletter for emergency tips and updates
                    </Label>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  variant={formData.userType === "user" ? "default" : "secondary"}
                  size="lg" 
                  className="w-full transition-all duration-300 hover:scale-105 font-semibold"
                  disabled={!formData.agreeToTerms || isLoading}
                >
                  {formData.userType === "user" ? <Car className="w-5 h-5 mr-2" /> : <Wrench className="w-5 h-5 mr-2" />}
                  {isLoading ? 'Creating Account...' : `Join as ${formData.userType === 'user' ? 'User' : 'Worker'}`}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="glass-effect">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" className="glass-effect">
                  <Phone className="w-5 h-5" />
                  Phone
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="mt-8">
            <Card className="glass-effect border-primary/10">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">Why Choose RoadGuard?</h3>
                  <p className="text-sm text-muted-foreground">Join thousands of satisfied {formData.userType === "user" ? "users" : "workers"}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.userType === "user" ? (
                    <>
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold text-primary">Instant Help</h4>
                        <p className="text-xs text-muted-foreground">Get assistance in minutes</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold text-primary">Verified Workers</h4>
                        <p className="text-xs text-muted-foreground">Background-checked professionals</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                          <Star className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold text-primary">Rated Service</h4>
                        <p className="text-xs text-muted-foreground">Quality guaranteed</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                          <Users className="w-6 h-6 text-secondary" />
                        </div>
                        <h4 className="font-semibold text-secondary">Flexible Work</h4>
                        <p className="text-xs text-muted-foreground">Choose your own hours</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                          <CheckCircle className="w-6 h-6 text-secondary" />
                        </div>
                        <h4 className="font-semibold text-secondary">Earn More</h4>
                        <p className="text-xs text-muted-foreground">Competitive rates</p>
                      </div>
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                          <Shield className="w-6 h-6 text-secondary" />
                        </div>
                        <h4 className="font-semibold text-secondary">Secure Platform</h4>
                        <p className="text-xs text-muted-foreground">Safe transactions</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;