import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Wrench, 
  Battery, 
  Car, 
  Fuel, 
  Key, 
  Truck,
  Clock,
  Shield,
  MapPin,
  Users
} from "lucide-react";

export const ServicesSection = () => {
  const services = [
    {
      icon: Battery,
      title: "Battery Jump Start",
      description: "Dead battery? Our mechanics arrive with professional jump start equipment.",
      time: "5-15 min",
      badge: "Most Popular"
    },
    {
      icon: Car,
      title: "Flat Tire Repair",
      description: "Professional tire change service with spare tire installation.",
      time: "10-20 min",
      badge: null
    },
    {
      icon: Fuel,
      title: "Emergency Fuel Delivery",
      description: "Ran out of gas? We deliver fuel directly to your location.",
      time: "15-25 min",
      badge: null
    },
    {
      icon: Key,
      title: "Car Lockout Service",
      description: "Locked out of your car? Our certified locksmiths can help safely.",
      time: "10-30 min",
      badge: null
    },
    {
      icon: Wrench,
      title: "Engine Diagnostics",
      description: "On-site engine diagnostics and minor repair services.",
      time: "20-45 min",
      badge: "Professional"
    },
    {
      icon: Truck,
      title: "Vehicle Towing",
      description: "Professional towing service to the nearest repair shop.",
      time: "20-40 min",
      badge: null
    }
  ];

  const features = [
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Round-the-clock emergency assistance"
    },
    {
      icon: MapPin,
      title: "Real-time Tracking",
      description: "Track your mechanic's arrival in real-time"
    },
    {
      icon: Shield,
      title: "Verified Mechanics",
      description: "All mechanics are certified and background-checked"
    },
    {
      icon: Users,
      title: "500+ Mechanics",
      description: "Large network ensuring quick response times"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Emergency <span className="gradient-emergency bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional roadside assistance for all types of vehicle emergencies. 
            Our certified mechanics are ready to help 24/7.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="transition-smooth hover:shadow-lg hover:transform hover:scale-105">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 gradient-emergency rounded-lg flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  {service.badge && (
                    <Badge variant="secondary">{service.badge}</Badge>
                  )}
                </div>
                <CardTitle className="text-foreground">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{service.description}</p>
                <div className="flex items-center space-x-2 text-sm text-accent font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Response time: {service.time}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 gradient-trust rounded-full flex items-center justify-center mx-auto">
                <feature.icon className="w-8 h-8 text-secondary-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};