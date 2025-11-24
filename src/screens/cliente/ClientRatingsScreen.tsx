import { useState, useEffect } from 'react'; // 1. IMPORTAR useEffect
import { Star, Calendar, Search, Bot, MessageSquare, Clock, User, CheckCircle } from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import api from '../../lib/api'; // 2. IMPORTAR A API
import { toast } from 'sonner'; // 3. IMPORTAR O TOAST

interface ClientRatingsScreenProps {
  onBack?: () => void;
}

// ===================================
// 4. TIPAGENS (MOVENDO PARA CIMA)
// ===================================
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

// =============================================================
// 5. DADOS ESTÁTICOS DE FALLBACK
// =============================================================
const FALLBACK_PENDING_SERVICES: Service[] = [
  {
    id: 'SRV-2024-089',
    name: 'Limpeza Geral - Escritório Corporate ',
    date: '23/09/2024',
    team: 'Equipe Alpha',
    description: 'Limpeza completa do escritório incluindo salas individuais e áreas comuns',
    status: 'pending',
    duration: '4h'
  },
  {
    id: 'SRV-2024-087',
    name: 'Limpeza de Vidros ',
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
    name: 'Limpeza Geral ', 
    date: '20/09/2024', 
    team: 'Equipe Beta',
    description: 'Limpeza completa do ambiente',
    duration: '5h',
    status: 'rated',
    rating: 5, 
    feedback: 'Excelente trabalho! ',
    ratedAt: '20/09/2024 16:30'
  },
  { 
    id: 'SRV-2024-065', 
    name: 'Limpeza de Vidros + Fachada ', 
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


// ===================================
// COMPONENTE PRINCIPAL
// ===================================
export default function ClientRatingsScreen({ onBack }: ClientRatingsScreenProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // =============================================================
  // 6. NOVOS ESTADOS: Para os dados dinâmicos e loading
  // =============================================================
  const [pendingServices, setPendingServices] = useState<Service[]>([]);
  const [ratedServices, setRatedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);


  // =============================================================
  // 7. NOVA ALTERAÇÃO: useEffect para buscar dados do backend
  // =============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Tenta buscar os dados do backend
        const ratingsResponse = await api.get('/api/clientes/ratings');

        if (Array.isArray(ratingsResponse.data)) {
          // O backend (server.js) só nos dá os dados de "ratings"
          // O formato do server.js é { serviceId, service, date, rating, feedback }
          // Vamos mapeá-lo para o formato "Service" que a tela espera
          const backendRatedServices = ratingsResponse.data.map((r: any) => ({
            id: r.serviceId,
            name: r.service,
            date: r.date,
            team: "Equipe ", // O server.js não fornece 'team'
            description: "Descrição", // O server.js não fornece 'description'
            duration: "Xh", // O server.js não fornece 'duration'
            status: 'rated' as const,
            rating: r.rating,
            feedback: r.feedback,
            ratedAt: r.date // Apenas para simulação
          }));
          
          setRatedServices(backendRatedServices);
          toast.success("Avaliações carregadas do backend!");
        } else {
          setRatedServices(FALLBACK_RATED_SERVICES);
          toast.info("Usando dados estáticos para Avaliações.");
        }

        // Como o backend não tem rota de PENDENTES, usamos o fallback
        setPendingServices(FALLBACK_PENDING_SERVICES);

      } catch (error) {
        console.error("Erro ao buscar dados do backend:", error);
        toast.error("Backend não encontrado. Carregando dados de simulação.");
        setRatedServices(FALLBACK_RATED_SERVICES);
        setPendingServices(FALLBACK_PENDING_SERVICES);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // O [] vazio faz isso rodar só uma vez

  // =============================================================
  // 8. DADOS DINÂMICOS: Agora tudo vem do estado
  // =============================================================
  const allServices = [...pendingServices, ...ratedServices];

  const filteredServices = allServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = pendingServices.length;
  const ratedCount = ratedServices.length;
  const averageRating = ratedCount > 0 
    ? (ratedServices.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedCount).toFixed(1)
    : '0.0';
  const fiveStarCount = ratedServices.filter(s => s.rating === 5).length;


  // Função renderStars (sem alteração)
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


  // =============================================================
  // 9. ALTERAÇÃO PRINCIPAL: Conectando o envio ao Backend
  // =============================================================
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
      service: serviceToRate.name, // O backend (server.js) espera 'service'
      date: serviceToRate.date,     // O backend (server.js) espera 'date'
      rating: selectedRating,
      feedback: feedback,
    };

    try {
      // 1. Envia o POST para o backend
      // O server.js retorna { message: "...", data: newRatingPayload }
      const response = await api.post('/api/clientes/ratings', newRatingPayload);
      
      // 2. Prepara o novo objeto de "avaliado" para a tela
      const newRatedService: Service = {
        ...serviceToRate, // Pega os dados do serviço (id, nome, team, etc.)
        status: 'rated',
        rating: response.data.data.rating,
        feedback: response.data.data.feedback,
        ratedAt: new Date().toLocaleString() // Simula a data de avaliação
      };

      // 3. Atualiza o estado local (UI)
      // Adiciona o novo serviço à lista de avaliados
      setRatedServices(prev => [newRatedService, ...prev]); 
      // Remove o serviço da lista de pendentes
      setPendingServices(prev => prev.filter(s => s.id !== selectedServiceId));
      
      toast.success("Avaliação enviada com sucesso!");
      
      // 4. Limpa e fecha o modal
      setSelectedRating(0);
      setFeedback('');
      setSelectedServiceId('');
      setIsRatingModalOpen(false);

    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast.error("Falha ao enviar avaliação. Tente novamente.");
    }
  };

  // Funções getRatingColor e getRatingBadge (sem alteração)
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

  // =============================================================
  // 10. NOVA ALTERAÇÃO: Adicionar tela de loading
  // =============================================================
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Clock className="h-6 w-6 mx-auto mb-2 animate-spin" />
        Buscando avaliações no backend...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho (Seu código) */}
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

      {/* Cards de Estatísticas (Seu código, agora dinâmicos) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Serviços</p>
              <p className="text-2xl" style={{ color: '#6400A4' }}>{allServices.length}</p>
            </div>
            <CheckCircle className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Média Geral</p>
              <p className="text-2xl text-yellow-600">{averageRating}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-400 fill-current opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avaliações 5 Estrelas</p>
              <p className="text-2xl text-green-600">{fiveStarCount}</p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center opacity-50">
              <span className="text-white text-sm">★</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFFF20' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl text-gray-800">{pendingCount}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa (Seu código) */}
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

      {/* Lista de Serviços (Seu código, agora dinâmica) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service) => (
          <Card 
            key={service.id} 
            className="hover:shadow-lg transition-all duration-200"
            style={{ borderColor: service.status === 'pending' ? 'rgba(255, 255, 32, 0.3)' : 'rgba(100, 0, 164, 0.2)' }}
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
                      backgroundColor: 'rgba(255, 255, 32, 0.2)', 
                      color: '#8B7000' 
                    }}
                  >
                    Pendente
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{service.description}</p>
              
              {/* Informações do Serviço (Seu código) */}
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

              {/* Se o serviço já foi avaliado (Seu código) */}
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
                        <span className="text-sm" style={{ color: '#6400A4' }}>Seu comentário:</span>
                      </div>
                      <p className="text-sm text-black italic">"{service.feedback}"</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">Avaliado em: {service.ratedAt}</p>
                </div>
              )}

              {/* Se o serviço está pendente de avaliação (Seu código) */}
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
        ))}
      </div>

      {/* Modal de Avaliação (Seu código) */}
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
              // Modificado para buscar de 'pendingServices'
              const service = pendingServices.find(s => s.id === selectedServiceId);
              return service ? (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <h4 className="text-black">{service.name}</h4>
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
  );
}