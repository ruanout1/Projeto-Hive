import { useState } from 'react';
import { Star, Calendar, Search, Bot, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import React from 'react';


export default function ClientRatingsScreen() {
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Serviços disponíveis para avaliação (concluídos e não avaliados) - agora com estado
  const [pendingServices, setPendingServices] = useState([
    {
      id: 'SRV-2024-089',
      name: 'Limpeza Geral - Escritório Corporate',
      date: '23/09/2024',
      team: 'Equipe Alpha',
      description: 'Limpeza completa do escritório incluindo salas individuais e áreas comuns'
    },
    {
      id: 'SRV-2024-087',
      name: 'Limpeza de Vidros',
      date: '22/09/2024',
      team: 'Equipe Beta',
      description: 'Limpeza de todas as superfícies de vidro do edifício'
    }
  ]);

  // Histórico de avaliações
  const ratingHistory = [
    { 
      id: 'SRV-2024-078', 
      service: 'Limpeza Geral', 
      date: '20/09/2024', 
      rating: 5, 
      feedback: 'Excelente trabalho! A equipe foi muito profissional e o resultado superou nossas expectativas.',
      team: 'Equipe Beta',
      ratedAt: '20/09/2024 16:30'
    },
    { 
      id: 'SRV-2024-065', 
      service: 'Limpeza de Vidros + Fachada', 
      date: '15/09/2024', 
      rating: 4, 
      feedback: 'Bom trabalho, mas houve um pequeno atraso no início. No geral, ficamos satisfeitos.',
      team: 'Equipe Alpha',
      ratedAt: '15/09/2024 17:45'
    },
    { 
      id: 'SRV-2024-052', 
      service: 'Limpeza Geral + Enceramento', 
      date: '10/09/2024', 
      rating: 5, 
      feedback: 'Perfeito! O enceramento ficou impecável e a equipe foi muito cuidadosa.',
      team: 'Equipe Gamma',
      ratedAt: '10/09/2024 15:20'
    },
    { 
      id: 'SRV-2024-038', 
      service: 'Limpeza Pós-Obra', 
      date: '05/09/2024', 
      rating: 4, 
      feedback: 'Serviço bem executado, ambiente ficou totalmente limpo. Recomendamos!',
      team: 'Equipe Delta',
      ratedAt: '06/09/2024 09:15'
    }
  ];

  const filteredHistory = ratingHistory.filter(rating => 
    rating.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rating.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (
    rating: number,
    interactive = false,
    onRate: ((rating: number) => void) | null = null
  ) => {
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
      // Simular envio da avaliação
      console.log('Avaliação enviada:', { 
        serviceId: selectedServiceId, 
        rating: selectedRating, 
        feedback 
      });
      
      // Reset do formulário
      setSelectedRating(0);
      setFeedback('');
      setSelectedServiceId('');
      setIsRatingModalOpen(false);
      
      // Aqui você removeria o serviço da lista de pendentes e adicionaria ao histórico
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
    <div className="p-6 h-screen flex flex-col overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="hive-screen-title">Sistema de Avaliações</h1>
          <p className="text-black">
            Avalie os serviços prestados e acompanhe seu histórico de avaliações.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center space-x-2"
                style={{ backgroundColor: '#8B20EE', color: 'white' }}
                disabled={pendingServices.length === 0}
              >
                <Star className="h-4 w-4" />
                <span>Avaliar Serviço</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Avaliar Serviço Concluído</DialogTitle>
                <DialogDescription>
                  Selecione um serviço concluído e avalie a qualidade do atendimento.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="service-select">Selecione o Serviço</Label>
                  <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                    <SelectTrigger id="service-select">
                      <SelectValue placeholder="Escolha o serviço para avaliar" />
                    </SelectTrigger>
                    <SelectContent>
                      {pendingServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedServiceId && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {(() => {
                      const service = pendingServices.find(s => s.id === selectedServiceId);
                      return service ? (
                        <div>
                          <p className="text-sm text-black mb-1">{service.description}</p>
                          <p className="text-xs text-gray-600">Equipe: {service.team}</p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

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
                  disabled={selectedRating === 0 || !selectedServiceId}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                  Enviar Avaliação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            className="flex items-center space-x-2"
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            <Bot className="h-4 w-4" />
            <span>IA</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Serviços Pendentes de Avaliação */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Calendar className="h-5 w-5 mr-2" style={{ color: '#FFFF20' }} />
              Pendentes de Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            {pendingServices.length > 0 ? (
              <div className="space-y-3">
                {pendingServices.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-3 w-full text-left hover:shadow-lg transition-shadow bg-white"
                  >
                    <h4 className="text-black text-sm mb-2">{service.name}</h4>
                    <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>ID: {service.id}</span>
                      <span>{service.date}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Equipe: {service.team}</p>
                    
                    {/* Botões na parte inferior */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        className="text-xs px-3 py-1 h-8 w-full"
                        style={{ backgroundColor: '#6400A4', color: 'white' }}
                        onClick={() => {
                          setSelectedServiceId(service.id);
                          setIsRatingModalOpen(true);
                        }}
                      >
                        Avaliar
                      </Button>
                      <Button
                        size="sm"
                        className="text-xs px-3 py-1 h-8 w-full text-black border-2"
                        style={{ 
                          backgroundColor: '#FFFF20',
                          borderColor: '#FFFF20'
                        }}
                        onClick={() => {
                          // Remove o serviço da lista de pendentes
                          setPendingServices(prev => 
                            prev.filter(s => s.id !== service.id)
                          );
                        }}
                      >
                        Ignorar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-black mb-1">Nenhum serviço pendente</p>
                <p className="text-sm text-gray-600">Todos os serviços foram avaliados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Histórico de Avaliações */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-black flex items-center">
                <Star className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
                Histórico de Avaliações
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar avaliação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <div className="space-y-4">
              {filteredHistory.map((rating) => (
                <div key={rating.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="text-black">{rating.service}</h4>
                      <p className="text-sm text-gray-600">ID: {rating.id} | Concluído em: {rating.date}</p>
                      <p className="text-xs text-gray-500 mt-1">Equipe: {rating.team}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {renderStars(rating.rating)}
                      </div>
                      <Badge 
                        className={`border-none text-xs ${getRatingColor(rating.rating).replace('text-', 'bg-').replace('-600', '-100')} ${getRatingColor(rating.rating).replace('-600', '-800')}`}
                      >
                        {getRatingBadge(rating.rating)}
                      </Badge>
                    </div>
                  </div>
                  
                  {rating.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="h-4 w-4" style={{ color: '#6400A4' }} />
                        <span className="text-sm" style={{ color: '#6400A4' }}>Seu comentário:</span>
                      </div>
                      <p className="text-sm text-black italic">"{rating.feedback}"</p>
                    </div>
                  )}
                  
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Avaliado em: {rating.ratedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas das Avaliações */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Avaliações</p>
                <p className="text-2xl" style={{ color: '#6400A4' }}>{ratingHistory.length}</p>
              </div>
              <Star className="h-8 w-8" style={{ color: '#6400A4' }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média Geral</p>
                <p className="text-2xl text-yellow-600">
                  {(ratingHistory.reduce((sum, r) => sum + r.rating, 0) / ratingHistory.length).toFixed(1)}
                </p>
              </div>
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliações 5 Estrelas</p>
                <p className="text-2xl text-green-600">
                  {ratingHistory.filter(r => r.rating === 5).length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">★</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl" style={{ color: '#FFFF20', WebkitTextStroke: '1px black' }}>
                  {pendingServices.length}
                </p>
              </div>
              <Calendar className="h-8 w-8" style={{ color: '#FFFF20' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}