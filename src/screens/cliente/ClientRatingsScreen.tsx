import { useState } from 'react';
import { Star, Calendar, Search, Bot, MessageSquare, Clock, User, CheckCircle } from 'lucide-react';
import ScreenHeader from './ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';

interface ClientRatingsScreenProps {
  onBack?: () => void;
}

export default function ClientRatingsScreen({ onBack }: ClientRatingsScreenProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Combinando todos os serviços (avaliados e pendentes)
  const allServices = [
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
    { 
      id: 'SRV-2024-078', 
      name: 'Limpeza Geral', 
      date: '20/09/2024', 
      team: 'Equipe Beta',
      description: 'Limpeza completa do ambiente',
      duration: '5h',
      status: 'rated',
      rating: 5, 
      feedback: 'Excelente trabalho! A equipe foi muito profissional e o resultado superou nossas expectativas.',
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
      feedback: 'Bom trabalho, mas houve um pequeno atraso no início. No geral, ficamos satisfeitos.',
      ratedAt: '15/09/2024 17:45'
    },
    { 
      id: 'SRV-2024-052', 
      name: 'Limpeza Geral + Enceramento', 
      date: '10/09/2024', 
      team: 'Equipe Gamma',
      description: 'Limpeza completa com enceramento de piso',
      duration: '7h',
      status: 'rated',
      rating: 5, 
      feedback: 'Perfeito! O enceramento ficou impecável e a equipe foi muito cuidadosa.',
      ratedAt: '10/09/2024 15:20'
    },
    { 
      id: 'SRV-2024-038', 
      name: 'Limpeza Pós-Obra', 
      date: '05/09/2024', 
      team: 'Equipe Delta',
      description: 'Limpeza completa após finalização da obra',
      duration: '8h',
      status: 'rated',
      rating: 4, 
      feedback: 'Serviço bem executado, ambiente ficou totalmente limpo. Recomendamos!',
      ratedAt: '06/09/2024 09:15'
    }
  ];

  const filteredServices = allServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = allServices.filter(s => s.status === 'pending').length;
  const ratedCount = allServices.filter(s => s.status === 'rated').length;
  const averageRating = ratedCount > 0 
    ? (allServices.filter(s => s.status === 'rated').reduce((sum, s) => sum + (s.rating || 0), 0) / ratedCount).toFixed(1)
    : '0.0';
  const fiveStarCount = allServices.filter(s => s.rating === 5).length;

  const renderStars = (rating: number, interactive = false, onRate = null) => {
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

  const handleSubmitRating = () => {
    if (selectedRating > 0 && selectedServiceId) {
      console.log('Avaliação enviada:', { 
        serviceId: selectedServiceId, 
        rating: selectedRating, 
        feedback 
      });
      
      setSelectedRating(0);
      setFeedback('');
      setSelectedServiceId('');
      setIsRatingModalOpen(false);
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

  return (
    <div className="p-6 space-y-6">
      {/* Cabeçalho */}
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
              
              {/* Informações do Serviço */}
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

              {/* Se o serviço já foi avaliado */}
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

              {/* Se o serviço está pendente de avaliação */}
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
              const service = allServices.find(s => s.id === selectedServiceId);
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
