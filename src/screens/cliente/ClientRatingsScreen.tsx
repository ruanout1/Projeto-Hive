import { useState, useEffect } from 'react';
import { Star, Calendar, Search, Bot, MessageSquare, Clock, User, CheckCircle } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import api from '../../lib/api';
import { toast } from 'sonner';

interface ClientRatingsScreenProps {
  onBack?: () => void;
}

interface Service {
  id: string;
  name: string;
  date: string;
  team: string;
  description: string;
  status: 'pending' | 'rated';
  duration: string;
  rating?: number;
  feedback?: string;
  ratedAt?: string;
}

// DADOS ESTÁTICOS DE FALLBACK (apenas se backend offline)
const FALLBACK_PENDING_SERVICES: Service[] = [
  {
    id: 'SRV-2024-089',
    name: 'Limpeza Geral - Escritório Corporate',
    date: '23/09/2024',
    team: 'Equipe Alpha',
    description: 'Limpeza completa do escritório incluindo salas individuais e áreas comuns',
    status: 'pending',
    duration: '4h'
  },
  {
    id: 'SRV-2024-087',
    name: 'Limpeza de Vidros',
    date: '22/09/2024',
    team: 'Equipe Beta',
    description: 'Limpeza de todas as superfícies de vidro do edifício',
    status: 'pending',
    duration: '3h'
  },
];

const FALLBACK_RATED_SERVICES: Service[] = [
  { 
    id: 'SRV-2024-078', 
    name: 'Limpeza Geral', 
    date: '20/09/2024', 
    team: 'Equipe Beta',
    description: 'Limpeza completa do ambiente',
    duration: '5h',
    status: 'rated',
    rating: 5, 
    feedback: 'Excelente trabalho!',
    ratedAt: '20/09/2024 16:30'
  },
  { 
    id: 'SRV-2024-065', 
    name: 'Limpeza de Vidros + Fachada', 
    date: '15/09/2024', 
    team: 'Equipe Alpha',
    description: 'Limpeza de vidros e fachada externa',
    duration: '6h',
    status: 'rated',
    rating: 4, 
    feedback: 'Bom trabalho, mas houve um pequeno atraso.',
    ratedAt: '15/09/2024 17:45'
  },
];

export default function ClientRatingsScreen({ onBack }: ClientRatingsScreenProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [ratedServices, setRatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ ATUALIZADO: Busca dados reais do backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let backendWorking = false;

        // Buscar avaliações já feitas
        try {
          const ratingsResponse = await api.get('/client-portal/ratings');

          if (Array.isArray(ratingsResponse.data)) {
            const backendRatedServices = ratingsResponse.data.map((r: any) => ({
              id: r.serviceId,
              name: r.service,
              date: r.date,
              team: r.team || "Equipe Alpha",
              description: r.description || "Descrição do serviço",
              duration: r.duration || "Xh",
              status: 'rated' as const,
              rating: r.rating,
              feedback: r.feedback,
              ratedAt: r.ratedAt || r.date
            }));
            
            setRatedServices(backendRatedServices);
            backendWorking = true;
            console.log(' Avaliações carregadas:', backendRatedServices.length);
          }
        } catch (error: any) {
          console.error("Erro ao buscar avaliações:", error);
          setRatedServices(FALLBACK_RATED_SERVICES);
        }

        // ✅ NOVO: Buscar serviços pendentes de avaliação
        try {
          const pendingResponse = await api.get('/client-portal/ratings/pending');

          if (Array.isArray(pendingResponse.data)) {
            setPendingServices(pendingResponse.data);
            backendWorking = true;
            console.log(' Serviços pendentes carregados:', pendingResponse.data.length);
            
            if (backendWorking) {
              toast.success(` Dados carregados do backend!`);
            }
          }
        } catch (error: any) {
          console.error("Erro ao buscar pendentes:", error);
          setPendingServices(FALLBACK_PENDING_SERVICES);
        }

        // Se ambos falharam, avisa que está offline
        if (!backendWorking) {
          if (error?.code === 'ERR_NETWORK') {
            toast.info("Backend offline - usando dados de exemplo");
          } else {
            toast.error("Erro ao carregar dados");
          }
        }

      } catch (error: any) {
        console.error("Erro geral:", error);
        setRatedServices(FALLBACK_RATED_SERVICES);
        setPendingServices(FALLBACK_PENDING_SERVICES);
        toast.error("Erro ao carregar avaliações");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const allServices = [...pendingServices, ...ratedServices];

  const filteredServices = allServices.filter(service => {
    const search = searchTerm.toLowerCase();
    
    return (
      service.name?.toLowerCase().includes(search) ||
      service.id?.toString().includes(search) ||
      service.team?.toLowerCase().includes(search) ||
      service.description?.toLowerCase().includes(search)
    );
  });

  const pendingCount = pendingServices.length;
  const ratedCount = ratedServices.length;
  const averageRating = ratedCount > 0 
    ? (ratedServices.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedCount).toFixed(1)
    : '0.0';
  const fiveStarCount = ratedServices.filter(s => s.rating === 5).length;

  const renderStars = (rating: number, interactive = false, onRate: ((rating: number) => void) | null = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400 transition-colors' : ''}`}
        onClick={() => interactive && onRate && onRate(i + 1)}
      />
    ));
  };

  const handleSubmitRating = async () => {
    if (selectedRating === 0 || !selectedServiceId) {
      toast.warning("Por favor, selecione uma avaliação.");
      return;
    }

    const serviceToRate = pendingServices.find(s => s.id === selectedServiceId);
    if (!serviceToRate) {
      toast.error("Erro: Serviço pendente não encontrado.");
      return;
    }

    const newRatingPayload = {
      serviceId: serviceToRate.id,
      service: serviceToRate.name,
      date: serviceToRate.date,
      team: serviceToRate.team,
      description: serviceToRate.description,
      duration: serviceToRate.duration,
      rating: selectedRating,
      feedback: feedback,
    };

    try {
      const response = await api.post('/client-portal/ratings', newRatingPayload);
      
      const newRatedService: Service = {
        ...serviceToRate,
        status: 'rated',
        rating: selectedRating,
        feedback: feedback,
        ratedAt: new Date().toLocaleString('pt-BR')
      };

      // Atualiza as listas localmente
      setRatedServices(prev => [newRatedService, ...prev]); 
      setPendingServices(prev => prev.filter(s => s.id !== selectedServiceId));
      
      toast.success(" Avaliação enviada com sucesso!");
      
      // Limpa o formulário
      setSelectedRating(0);
      setFeedback('');
      setSelectedServiceId('');
      setIsRatingModalOpen(false);

    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast.error("Falha ao enviar avaliação. Tente novamente.");
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 5) return 'text-green-600';
    if (rating >= 4) return 'text-yellow-600';
    if (rating >= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 5) return 'Excelente';
    if (rating >= 4) return 'Bom';
    if (rating >= 3) return 'Regular';
    return 'Precisa Melhorar';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-2 animate-spin text-purple-600" />
          <p className="text-gray-600">Carregando avaliações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <ScreenHeader 
              title="Avaliações de Serviços"
              description="Avalie os serviços concluídos e acompanhe seu histórico de avaliações."
              onBack={() => onBack?.()}
            />
          </div>
          <Button 
            className="flex items-center space-x-2"
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            <Bot className="h-4 w-4" />
            <span>IA</span>
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Serviços</p>
                <p className="text-2xl font-bold" style={{ color: '#6400A4' }}>{allServices.length}</p>
              </div>
              <CheckCircle className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média Geral</p>
                <p className="text-2xl font-bold text-yellow-600">{averageRating} ⭐</p>
              </div>
              <Star className="h-8 w-8 text-yellow-400 fill-current opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliações 5 Estrelas</p>
                <p className="text-2xl font-bold text-green-600">{fiveStarCount}</p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center opacity-50">
                <span className="text-white text-sm font-bold">★</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por serviço, ID ou equipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Serviços */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className="hover:shadow-lg transition-all duration-200 border-2"
                style={{ borderColor: service.status === 'pending' ? 'rgba(255, 165, 0, 0.3)' : 'rgba(100, 0, 164, 0.2)' }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-black text-lg mb-1">{service.name}</CardTitle>
                      <p className="text-sm text-gray-600">OS: {service.id}</p>
                    </div>
                    {service.status === 'rated' ? (
                      <Badge 
                        className="border-none"
                        style={{ 
                          backgroundColor: 'rgba(53, 186, 230, 0.1)', 
                          color: '#35BAE6' 
                        }}
                      >
                        Avaliado
                      </Badge>
                    ) : (
                      <Badge 
                        className="border-none"
                        style={{ 
                          backgroundColor: 'rgba(255, 165, 0, 0.2)', 
                          color: '#FF8C00' 
                        }}
                      >
                        Pendente
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">{service.description}</p>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" style={{ color: '#8B20EE' }} />
                      <span>{service.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" style={{ color: '#8B20EE' }} />
                      <span>{service.team}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
                      <span>{service.duration}</span>
                    </div>
                  </div>

                  {service.status === 'rated' && (
                    <div className="space-y-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {renderStars(service.rating || 0)}
                        </div>
                        <Badge 
                          className={`border-none text-xs ${getRatingColor(service.rating || 0).replace('text-', 'bg-').replace('-600', '-100')} ${getRatingColor(service.rating || 0).replace('-600', '-800')}`}
                        >
                          {getRatingBadge(service.rating || 0)}
                        </Badge>
                      </div>
                      
                      {service.feedback && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageSquare className="h-4 w-4" style={{ color: '#6400A4' }} />
                            <span className="text-sm font-medium" style={{ color: '#6400A4' }}>Seu comentário:</span>
                          </div>
                          <p className="text-sm text-gray-700 italic">"{service.feedback}"</p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">Avaliado em: {service.ratedAt}</p>
                    </div>
                  )}

                  {service.status === 'pending' && (
                    <div className="pt-3 border-t border-gray-100">
                      <Button
                        className="w-full"
                        style={{ backgroundColor: '#6400A4', color: 'white' }}
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          setIsRatingModalOpen(true);
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Avaliar Serviço
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <Star className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">Nenhum serviço encontrado</p>
            </div>
          )}
        </div>

        {/* Modal de Avaliação */}
        <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Avaliar Serviço Concluído</DialogTitle>
              <DialogDescription>
                Avalie a qualidade do atendimento e deixe seu comentário.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedServiceId && (() => {
                const service = pendingServices.find(s => s.id === selectedServiceId);
                return service ? (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <h4 className="font-semibold text-black">{service.name}</h4>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>OS: {service.id}</span>
                      <span>{service.date}</span>
                    </div>
                    <p className="text-xs text-gray-500">Equipe: {service.team}</p>
                  </div>
                ) : null;
              })()}

              <div>
                <Label>Sua Avaliação</Label>
                <div className="flex items-center space-x-1 mt-2">
                  {renderStars(selectedRating, true, setSelectedRating)}
                </div>
                {selectedRating > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedRating} de 5 estrelas - {getRatingBadge(selectedRating)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="feedback">Comentário (opcional)</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Descreva sua experiência com o serviço prestado..."
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRatingModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmitRating}
                disabled={selectedRating === 0}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
              >
                Enviar Avaliação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}