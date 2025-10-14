import { useState } from 'react';
import { Star, FileText, Calendar, User, MessageSquare, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import React from 'react';


export default function ClientNotesAndRatings() {
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const serviceNotes = [
    {
      id: 1,
      serviceId: 'OS-2024-089',
      serviceName: 'Limpeza Geral - Escritório Corporate',
      date: '23/09/2024',
      status: 'em-andamento',
      team: 'Equipe Alpha',
      notes: [
        {
          id: 1,
          type: 'inicio',
          time: '08:00',
          author: 'Carlos Silva',
          content: 'Iniciando serviço de limpeza geral. Equipe completa presente no local.'
        },
        {
          id: 2,
          type: 'progresso',
          time: '10:30',
          author: 'Ana Santos',
          content: 'Finalizada limpeza das áreas comuns. Iniciando limpeza das salas individuais.'
        },
        {
          id: 3,
          type: 'observacao',
          time: '12:00',
          author: 'Carlos Silva',
          content: 'Cliente solicitou atenção especial na sala de reuniões devido à reunião importante amanhã.'
        }
      ]
    },
    {
      id: 2,
      serviceId: 'OS-2024-078',
      serviceName: 'Limpeza Geral',
      date: '20/09/2024',
      status: 'completed',
      team: 'Equipe Beta',
      notes: [
        {
          id: 1,
          type: 'inicio',
          time: '09:00',
          author: 'Roberto Lima',
          content: 'Serviço iniciado conforme cronograma. Materiais conferidos.'
        },
        {
          id: 2,
          type: 'conclusao',
          time: '15:00',
          author: 'Roberto Lima',
          content: 'Serviço concluído com sucesso. Cliente satisfeito com o resultado.'
        }
      ],
      rating: 5,
      clientFeedback: 'Excelente trabalho! A equipe foi muito profissional e o resultado superou nossas expectativas.'
    }
  ];

  const pastRatings = [
    { serviceId: 'OS-2024-078', service: 'Limpeza Geral', date: '20/09/2024', rating: 5, feedback: 'Excelente trabalho! Equipe muito profissional.' },
    { serviceId: 'OS-2024-065', service: 'Limpeza de Vidros', date: '15/09/2024', rating: 4, feedback: 'Bom trabalho, mas houve um pequeno atraso no início.' },
    { serviceId: 'OS-2024-052', service: 'Limpeza Geral + Enceramento', date: '10/09/2024', rating: 5, feedback: 'Perfeito! O enceramento ficou impecável.' },
    { serviceId: 'OS-2024-038', service: 'Limpeza Pós-Obra', date: '05/09/2024', rating: 4, feedback: 'Serviço bem executado, ambiente ficou totalmente limpo.' }
  ];

  const getStatusBadge = (status: string) => {
    return status === 'em-andamento' ? (
      <Badge className="bg-blue-100 text-blue-800 border-none">Em Andamento</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800 border-none">Concluído</Badge>
    );
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'inicio': return '#6400A4';
      case 'progresso': return '#8B20EE';
      case 'observacao': return '#FFFF20';
      case 'conclusao': return '#22c55e';
      default: return '#6400A4';
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'inicio': return 'Início';
      case 'progresso': return 'Progresso';
      case 'observacao': return 'Observação';
      case 'conclusao': return 'Conclusão';
      default: return 'Nota';
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onRate: ((value: number) => void) | null = null
  ) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onRate && onRate(i + 1)}
      />
    ));
  };

  const handleSubmitRating = () => {
    if (selectedRating > 0) {
      // Lógica para enviar avaliação
      console.log('Avaliação enviada:', { rating: selectedRating, feedback });
      setSelectedRating(0);
      setFeedback('');
      setIsRatingModalOpen(false);
    }
  };

  return (
    <div className="p-6 overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1>Notas e Avaliações de Serviços</h1>
          <p className="text-black">
            Acompanhe as notas dos serviços em tempo real e avalie a qualidade do atendimento.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center space-x-2"
                style={{ backgroundColor: '#8B20EE', color: 'white' }}
              >
                <Star className="h-4 w-4" />
                <span>Avaliar Serviço</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Avaliar Serviço</DialogTitle>
                <DialogDescription>
                  Avalie a qualidade do serviço prestado e deixe um comentário.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Sua avaliação</Label>
                  <div className="flex items-center space-x-1 mt-2">
                    {renderStars(selectedRating, true, setSelectedRating)}
                  </div>
                </div>
                <div>
                  <Label htmlFor="feedback">Comentário (opcional)</Label>
                  <Textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Descreva sua experiência com o serviço..."
                    rows={3}
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
          <Button 
            className="flex items-center space-x-2"
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            <Bot className="h-4 w-4" />
            <span>IA</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Notas dos Serviços Atuais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <FileText className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Notas dos Serviços em Andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              {serviceNotes.filter(s => s.status === 'em-andamento').map((service) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-black">{service.serviceName}</h4>
                      <p className="text-sm text-gray-600">OS: {service.serviceId} | {service.date}</p>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                  
                  <div className="space-y-3">
                    {service.notes.map((note) => (
                      <div key={note.id} className="flex items-start space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: getNoteTypeColor(note.type) }}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge 
                              className="text-xs border-none"
                              style={{ backgroundColor: getNoteTypeColor(note.type) + '20', color: getNoteTypeColor(note.type) }}
                            >
                              {getNoteTypeLabel(note.type)}
                            </Badge>
                            <span className="text-xs text-gray-500">{note.time}</span>
                          </div>
                          <p className="text-sm text-black">{note.content}</p>
                          <p className="text-xs text-gray-500 mt-1">por {note.author}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Avaliações */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Star className="h-5 w-5 mr-2" style={{ color: '#FFFF20' }} />
              Suas Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              {pastRatings.map((rating) => (
                <div key={rating.serviceId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-black">{rating.service}</h4>
                      <p className="text-sm text-gray-600">{rating.serviceId} | {rating.date}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(rating.rating)}
                    </div>
                  </div>
                  {rating.feedback && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Seu comentário:</span>
                      </div>
                      <p className="text-sm text-black italic">"{rating.feedback}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Serviços Concluídos com Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black flex items-center">
            <Calendar className="h-5 w-5 mr-2" style={{ color: '#8B20EE' }} />
            Histórico Completo de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-80 overflow-y-auto scrollbar-hide">
          <div className="space-y-4">
            {serviceNotes.filter(s => s.status === 'completed').map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-black">{service.serviceName}</h4>
                    <p className="text-sm text-gray-600">OS: {service.serviceId} | {service.date} | {service.team}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {service.rating && (
                      <div className="flex items-center space-x-1">
                        {renderStars(service.rating)}
                      </div>
                    )}
                    {getStatusBadge(service.status)}
                  </div>
                </div>
                
                <div className="space-y-3 mb-3">
                  {service.notes.map((note) => (
                    <div key={note.id} className="flex items-start space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: getNoteTypeColor(note.type) }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge 
                            className="text-xs border-none"
                            style={{ backgroundColor: getNoteTypeColor(note.type) + '20', color: getNoteTypeColor(note.type) }}
                          >
                            {getNoteTypeLabel(note.type)}
                          </Badge>
                          <span className="text-xs text-gray-500">{note.time}</span>
                        </div>
                        <p className="text-sm text-black">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">por {note.author}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {service.clientFeedback && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4" style={{ color: '#6400A4' }} />
                      <span className="text-sm" style={{ color: '#6400A4' }}>Sua avaliação:</span>
                    </div>
                    <p className="text-sm text-black italic">"{service.clientFeedback}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}