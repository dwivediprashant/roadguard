import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface ShopWorkersProps {
  shopId: string;
}

const ShopWorkers = ({ shopId }: ShopWorkersProps) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkers = async () => {
      if (!shopId) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await authAPI.getShopWorkers(shopId);
        setWorkers(response.data.workers);
      } catch (error: any) {
        console.error('Shop workers error:', error);
        if (error.response?.status === 404) {
          console.log('Shop not found or no workers yet');
        } else {
          toast({
            title: "Error",
            description: "Failed to load workers",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkers();
  }, [shopId]);

  return (
    <Card className="glass-effect border-primary/20 rounded-xl mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Shop Workers ({workers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Loading workers...</p>
        ) : workers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No workers registered yet</p>
            <p className="text-sm text-muted-foreground">Share your Shop ID: <strong>{shopId}</strong> with workers to join</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {workers.map((worker: any) => (
              <div key={worker._id} className="glass-effect border-primary/20 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{worker.firstName} {worker.lastName}</h4>
                    <p className="text-sm text-muted-foreground">{worker.email}</p>
                    <p className="text-sm text-muted-foreground">{worker.phone}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined: {new Date(worker.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      worker.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {worker.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShopWorkers;