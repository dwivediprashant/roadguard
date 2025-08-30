import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { authAPI } from '@/lib/api';

const WorkerSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    shopId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.workerSignup({
        ...formData,
        userType: 'worker'
      });

      toast({
        title: "Success",
        description: "Worker account created successfully!"
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('shopName', response.data.shopName);
      
      navigate('/worker');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Registration failed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateShopId = async (shopId: string) => {
    if (shopId.length < 6) {
      setShopInfo(null);
      return;
    }

    setShopLoading(true);
    try {
      const response = await authAPI.getShopInfo(shopId);
      setShopInfo(response.data);
    } catch (error) {
      setShopInfo(null);
      toast({
        title: "Invalid Shop ID",
        description: "Shop not found. Please check the ID.",
        variant: "destructive"
      });
    } finally {
      setShopLoading(false);
    }
  };

  useEffect(() => {
    if (formData.shopId) {
      const timeoutId = setTimeout(() => {
        validateShopId(formData.shopId);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setShopInfo(null);
    }
  }, [formData.shopId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Worker Signup</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="shopId">Shop ID (Optional)</Label>
              <Input
                id="shopId"
                placeholder="Enter your shop ID (e.g., SH123ABC)"
                value={formData.shopId}
                onChange={(e) => setFormData({...formData, shopId: e.target.value.toUpperCase()})}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if you don't have a shop ID yet
              </p>
              {shopLoading && (
                <p className="text-xs text-blue-500 mt-1">Validating shop ID...</p>
              )}
              {shopInfo && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700 font-medium">{shopInfo.shopName}</p>
                  <p className="text-xs text-green-600">Shop found! You can proceed with registration.</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Worker Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/worker-login')}
            >
              Already have an account? Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkerSignup;