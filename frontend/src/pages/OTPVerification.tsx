import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authAPI } from "@/lib/api";
import { Car, Phone, Shield, ArrowRight, ArrowLeft } from "lucide-react";

const OTPVerification = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get redirect path from location state
  const redirectTo = location.state?.from || '/user-dashboard';

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await authAPI.sendOTP(phoneNumber);
      
      toast({
        title: "OTP Sent",
        description: `Verification code sent to ${phoneNumber}`,
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 4-digit code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(phoneNumber, otp);
      const data = response.data;
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: "Login Successful",
        description: "Welcome to RoadGuard!",
      });
      
      // Navigate to intended destination
      navigate(redirectTo);
    } catch (error: any) {
      toast({
        title: "Invalid OTP",
        description: error.response?.data?.error || "The verification code is incorrect. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 gradient-emergency rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 gradient-trust rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md glass-effect border-primary/20 emergency-glow relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 gradient-hero rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold gradient-emergency bg-clip-text text-transparent">
              RoadGuard Login
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {step === 'phone' ? 'Enter your phone number to continue' : 'Enter the verification code'}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="pl-10 glass-effect border-primary/20 focus:border-primary/50"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSendOTP} 
                variant="emergency"
                className="w-full emergency-glow" 
                disabled={loading}
              >
                {loading ? (
                  "Sending OTP..."
                ) : (
                  <>
                    Send Verification Code
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    We've sent a 4-digit code to<br />
                    <span className="font-medium">{phoneNumber}</span>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Verification Code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={handleVerifyOTP} 
                  variant="emergency"
                  className="w-full emergency-glow" 
                  disabled={loading || otp.length !== 4}
                >
                  {loading ? "Verifying..." : "Verify & Continue"}
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('phone')} 
                  className="w-full"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Change Phone Number
                </Button>
                
                <div className="text-center">
                  <Button variant="link" onClick={handleSendOTP} disabled={loading}>
                    Didn't receive code? Resend
                  </Button>
                </div>
              </div>
            </>
          )}
          
          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerification;