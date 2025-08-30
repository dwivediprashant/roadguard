import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  const footerSections = [
    {
      title: "Services",
      links: [
        "Battery Jump Start",
        "Flat Tire Repair", 
        "Emergency Fuel",
        "Car Lockout",
        "Engine Diagnostics",
        "Vehicle Towing"
      ]
    },
    {
      title: "Company",
      links: [
        "About Us",
        "How It Works",
        "Become a Mechanic",
        "Partner With Us", 
        "Careers",
        "Press Kit"
      ]
    },
    {
      title: "Support",
      links: [
        "Help Center",
        "Safety Guidelines",
        "Terms of Service",
        "Privacy Policy",
        "Contact Support",
        "Report Issue"
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">RoadGuard</span>
            </div>
            
            <p className="text-muted-foreground max-w-md">
              Professional roadside assistance platform connecting drivers with verified mechanics. 
              Emergency help when you need it most, 24/7 support nationwide.
            </p>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-foreground font-semibold">1-800-ROADGUARD</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-secondary" />
                <span className="text-muted-foreground">support@roadguard.com</span>
              </div>
            </div>

            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 gradient-trust rounded-lg flex items-center justify-center transition-smooth hover:shadow-lg hover:scale-105"
                >
                  <social.icon className="w-5 h-5 text-secondary-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href="#"
                      className="text-muted-foreground hover:text-primary transition-smooth"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2024 RoadGuard. All rights reserved. Professional roadside assistance platform.
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-smooth">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-smooth">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-smooth">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};