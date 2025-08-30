import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Shield, Phone } from "lucide-react";
import heroImage from "@/assets/hero-roadside.jpg";

export const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
      {/* Enhanced Background with Parallax Effect */}
      <div className="absolute inset-0 gradient-subtle"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-5 dark:opacity-10 parallax-bg"
        style={{ backgroundImage: `url(${heroImage})` }}
      ></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 gradient-emergency rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 gradient-trust rounded-full opacity-15 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 gradient-hero rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4 animate-slide-up">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Emergency Roadside
                <span className="gradient-hero bg-clip-text text-transparent"> Assistance</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Connect with nearby mechanics instantly. Professional help arrives within minutes, 
                24/7 emergency support for all your vehicle breakdowns.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5min</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">500+</div>
                <div className="text-sm text-muted-foreground">Mechanics</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <Button variant="hero" size="lg" className="flex-1 sm:flex-none">
                <Phone className="w-5 h-5" />
                Get Emergency Help
              </Button>
              <Button variant="trust" size="lg" className="flex-1 sm:flex-none">
                <MapPin className="w-5 h-5" />
                Find Mechanics Near Me
              </Button>
            </div>
          </div>

          {/* Right Content - Enhanced Quick Request Form */}
          <div className="animate-float">
            <Card className="emergency-glow glass-effect border-2 border-primary/20">
              <CardContent className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">Need Help Now?</h3>
                  <p className="text-muted-foreground">Get connected to the nearest mechanic</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Enter your location" 
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option>Car</option>
                      <option>Motorcycle</option>
                      <option>Truck</option>
                    </select>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                      <option>Engine Issue</option>
                      <option>Flat Tire</option>
                      <option>Battery Dead</option>
                      <option>Out of Fuel</option>
                      <option>Locked Out</option>
                    </select>
                  </div>

                  <Button variant="emergency" size="lg" className="w-full">
                    <Clock className="w-5 h-5" />
                    Request Emergency Help
                  </Button>

                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Secure & Verified Mechanics</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};