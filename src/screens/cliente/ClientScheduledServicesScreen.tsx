import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, FileText, MapPin, CheckCircle, AlertCircle, Camera, Eye, 
  ChevronLeft, ChevronRight, AlertTriangle, X, PlayCircle, Scissors, Coffee, MessageSquare, User,
  Activity
} from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import api from '../../lib/api'; // ✅ Usando api.ts centralizado

// ============================================
// 🔧 CORREÇÕES APLICADAS:
// ✅ Removido /api/ duplicado das URLs
// ✅ Usando /client-portal em vez de /clientes
// ✅ Mantido api.ts para autenticação JWT
// ============================================

interface PhotoDocumentation {
  beforePhotos: string[];
  afterPhotos: string[];
  uploadDate: string;
  uploadedBy: string;
}

interface PendingConfirmation {
  id: string;
  serviceType: string;
  requestedDate: string;
  proposedDate: string;
  reason?: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: 'start' | 'activity' | 'scissors' | 'coffee' | 'check';
}

interface ServiceNote {
  id: string;
  author: string;
  note: string;
  date: string;
}

interface ScheduledService {
  id: string;
  serviceType: string;
  serviceIcon: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: string;
  teamMembers: {
    name: string;
    role: string;
    avatar?: string;
  }[];
  address: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'confirmed';
  timeline?: TimelineEvent[];
  serviceNotes?: ServiceNote[];
  photoDocumentation?: PhotoDocumentation;
  pendingConfirmation?: PendingConfirmation;
}

export default function ClientScheduledServicesScreen() {
  const [services, setServices] = useState<ScheduledService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [selectedConfirmation, setSelectedConfirmation] = useState<PendingConfirmation | null>(null);
  const [confirmationResponse, setConfirmationResponse] = useState('');

  useEffect(() => {
    fetchScheduledServices();
  }, [activeTab]);

  const fetchScheduledServices = async () => {
    setLoading(true);
  
    try {
      // 🔥 AGORA SIM: rota real para o backend
      const response = await api.get('/client-portal/scheduled-services');

      // Mock data - substituir pela resposta real da API
      // const mockServices: ScheduledService[] = [
      //   {
      //     id: '1',
      //     serviceType: 'Limpeza Completa',
      //     serviceIcon: 'broom',
      //     scheduledDate: '2024-11-25',
      //     scheduledTime: '09:00',
      //     estimatedDuration: '3 horas',
      //     address: 'Rua das Flores, 123 - Jardim Primavera',
      //     status: 'scheduled',
      //     teamMembers: [
      //       { name: 'Maria Silva', role: 'Responsável', avatar: '' },
      //       { name: 'João Santos', role: 'Auxiliar', avatar: '' }
      //     ],
      //     pendingConfirmation: {
      //       id: 'conf-1',
      //       serviceType: 'Limpeza Completa',
      //       requestedDate: '2024-11-25 09:00',
      //       proposedDate: '2024-11-26 10:00',
      //       reason: 'Conflito de agenda da equipe',
      //       status: 'pending'
      //     }
      //   },
      //   {
      //     id: '2',
      //     serviceType: 'Jardinagem',
      //     serviceIcon: 'leaf',
      //     scheduledDate: '2024-11-20',
      //     scheduledTime: '14:00',
      //     estimatedDuration: '2 horas',
      //     address: 'Rua das Flores, 123 - Jardim Primavera',
      //     status: 'completed',
      //     teamMembers: [
      //       { name: 'Carlos Mendes', role: 'Jardineiro', avatar: '' }
      //     ],
      //     timeline: [
      //       {
      //         id: 't1',
      //         title: 'Serviço Iniciado',
      //         description: 'Equipe chegou ao local',
      //         time: '14:00',
      //         icon: 'start'
      //       },
      //       {
      //         id: 't2',
      //         title: 'Poda Realizada',
      //         description: 'Árvores e arbustos podados',
      //         time: '14:45',
      //         icon: 'scissors'
      //       },
      //       {
      //         id: 't3',
      //         title: 'Intervalo',
      //         description: 'Pausa para descanso',
      //         time: '15:15',
      //         icon: 'coffee'
      //       },
      //       {
      //         id: 't4',
      //         title: 'Serviço Concluído',
      //         description: 'Jardim finalizado e limpo',
      //         time: '16:00',
      //         icon: 'check'
      //       }
      //     ],
      //     serviceNotes: [
      //       {
      //         id: 'n1',
      //         author: 'Carlos Mendes',
      //         note: 'Algumas plantas precisarão de replantio na próxima visita',
      //         date: '2024-11-20 16:00'
      //       },
      //       {
      //         id: 'n2',
      //         author: 'Cliente',
      //         note: 'Excelente trabalho! Jardim ficou perfeito.',
      //         date: '2024-11-20 16:30'
      //       }
      //     ],
      //     photoDocumentation: {
      //       beforePhotos: ['https://via.placeholder.com/400x300?text=Antes+1', 'https://via.placeholder.com/400x300?text=Antes+2'],
      //       afterPhotos: ['https://via.placeholder.com/400x300?text=Depois+1', 'https://via.placeholder.com/400x300?text=Depois+2'],
      //       uploadDate: '2024-11-20 16:05',
      //       uploadedBy: 'Carlos Mendes'
      //     }
      //   }
      // ];

      // 🔧 Filtragem por tab
    const filtered = response.data.filter((s: any) =>
      activeTab === 'upcoming'
        ? s.status !== 'completed'
        : s.status === 'completed'
    );

    // 🟣 Transformação para o formato que seu front entende
    const mapped = filtered.map((item: any) => ({
      id: item.id,
      serviceType: item.service_name,
      serviceIcon: "default",
      scheduledDate: item.scheduled_date,
      scheduledTime: item.start_time,
      estimatedDuration: `${item.start_time} - ${item.end_time}`,
      address: item.address || "Endereço não informado",
      status: item.status,
      teamMembers: [],           // sem dados ainda
      timeline: [],              // sem dados ainda
      serviceNotes: [],          // sem dados ainda
      photoDocumentation: null,  // sem dados ainda
      pendingConfirmation: null  // sem dados ainda
    }));

    setServices(mapped);

  } catch (error) {
    console.error('Erro ao carregar serviços:', error);
    toast.error('Erro ao carregar serviços agendados');
  } finally {
    setLoading(false);
  }
};

  const handleConfirmationResponse = async (accept: boolean) => {
    if (!selectedConfirmation) return;

    try {
      // ✅ CORRIGIDO: URL sem /api/ duplicado
      await api.post('/client-portal/confirmation-response', {
        confirmationId: selectedConfirmation.id,
        accepted: accept,
        response: confirmationResponse
      });

      toast.success(accept ? 'Data confirmada!' : 'Reagendamento solicitado');
      setConfirmationDialogOpen(false);
      setSelectedConfirmation(null);
      setConfirmationResponse('');
      fetchScheduledServices();
    } catch (error) {
      console.error('Erro ao responder confirmação:', error);
      toast.error('Erro ao processar resposta');
    }
  };

  const openPhotoDialog = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setPhotoDialogOpen(true);
  };

  const openConfirmationDialog = (confirmation: PendingConfirmation) => {
    setSelectedConfirmation(confirmation);
    setConfirmationDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; color: string }> = {
      scheduled: { label: 'Agendado', color: '#35BAE6' },
      confirmed: { label: 'Confirmado', color: '#4CAF50' },
      'in-progress': { label: 'Em Andamento', color: '#8B20EE' },
      completed: { label: 'Concluído', color: '#10B981' }
    };

    const variant = variants[status] || variants.scheduled;

    return (
      <Badge 
        style={{ 
          backgroundColor: `${variant.color}20`,
          color: variant.color,
          border: `1px solid ${variant.color}`
        }}
      >
        {variant.label}
      </Badge>
    );
  };

  const getServiceIcon = (icon: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      broom: <Activity className="h-5 w-5" />,
      leaf: <Activity className="h-5 w-5" />,
      default: <Activity className="h-5 w-5" />
    };
    return iconMap[icon] || iconMap.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ScreenHeader title="Serviços Agendados" subtitle="Visualize e gerencie seus serviços" />
        <div className="p-6 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#8B20EE' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ScreenHeader title="Serviços Agendados" subtitle="Visualize e gerencie seus serviços" />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'completed')}>
          <TabsList>
            <TabsTrigger value="upcoming">Próximos Serviços</TabsTrigger>
            <TabsTrigger value="completed">Histórico</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Services List */}
        <div className="space-y-4">
          {services.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {activeTab === 'upcoming' ? 'Nenhum serviço agendado' : 'Nenhum serviço concluído'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'upcoming' 
                    ? 'Seus próximos serviços aparecerão aqui' 
                    : 'O histórico dos seus serviços aparecerá aqui'}
                </p>
              </CardContent>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}
                      >
                        {getServiceIcon(service.serviceIcon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{service.serviceType}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(service.scheduledDate).toLocaleDateString('pt-BR')}</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{service.scheduledTime} ({service.estimatedDuration})</span>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>

                  {/* Pending Confirmation Alert */}
                  {service.pendingConfirmation && service.pendingConfirmation.status === 'pending' && (
                    <div 
                      className="mb-4 p-4 rounded-lg border-l-4"
                      style={{ 
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        borderLeftColor: '#FFC107'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">Confirmação Pendente</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Reagendamento proposto para: <strong>{new Date(service.pendingConfirmation.proposedDate).toLocaleString('pt-BR')}</strong>
                          </p>
                          {service.pendingConfirmation.reason && (
                            <p className="text-sm text-gray-600 mb-3">
                              Motivo: {service.pendingConfirmation.reason}
                            </p>
                          )}
                          <Button 
                            size="sm"
                            onClick={() => openConfirmationDialog(service.pendingConfirmation!)}
                            style={{ backgroundColor: '#8B20EE' }}
                          >
                            Responder
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <span className="text-sm text-gray-600">{service.address}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-gray-400 mt-1" />
                      <div className="text-sm text-gray-600">
                        {service.teamMembers.map((member, idx) => (
                          <div key={idx}>
                            {member.name} - {member.role}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Timeline for completed services */}
                  {service.timeline && <ServiceTimeline events={service.timeline} />}

                  {/* Service Notes */}
                  {service.serviceNotes && <ServiceNotes notes={service.serviceNotes} />}

                  {/* Photo Documentation */}
                  {service.photoDocumentation && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Documentação Fotográfica
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Antes</p>
                          <div className="grid grid-cols-2 gap-2">
                            {service.photoDocumentation.beforePhotos.map((photo, idx) => (
                              <div key={idx} className="relative group cursor-pointer" onClick={() => openPhotoDialog(photo)}>
                                <img src={photo} alt={`Antes ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Depois</p>
                          <div className="grid grid-cols-2 gap-2">
                            {service.photoDocumentation.afterPhotos.map((photo, idx) => (
                              <div key={idx} className="relative group cursor-pointer" onClick={() => openPhotoDialog(photo)}>
                                <img src={photo} alt={`Depois ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                  <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Enviado por {service.photoDocumentation.uploadedBy} em {new Date(service.photoDocumentation.uploadDate).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Photo Dialog */}
      <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Visualizar Foto</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="flex justify-center">
              <img src={selectedPhoto} alt="Visualização" className="max-w-full h-auto rounded-lg" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialogOpen} onOpenChange={setConfirmationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder Reagendamento</DialogTitle>
            <DialogDescription>
              {selectedConfirmation && (
                <>
                  <p className="mb-2">
                    Data original: <strong>{new Date(selectedConfirmation.requestedDate).toLocaleString('pt-BR')}</strong>
                  </p>
                  <p className="mb-2">
                    Nova data proposta: <strong>{new Date(selectedConfirmation.proposedDate).toLocaleString('pt-BR')}</strong>
                  </p>
                  {selectedConfirmation.reason && (
                    <p className="mb-2">Motivo: {selectedConfirmation.reason}</p>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="response">Mensagem (opcional)</Label>
              <Textarea 
                id="response"
                placeholder="Adicione um comentário..."
                value={confirmationResponse}
                onChange={(e) => setConfirmationResponse(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => handleConfirmationResponse(false)}>
              Recusar
            </Button>
            <Button onClick={() => handleConfirmationResponse(true)} style={{ backgroundColor: '#8B20EE' }}>
              Confirmar Nova Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const getTimelineIcon = (icon: string) => {
  switch (icon) {
    case 'start': return <PlayCircle className="h-5 w-5" />;
    case 'scissors': return <Scissors className="h-5 w-5" />;
    case 'coffee': return <Coffee className="h-5 w-5" />;
    case 'check': return <CheckCircle className="h-5 w-5" />;
    case 'activity': return <Activity className="h-5 w-5" />;
    default: return <Clock className="h-5 w-5" />;
  }
};

function ServiceTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="font-semibold mb-3">Linha do Tempo do Serviço</h4>
      <div className="relative pl-8 space-y-4 border-l-2 border-dashed" style={{ borderColor: '#8B20EE' }}>
        {events.map((event) => (
          <div key={event.id} className="relative">
            <div 
              className="absolute -left-[1.4rem] top-0 flex items-center justify-center w-10 h-10 rounded-full"
              style={{ backgroundColor: '#8B20EE', color: 'white' }}
            >
              {getTimelineIcon(event.icon)}
            </div>
            <div className="pl-4">
              <p className="font-medium">{event.title} <span className="text-sm font-normal text-gray-500">- {event.time}</span></p>
              <p className="text-sm text-gray-600">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceNotes({ notes }: { notes: ServiceNote[] }) {
  if (notes.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="font-semibold mb-3">Notas e Ocorrências</h4>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
            <div className="flex items-center gap-2 mb-1">
              {note.author.includes('Cliente') ? 
                <User className="h-4 w-4" style={{ color: '#35BAE6' }} /> : 
                <MessageSquare className="h-4 w-4" style={{ color: '#35BAE6' }} />
              }
              <span className="text-sm font-medium" style={{ color: '#35BAE6' }}>{note.author}</span>
              <span className="text-xs text-gray-500">- {note.date}</span>
            </div>
            <p className="text-sm text-gray-800">{note.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}