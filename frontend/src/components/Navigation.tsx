import { Button } from "@/components/ui/button";
import { Shield, User, Settings2, Crown } from "lucide-react";

const Navigation = () => {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <Shield className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-xl font-bold text-white">RoadGuard</h1>
            <p className="text-sm text-gray-400">Roadside Assistance Platform</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/enhanced-login'}
            className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
          >
            <User className="h-4 w-4 mr-2" />
            Enhanced Login
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/admin-dashboard'}
            className="text-yellow-500 hover:bg-yellow-500 hover:text-white"
          >
            <Crown className="h-4 w-4 mr-2" />
            Admin
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/worker-dashboard'}
            className="text-blue-500 hover:bg-blue-500 hover:text-white"
          >
            <Settings2 className="h-4 w-4 mr-2" />
            Worker
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;