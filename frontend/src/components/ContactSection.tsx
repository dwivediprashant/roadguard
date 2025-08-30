import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export const ContactSection = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Emergency Hotline",
      details: ["1-800-ROADGUARD", "(1-800-762-3482)"],
      description: "24/7 Emergency Response"
    },
    {
      icon: Mail,
      title: "Email Support",
      details: ["support@roadguard.com", "partners@roadguard.com"],
      description: "General inquiries & partnerships"
    },
    {
      icon: MapPin,
      title: "Headquarters",
      details: ["123 Innovation Drive", "Tech Valley, CA 94025"],
      description: "Corporate office & dispatch center"
    },
    {
      icon: Clock,
      title: "Response Times",
      details: ["Emergency: 5-15 minutes", "Standard: 15-30 minutes"],
      description: "Average arrival times"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Get in <span className="gradient-emergency bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Need help or have questions? We're here 24/7 to assist you. 
            Reach out for emergency support or general inquiries.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="trust-glow">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Your Name" />
                  <Input placeholder="Email Address" type="email" />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Input placeholder="Phone Number" type="tel" />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option>General Inquiry</option>
                    <option>Emergency Support</option>
                    <option>Become a Mechanic</option>
                    <option>Partnership</option>
                    <option>Feedback</option>
                  </select>
                </div>

                <Textarea 
                  placeholder="Tell us how we can help you..."
                  className="min-h-32"
                />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="emergency" size="lg" className="flex-1">
                    <Phone className="w-5 h-5" />
                    Emergency Help Now
                  </Button>
                  <Button variant="trust" size="lg" className="flex-1">
                    <Mail className="w-5 h-5" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="transition-smooth hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 gradient-trust rounded-lg flex items-center justify-center shrink-0">
                      <info.icon className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">{info.title}</h3>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-sm font-mono text-muted-foreground">
                          {detail}
                        </p>
                      ))}
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Emergency Notice */}
            <Card className="emergency-glow animate-pulse-glow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 gradient-emergency rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Emergency Situation?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Don't wait - call our emergency hotline for immediate assistance
                </p>
                <Button variant="emergency" className="w-full">
                  Call Emergency Line
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};