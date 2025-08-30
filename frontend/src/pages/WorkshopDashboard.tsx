import React, { useState, useEffect } from 'react';
import { Search, List, Grid, Map, Star, User } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { workshopAPI } from '../lib/api';
import { Link } from 'react-router-dom';

interface Workshop {
  _id?: string;
  name: string;
  description: string;
  status: 'open' | 'closed';
  rating: number;
  reviewCount: number;
  distance?: number;
  location: {
    city: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  services: string[];
  thumbnail?: string;
  contact: {
    phone: string;
    email: string;
  };
  owner?: {
    name: string;
  };
}

interface ApiResponse {
  workshops: Workshop[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const WorkshopDashboard = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');
  const [customDistance, setCustomDistance] = useState('');
  const [view, setView] = useState<'list' | 'card' | 'map'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWorkshops();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search, statusFilter, distanceFilter, customDistance, currentPage]);

  const fetchWorkshops = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (distanceFilter !== 'all') {
        const distance = distanceFilter === 'custom' ? customDistance : distanceFilter.replace('km', '');
        if (distance && !isNaN(Number(distance))) {
          params.distance = distance;
        }
      }
      
      const response = await workshopAPI.getWorkshops(params);
      const data: ApiResponse = response.data;
      
      setWorkshops(data.workshops || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch workshops:', error);
      setWorkshops([
        { 
          _id: '1', 
          name: 'Elite Motors Workshop', 
          description: 'Premium automotive service center for luxury and sports cars.',
          status: 'open', 
          rating: 4.9, 
          reviewCount: 234,
          distance: 2.5, 
          location: { city: 'Uptown', address: '789 Park Lane', coordinates: { lat: 34.0522, lng: -118.2437 } }, 
          services: ['Luxury Car Service', 'Performance Tuning', 'Detailing', 'Restoration'],
          contact: { phone: '+1-555-0789', email: 'contact@elitemotors.com' },
          owner: { name: 'Harry' }
        },
        { 
          _id: '2', 
          name: 'Budget Auto Repair', 
          description: 'Affordable automotive services without compromising on quality.',
          status: 'open', 
          rating: 4.0, 
          reviewCount: 67,
          distance: 5.0, 
          location: { city: 'Southside', address: '321 Industrial Blvd', coordinates: { lat: 34.0523, lng: -118.2438 } }, 
          services: ['Basic Maintenance', 'Inspection', 'Minor Repairs', 'Parts Replacement'],
          contact: { phone: '+1-555-0321', email: 'info@budgetautorepair.com' },
          owner: { name: 'John' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
      ))}
    </div>
  );

  const WorkshopCard = ({ workshop }: { workshop: Workshop }) => (
    <Card className="glass-effect border-primary/20 hover:border-primary/50 transition-smooth hover:emergency-glow group animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 gradient-hero rounded-xl flex items-center justify-center overflow-hidden">
            <img src={workshop.thumbnail || "https://via.placeholder.com/80x80?text=Workshop"} alt={workshop.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-smooth">{workshop.name}</h3>
              <Badge 
                variant={workshop.status === 'open' ? 'default' : 'secondary'}
                className={workshop.status === 'open' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted text-muted-foreground'}
              >
                {workshop.status}
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground text-xs line-clamp-2">{workshop.description}</p>
              <div className="flex items-center gap-2">
                {renderStars(workshop.rating)}
                <span className="text-accent font-medium">{workshop.rating}</span>
                <span className="text-muted-foreground">({workshop.reviewCount} reviews)</span>
              </div>
              <div className="text-foreground">{workshop.distance} km away</div>
              <div className="text-muted-foreground">{workshop.location.city}, {workshop.location.address}</div>
              <div className="flex flex-wrap gap-1 mt-2">
                {workshop.services?.slice(0, 2).map((service, idx) => (
                  <span key={idx} className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs">
                    {service}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{workshop.owner?.name || 'Owner'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const WorkshopListItem = ({ workshop }: { workshop: Workshop }) => (
    <div className="flex items-center gap-4 p-4 border-b border-border hover:bg-muted/50 transition-smooth">
      <div className="w-16 h-16 gradient-hero rounded-lg flex items-center justify-center overflow-hidden">
        <img src={workshop.thumbnail || "https://via.placeholder.com/64x64?text=Workshop"} alt={workshop.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-foreground text-lg">{workshop.name}</h3>
          <Badge 
            variant={workshop.status === 'open' ? 'default' : 'secondary'}
            className={workshop.status === 'open' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-muted text-muted-foreground'}
          >
            {workshop.status}
          </Badge>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{workshop.description}</p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              {renderStars(workshop.rating)}
              <span className="text-accent font-medium">{workshop.rating}</span>
              <span className="text-muted-foreground">({workshop.reviewCount})</span>
            </div>
            <span className="text-foreground">{workshop.distance} km</span>
            <span className="text-muted-foreground">{workshop.location.city}</span>
            <span className="text-muted-foreground">by {workshop.owner?.name || 'Owner'}</span>
          </div>
          <div className="flex gap-2 mt-2">
            {workshop.services?.slice(0, 3).map((service, idx) => (
              <span key={idx} className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs">
                {service}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 gradient-emergency rounded-full opacity-5 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 gradient-trust rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-emergency bg-clip-text text-transparent">
              Workshop Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Find the perfect workshop for your needs</p>
          </div>
          <Button 
            variant="emergency" 
            className="emergency-glow"
            onClick={() => window.location.href = '/login'}
          >
            Login
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="glass-effect border-primary/20 mb-8 emergency-glow">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search workshops..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 glass-effect border-primary/20 focus:border-primary/50"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 glass-effect border-primary/20">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="w-32 glass-effect border-primary/20">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="2km">2 km</SelectItem>
                  <SelectItem value="5km">5 km</SelectItem>
                  <SelectItem value="10km">10 km</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>

              {distanceFilter === 'custom' && (
                <Input
                  placeholder="Distance (km)"
                  value={customDistance}
                  onChange={(e) => setCustomDistance(e.target.value)}
                  className="w-32 glass-effect border-primary/20"
                  type="number"
                />
              )}

              <div className="flex gap-2">
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('list')}
                  className={view === 'list' ? 'gradient-emergency' : 'glass-effect border-primary/20'}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={view === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('card')}
                  className={view === 'card' ? 'gradient-emergency' : 'glass-effect border-primary/20'}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={view === 'map' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView('map')}
                  className={view === 'map' ? 'gradient-emergency' : 'glass-effect border-primary/20'}
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground mt-4 text-lg">Loading workshops...</p>
          </div>
        ) : workshops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No workshops found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            {view === 'map' ? (
              <Card className="glass-effect border-primary/20 p-12 text-center">
                <Map className="w-20 h-20 mx-auto mb-6 text-primary" />
                <p className="text-muted-foreground text-lg">Map view - Workshop locations would be displayed here</p>
              </Card>
            ) : view === 'list' ? (
              <Card className="glass-effect border-primary/20 overflow-hidden">
                {workshops.map(workshop => (
                  <WorkshopListItem key={workshop._id} workshop={workshop} />
                ))}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workshops.map(workshop => (
                  <WorkshopCard key={workshop._id} workshop={workshop} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent className="gap-2">
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={`${currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} glass-effect border-primary/20`}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          onClick={() => setCurrentPage(i + 1)}
                          isActive={currentPage === i + 1}
                          className={`cursor-pointer ${currentPage === i + 1 ? 'gradient-emergency text-primary-foreground' : 'glass-effect border-primary/20'}`}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={`${currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} glass-effect border-primary/20`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkshopDashboard;