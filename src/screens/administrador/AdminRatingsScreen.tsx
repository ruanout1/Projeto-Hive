import { useState } from 'react';
import { Star, MessageSquare, MapPin, TrendingUp, Filter, Search, Send } from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';

interface Rating {
  id: string;
  clientName: string;
  serviceName: string;
  rating: number;
  comment: string;
  region: string;
  date: string;
  response?: string;
  responseDate?: string;
}

// Mock data
const mockRatings: Rating[] = [
  {
    id: '1',
    clientName: 'Maria Silva',
    serviceName: 'Limpeza Completa Residencial',
    rating: 5,
    comment: 'Excelente serviço! A equipe foi muito profissional e deixou tudo impecável.',
    region: 'Zona Sul',
    date: '28/09/2025',
  },
  {
    id: '2',
    clientName: 'João Santos',
    serviceName: 'Manutenção de Jardim',
    rating: 4,
    comment: 'Bom trabalho, mas demorou um pouco mais do que o esperado.',
    region: 'Zona Norte',
    date: '27/09/2025',
    response: 'Obrigado pelo feedback! Estamos trabalhando para otimizar nossos tempos de serviço.',
    responseDate: '28/09/2025'
  },
  {
    id: '3',
    clientName: 'Ana Paula Costa',
    serviceName: 'Limpeza Pós-Obra',
    rating: 5,
    comment: 'Perfeito! Recomendo muito. A casa ficou irreconhecível.',
    region: 'Zona Oeste',
    date: '26/09/2025',
  },
  {
    id: '4',
    clientName: 'Carlos Mendes',
    serviceName: 'Limpeza Completa Residencial',
    rating: 3,
    comment: 'Serviço razoável. Alguns detalhes poderiam ter sido melhor executados.',
    region: 'Centro',
    date: '25/09/2025',
  },
  {
    id: '5',
    clientName: 'Fernanda Lima',
    serviceName: 'Manutenção de Jardim',
    rating: 5,
    comment: 'Adorei o resultado! Voltarei a contratar com certeza.',
    region: 'Zona Sul',
    date: '24/09/2025',
    response: 'Ficamos muito felizes com sua satisfação! Até a próxima!',
    responseDate: '25/09/2025'
  },
  {
    id: '6',
    clientName: 'Roberto Silva',
    serviceName: 'Limpeza Completa Residencial',
    rating: 4,
    comment: 'Muito bom! Apenas alguns pequenos ajustes necessários.',
    region: 'Zona Norte',
    date: '23/09/2025',
  },
  {
    id: '7',
    clientName: 'Juliana Santos',
    serviceName: 'Limpeza Pós-Obra',
    rating: 5,
    comment: 'Impecável! Superou minhas expectativas.',
    region: 'Zona Leste',
    date: '22/09/2025',
  },
  {
    id: '8',
    clientName: 'Pedro Costa',
    serviceName: 'Manutenção de Jardim',
    rating: 4,
    comment: 'Bom atendimento e resultado satisfatório.',
    region: 'Zona Oeste',
    date: '21/09/2025',
  }
];

const regions = ['Todas', 'Zona Sul', 'Zona Norte', 'Zona Oeste', 'Zona Leste', 'Centro'];

interface AdminRatingsScreenProps {
  onBack?: () => void;
}

export default function AdminRatingsScreen({ onBack }: AdminRatingsScreenProps) {
  const [ratings, setRatings] = useState<Rating[]>(mockRatings);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('Todas');
  const [filterRating, setFilterRating] = useState('todas');
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [responseText, setResponseText] = useState('');

  const filteredRatings = ratings.filter(rating => {
    const matchesSearch = 
      rating.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rating.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = filterRegion === 'Todas' || rating.region === filterRegion;
    
    const matchesRating = 
      filterRating === 'todas' ||
      (filterRating === '5' && rating.rating === 5) ||
      (filterRating === '4' && rating.rating === 4) ||
      (filterRating === '3-' && rating.rating <= 3);
    
    return matchesSearch && matchesRegion && matchesRating;
  });

  // Calculate overall statistics
  const totalRatings = ratings.length;
  const averageRating = (ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1);
  const responseRate = ((ratings.filter(r => r.response).length / totalRatings) * 100).toFixed(0);

  // Calculate ratings by region
  const regionData = regions.slice(1).map(region => {
    const regionRatings = ratings.filter(r => r.region === region);
    const avg = regionRatings.length > 0 
      ? (regionRatings.reduce((sum, r) => sum + r.rating, 0) / regionRatings.length).toFixed(1)
      : '0.0';
    return {
      name: region,
      value: parseFloat(avg),
      count: regionRatings.length
    };
  });

  const COLORS = ['#6400A4', '#8B20EE', '#10B981', '#35BAE6', '#F59E0B'];

  const handleOpenResponse = (rating: Rating) => {
    setSelectedRating(rating);
    setResponseText(rating.response || '');
  };

  const handleCloseResponse = () => {
    setSelectedRating(null);
    setResponseText('');
  };

  const handleSendResponse = () => {
    if (!selectedRating || !responseText.trim()) return;

    setRatings(ratings.map(r => 
      r.id === selectedRating.id 
        ? { ...r, response: responseText, responseDate: new Date().toLocaleDateString('pt-BR') }
        : r
    ));
    
    toast.success('Resposta enviada com sucesso!', {
      description: `Sua resposta foi enviada para ${selectedRating.clientName}.`
    });
    
    handleCloseResponse();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-current' : ''}`}
            style={{ color: star <= rating ? '#FFFF20' : '#D1D5DB' }}
          />
        ))}
      </div>
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm" style={{ color: '#6400A4' }}>{payload[0].name}</p>
          <p className="text-sm">Média: <span style={{ color: '#8B20EE' }}>{payload[0].value.toFixed(1)} ⭐</span></p>
          <p className="text-xs text-gray-500">{payload[0].payload.count} avaliações</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <ScreenHeader 
              title="Avaliações dos Clientes"
              description="Acompanhe as avaliações e responda aos seus clientes"
              onBack={() => onBack?.()}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Avaliações</p>
                  <p className="text-2xl" style={{ color: '#8B20EE' }}>{totalRatings}</p>
                </div>
                <MessageSquare className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFFF20' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Média Geral</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl text-gray-800">{averageRating}</p>
                    <Star className="h-5 w-5 fill-current" style={{ color: '#FFFF20' }} />
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-600 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Resposta</p>
                  <p className="text-2xl text-green-600">{responseRate}%</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Regiões Atendidas</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{regions.length - 1}</p>
                </div>
                <MapPin className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-center mb-4" style={{ color: '#6400A4' }}>Média de Avaliações por Região</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, serviço ou comentário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Region Filter */}
            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Rating Filter */}
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Nota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as notas</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4 estrelas</SelectItem>
                <SelectItem value="3-">3 ou menos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Ratings List */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-4">
          {filteredRatings.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhuma avaliação encontrada</p>
            </div>
          ) : (
            filteredRatings.map((rating) => (
              <div
                key={rating.id}
                className="bg-white rounded-2xl p-5 border-2 border-transparent hover:border-purple-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12" style={{ backgroundColor: '#6400A4' }}>
                      <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                        {getInitials(rating.clientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p style={{ color: '#6400A4' }}>{rating.clientName}</p>
                      <p className="text-sm text-gray-600">{rating.serviceName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(rating.rating)}
                    <p className="text-xs text-gray-500 mt-1">{rating.date}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-2 mb-3">
                  <MapPin className="h-4 w-4 mt-1" style={{ color: '#35BAE6' }} />
                  <Badge style={{ backgroundColor: '#35BAE6', color: 'white' }}>
                    {rating.region}
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 mb-4 bg-gray-50 rounded-lg p-3">
                  "{rating.comment}"
                </p>

                {rating.response ? (
                  <div className="bg-purple-50 rounded-lg p-3 border-l-4" style={{ borderColor: '#8B20EE' }}>
                    <div className="flex items-center space-x-2 mb-2">
                      <MessageSquare className="h-4 w-4" style={{ color: '#8B20EE' }} />
                      <p className="text-sm" style={{ color: '#6400A4' }}>Sua resposta</p>
                      <span className="text-xs text-gray-500">• {rating.responseDate}</span>
                    </div>
                    <p className="text-sm text-gray-700">{rating.response}</p>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleOpenResponse(rating)}
                    style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                    className="hover:bg-purple-50"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Responder Avaliação
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredRatings.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Exibindo <span style={{ color: '#8B20EE' }}>{filteredRatings.length}</span> de{' '}
              <span style={{ color: '#8B20EE' }}>{ratings.length}</span> avaliações
            </p>
          </div>
        )}
      </div>

      {/* Response Dialog */}
      <Dialog open={!!selectedRating} onOpenChange={handleCloseResponse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Responder Avaliação</DialogTitle>
            <DialogDescription>
              Envie uma resposta para {selectedRating?.clientName}
            </DialogDescription>
          </DialogHeader>

          {selectedRating && (
            <div className="space-y-4 py-4">
              {/* Original Rating */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p style={{ color: '#6400A4' }}>{selectedRating.clientName}</p>
                  {renderStars(selectedRating.rating)}
                </div>
                <p className="text-sm text-gray-700">"{selectedRating.comment}"</p>
              </div>

              {/* Response Text */}
              <div>
                <Label htmlFor="response" style={{ color: '#8B20EE' }}>Sua Resposta</Label>
                <Textarea
                  id="response"
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Digite sua resposta..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseResponse}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendResponse}
              disabled={!responseText.trim()}
              style={{ backgroundColor: '#8B20EE', color: 'white' }}
              className="hover:opacity-90"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}