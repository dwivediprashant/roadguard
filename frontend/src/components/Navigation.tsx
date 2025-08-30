import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, MapPin, LogIn, UserPlus, LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthButtons = () => {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <div className="hidden sm:flex items-center space-x-2">
        <Link to="/dashboard">
          <Button variant="ghost" className="transition-smooth hover:scale-105">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          onClick={logout}
          className="transition-smooth hover:scale-105"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-center space-x-2">
      <Link to="/admin-login">
        <Button variant="ghost" size="sm">
          Admin
        </Button>
      </Link>
      <Link to="/worker-login">
        <Button variant="ghost" size="sm">
          Worker
        </Button>
      </Link>
      <Link to="/login">
        <Button variant="ghost" className="transition-smooth hover:scale-105">
          <LogIn className="w-4 h-4 mr-2" />
          User Login
        </Button>
      </Link>
      <Link to="/signup">
        <Button variant="trust" className="transition-smooth hover:scale-105">
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Button>
      </Link>
    </div>
  );
};

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition-smooth hover:scale-105">
            <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center shimmer">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">RoadGuard</span>
          </Link>

          {/* Auth & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            <AuthButtons />

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] glass-effect">
                <div className="flex flex-col space-y-4 mt-8">
                  {user ? (
                    <>
                      <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          <LayoutDashboard className="w-5 h-5 mr-3" />
                          Dashboard
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        onClick={() => { logout(); setIsOpen(false); }}
                        className="w-full justify-start text-lg"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start text-lg">
                          <LogIn className="w-5 h-5 mr-3" />
                          User Login
                        </Button>
                      </Link>
                      <Link to="/signup" onClick={() => setIsOpen(false)}>
                        <Button variant="trust" className="w-full justify-start text-lg">
                          <UserPlus className="w-5 h-5 mr-3" />
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};