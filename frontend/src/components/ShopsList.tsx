import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Building2, User, Phone, Send } from 'lucide-react';

const ShopsList = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [requestForm, setRequestForm] = useState({
    message: '',
    location: '',
    urgency: 'medium'
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/requests/shops');
      const data = await response.json();
      setShops(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load shops",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async () => {
    if (!selectedMechanic || !requestForm.message || !requestForm.location) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/requests/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          adminId: selectedShop.admin._id,
          mechanicId: selectedMechanic,
          shopId: selectedShop.shopId,
          message: requestForm.message,
          location: requestForm.location,
          urgency: requestForm.urgency
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Request sent successfully!"
        });
        setRequestForm({ message: '', location: '', urgency: 'medium' });
        setSelectedMechanic('');
        setSelectedShop(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request",
        variant: "destructive"
      });
    }
  };

  if (loading) return <div>Loading shops...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Available Shops</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <Card key={shop.shopId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {shop.shopName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Admin: {shop.admin.firstName} {shop.admin.lastName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">{shop.phone}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {shop.mechanics.length} mechanics available
                </div>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full" 
                    onClick={() => setSelectedShop(shop)}
                  >
                    Request Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Request Service from {shop.shopName}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Mechanic</Label>
                      <Select value={selectedMechanic} onValueChange={setSelectedMechanic}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a mechanic" />
                        </SelectTrigger>
                        <SelectContent>
                          {shop.mechanics.map((mechanic) => (
                            <SelectItem key={mechanic._id} value={mechanic._id}>
                              {mechanic.firstName} {mechanic.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Your Location</Label>
                      <Input
                        placeholder="Enter your current location"
                        value={requestForm.location}
                        onChange={(e) => setRequestForm({...requestForm, location: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Urgency</Label>
                      <Select value={requestForm.urgency} onValueChange={(value) => setRequestForm({...requestForm, urgency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Describe your issue..."
                        value={requestForm.message}
                        onChange={(e) => setRequestForm({...requestForm, message: e.target.value})}
                      />
                    </div>
                    
                    <Button onClick={sendRequest} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      Send Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShopsList;