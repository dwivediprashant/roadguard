import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Search, 
  UserCheck, 
  Wrench,
  ArrowRight
} from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: MapPin,
      step: "01",
      title: "Share Your Location",
      description: "Tell us where you are and what type of assistance you need. Our system automatically detects nearby mechanics.",
      highlight: "GPS-enabled location detection"
    },
    {
      icon: Search,
      step: "02", 
      title: "Find Nearby Mechanics",
      description: "Our smart algorithm matches you with verified mechanics based on proximity, availability, and specialization.",
      highlight: "AI-powered matching system"
    },
    {
      icon: UserCheck,
      step: "03",
      title: "Connect & Confirm",
      description: "Review mechanic profiles, ratings, and estimated arrival time. Confirm your request with one tap.",
      highlight: "Verified professional profiles"
    },
    {
      icon: Wrench,
      step: "04",
      title: "Get Professional Help",
      description: "Track your mechanic's arrival in real-time. Get your vehicle fixed by certified professionals.",
      highlight: "Real-time tracking & updates"
    }
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            How <span className="gradient-trust bg-clip-text text-transparent">RoadGuard</span> Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get professional roadside assistance in just a few simple steps. 
            Our smart platform connects you with the right help, fast.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-1/2 top-32 w-px h-16 bg-border transform -translate-x-0.5">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                  </div>
                </div>
              )}

              <div className={`grid lg:grid-cols-2 gap-8 items-center ${
                index % 2 === 1 ? 'lg:direction-rtl' : ''
              }`}>
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-lg px-4 py-2 gradient-emergency text-primary-foreground">
                      {step.step}
                    </Badge>
                    <h3 className="text-2xl font-bold text-foreground">{step.title}</h3>
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 gradient-trust rounded-full"></div>
                    <span className="text-sm font-medium text-secondary">{step.highlight}</span>
                  </div>
                </div>

                {/* Visual */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <Card className="trust-glow transition-smooth hover:shadow-lg">
                    <CardContent className="p-8 text-center">
                      <div className="w-24 h-24 gradient-hero rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                        <step.icon className="w-12 h-12 text-primary-foreground" />
                      </div>
                      <div className="text-4xl font-bold gradient-emergency bg-clip-text text-transparent mb-2">
                        {step.step}
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {step.title}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-card rounded-full px-8 py-4 emergency-glow">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-muted-foreground">Average response time</span>
            </div>
            <div className="text-2xl font-bold gradient-emergency bg-clip-text text-transparent">
              5 minutes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};