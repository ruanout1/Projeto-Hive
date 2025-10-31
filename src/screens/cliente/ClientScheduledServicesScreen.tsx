import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, FileText, MapPin, CheckCircle, AlertCircle, Camera, Eye, 
  ChevronLeft, ChevronRight, AlertTriangle, X, PlayCircle, Scissors, Coffee, MessageSquare, User,
  Activity // NOVO: Ícone para o botão de rastreio
} from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import api from '../../lib/api'; 

// ... (Interfaces - sem alteração) ...
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
}
interface ClientScheduledService {
  id: string;
  serviceType: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  location?: string;
  assignedTeam?: string;
  assignedCollaborator?: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  observations?: string;
  photoDocumentation?: PhotoDocumentation;
}
interface TimelineEvent {
  id: string;
  serviceId: string;
  time: string;
  date: string;
  title: string;
  description: string;
  icon: string;
}
interface ServiceNote {
  id: string;
  serviceId: string;
  author: string;
  date: string;
  note: string;
}
interface ClientScheduledServicesScreenProps {
  onBack?: () => void;
}

// ... (Dados de FALLBACK - sem alteração) ...
const FALLBACK_SERVICES: ClientScheduledService[] = [
    {
      id: 'REQ-2024-001',
      serviceType: 'Limpeza Profunda',
      description: 'Limpeza completa de todos os andares, incluindo áreas comuns e banheiros',
      scheduledDate: '2024-10-20',
      scheduledTime: '08:00',
      location: 'Unidade Principal - 3º Andar',
      assignedTeam: 'Equipe Alpha',
      assignedCollaborator: 'Carlos Silva',
      status: 'upcoming'
    },
    {
      id: 'REQ-2024-006',
      serviceType: 'Manutenção de Piscina',
      description: 'Limpeza e tratamento químico da piscina aquecida, incluindo verificação do sistema de filtragem',
      scheduledDate: '2024-10-23',
      scheduledTime: '10:00',
      location: 'Bloco B - Área de Lazer',
      assignedTeam: 'Equipe Beta',
      status: 'upcoming'
    },
    {
      id: 'REQ-2024-003',
      serviceType: 'Jardinagem',
      description: 'Manutenção de jardins e poda de árvores',
      scheduledDate: '2024-10-18',
      scheduledTime: '07:00',
      assignedTeam: 'Equipe Gamma',
      assignedCollaborator: 'João Santos',
      status: 'in-progress',
      observations: 'Serviço iniciado conforme planejado'
    },
    {
      id: 'REQ-2024-005', // O ID para o qual temos dados no backend
      serviceType: 'Limpeza Hospitalar ',
      description: 'Limpeza especializada em ambiente hospitalar',
      scheduledDate: '2024-10-15',
      scheduledTime: '06:00',
      assignedTeam: 'Equipe Delta',
      assignedCollaborator: 'Maria Silva',
      status: 'completed', // Marcado como concluído
      observations: 'Serviço concluído com excelência',
      // Adicionando as fotos também, para consistência
      photoDocumentation: {
        beforePhotos: [
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'
        ],
        afterPhotos: [
          'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400',
          'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400',
          'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
          'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400'
        ],
        uploadDate: '15/10/2024 - 09:45',
        uploadedBy: 'Maria Silva'
      }
    }
];
const FALLBACK_CONFIRMATIONS: PendingConfirmation[] = [
    {
      id: 'REQ-2024-045',
      serviceType: 'Limpeza Profunda ',
      requestedDate: '25/10/2024',
      proposedDate: '27/10/2024',
      reason: 'Equipe já alocada na data solicitada'
    }
];


export default function ClientScheduledServicesScreen({ onBack }: ClientScheduledServicesScreenProps) {
  
  // REMOVIDO: Estados do modal de fotos obsoleto (isPhotoDialogOpen, photoType, selectedPhotoIndex)
  
  // Estados para o visualizador de fotos centralizado (O CORRETO)
  const [openPhotoViewer, setOpenPhotoViewer] = useState<string | null>(null);
  const [carouselPhotoType, setCarouselPhotoType] = useState<{ [key: string]: 'before' | 'after' }>({});
  const [carouselPhotoIndex, setCarouselPhotoIndex] = useState<{ [key: string]: number }>({});
  
  // Estados para confirmação de data
  const [selectedConfirmation, setSelectedConfirmation] = useState<PendingConfirmation | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // NOVO: Estado para o modal de detalhes (Rastreio)
  const [detailsModalServiceId, setDetailsModalServiceId] = useState<string | null>(null);

  // Estados de dados dinâmicos
  const [clientServices, setClientServices] = useState<ClientScheduledService[]>([]);
  const [pendingConfirmations, setPendingConfirmations] = useState<PendingConfirmation[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [serviceNotes, setServiceNotes] = useState<ServiceNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // useEffect para buscar dados (sem alteração)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [timelineRes, notesRes] = await Promise.all([
          api.get('/api/clientes/timeline'),
          api.get('/api/clientes/service-notes')
        ]);
        setClientServices(FALLBACK_SERVICES);
        setPendingConfirmations(FALLBACK_CONFIRMATIONS);
        if (Array.isArray(timelineRes.data)) {
          setTimeline(timelineRes.data);
          toast.success("Linha do tempo carregada do backend!");
        } else {
          setTimeline([]);
        }
        if (Array.isArray(notesRes.data)) {
          setServiceNotes(notesRes.data);
          toast.success("Notas de serviço carregadas do backend!");
        } else {
          setServiceNotes([]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do backend:", error);
        toast.error("Backend não encontrado. Carregando dados de simulação.");
        setClientServices(FALLBACK_SERVICES);
        setPendingConfirmations(FALLBACK_CONFIRMATIONS);
        setTimeline([]);
        setServiceNotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); 

  // ... (Funções de Confirmação - sem alteração) ...
  const handleOpenConfirmation = (confirmation: PendingConfirmation) => {
    setSelectedConfirmation(confirmation);
    setIsConfirmationDialogOpen(true);
    setRejectionReason('');
  };
  const handleAcceptDate = () => {
    if (selectedConfirmation) {
      toast.success('Data confirmada com sucesso!');
      setPendingConfirmations(prev => prev.filter(p => p.id !== selectedConfirmation.id));
      setIsConfirmationDialogOpen(false);
      setSelectedConfirmation(null);
    }
  };
  const handleRejectDate = () => {
    if (selectedConfirmation && rejectionReason.trim()) {
      toast.info('Data recusada');
      setPendingConfirmations(prev => prev.filter(p => p.id !== selectedConfirmation.id));
      setIsConfirmationDialogOpen(false);
      setSelectedConfirmation(null);
      setRejectionReason('');
    } else {
      toast.error('Por favor, informe o motivo da recusa');
    }
  };

  // REMOVIDO: Função handleViewPhotos obsoleta
  
  // ... (Funções getStatusConfig, formatDate, isUpcoming - sem alteração) ...
  const getStatusConfig = (status: string) => {
    const configs = {
      'upcoming': { 
        label: 'Agendado', 
        color: '#35BAE6',
        bg: 'rgba(53, 186, 230, 0.1)',
        icon: Calendar
      },
      'in-progress': { 
        label: 'Em Andamento', 
        color: '#8B20EE',
        bg: 'rgba(139, 32, 238, 0.1)',
        icon: AlertCircle
      },
      'completed': { 
        label: 'Concluído', 
        color: '#16a34a',
        bg: 'rgba(34, 197, 94, 0.1)',
        icon: CheckCircle
      }
    };
    return configs[status as keyof typeof configs];
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };
  const isUpcoming = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const serviceDate = new Date(dateString + 'T00:00:00');
    return serviceDate >= today;
  };
  
  // ... (Filtros, Sorteio, Stats - sem alteração) ...
  const filteredServices = clientServices.filter(service => {
    if (statusFilter === 'all') return true;
    return service.status === statusFilter;
  });
  const sortedServices = [...filteredServices].sort((a, b) => {
    const dateA = new Date(a.scheduledDate + 'T' + a.scheduledTime);
    const dateB = new Date(b.scheduledDate + 'T' + b.scheduledTime);
    return dateB.getTime() - dateA.getTime();
  });
  const stats = {
    total: clientServices.length,
    upcoming: clientServices.filter(s => s.status === 'upcoming').length,
    inProgress: clientServices.filter(s => s.status === 'in-progress').length,
    completed: clientServices.filter(s => s.status === 'completed').length
  };

  // ... (Tela de Loading - sem alteração) ...
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Clock className="h-6 w-6 mx-auto mb-2 animate-spin" />
        Carregando dados do backend...
      </div>
    );
  }

  return (
    <div className="p-6">
      <ScreenHeader 
        title="Meus Serviços Agendados"
        description="Acompanhe os serviços que foram agendados para você"
        onBack={() => onBack?.()}
      />
      
      {/* Seção de Confirmações Pendentes (sem alteração) */}
      {pendingConfirmations.length > 0 && (
        <div className="space-y-3 mb-6">
          {pendingConfirmations.map((confirmation) => (
            <Card key={confirmation.id} className="border-2 bg-white" style={{ borderColor: '#FFFF20' }}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <AlertTriangle className="h-6 w-6" style={{ color: '#DAA520' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold" style={{ color: '#6400A4' }}>
                      Confirmação de Data Pendente - {confirmation.id}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      O gestor propôs uma nova data para o serviço de <span className="font-medium">{confirmation.serviceType}</span>
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleOpenConfirmation(confirmation)}
                        style={{ backgroundColor: '#6400A4', color: 'white' }}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Visualizar e Responder
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cards de Resumo (sem alteração) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* ... (seus 4 cards de stats) ... */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total</p><p className="text-2xl" style={{ color: '#6400A4' }}>{stats.total}</p></div><Calendar className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} /></div></div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Agendados</p><p className="text-2xl" style={{ color: '#35BAE6' }}>{stats.upcoming}</p></div><Clock className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} /></div></div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Em Andamento</p><p className="text-2xl" style={{ color: '#8B20EE' }}>{stats.inProgress}</p></div><AlertCircle className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} /></div></div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Concluídos</p><p className="text-2xl text-green-600">{stats.completed}</p></div><CheckCircle className="h-8 w-8 text-green-500 opacity-50" /></div></div>
      </div>

      {/* Filtros (sem alteração) */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="upcoming">Agendados</TabsTrigger>
                <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
                <TabsTrigger value="completed">Concluídos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Serviços */}
      <div className="space-y-4">
        {sortedServices.length === 0 ? (
          <Card className="p-12 text-center">
            {/* ... (empty state) ... */}
          </Card>
        ) : (
          sortedServices.map((service) => {
            const statusConfig = getStatusConfig(service.status);
            const StatusIcon = statusConfig.icon;
            
            // Filtra os dados de rastreio para ESTE card
            const currentTimeline = timeline.filter(t => t.serviceId === service.id);
            const currentNotes = serviceNotes.filter(n => n.serviceId === service.id);

            return (
              <Card 
                key={service.id}
                className="hover:shadow-md transition-shadow"
                style={service.status === 'upcoming' && isUpcoming(service.scheduledDate) ? { borderLeft: '4px solid #35BAE6' } : {}}
              >
                  <CardContent className="p-5">
                    {/* ... (Cabeçalho do card - sem alteração) ... */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{service.serviceType}</h3>
                          <Badge 
                            style={{ 
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                              border: `1px solid ${statusConfig.color}`
                            }}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">ID: {service.id}</p>
                      </div>
                    </div>

                    {/* ... (Descrição e grid de Data/Local - sem alteração) ... */}
                    <p className="text-sm mb-4">{service.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 mt-0.5" style={{ color: '#6400A4' }} />
                        <div>
                          <p className="text-xs text-gray-500">Data e Horário</p>
                          <p className="font-semibold">{formatDate(service.scheduledDate)}</p>
                          <p className="text-sm text-gray-600">{service.scheduledTime}</p>
                        </div>
                      </div>
                      {service.location && (
                        <div className="flex items-start gap-2">
                          <MapPin className="h-5 w-5 mt-0.5" style={{ color: '#35BAE6' }} />
                          <div>
                            <p className="text-xs text-gray-500">Local</p>
                            <p className="text-sm">{service.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ... (Equipe e Observações - sem alteração) ... */}
                    {service.assignedTeam && (
                      <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4" style={{ color: '#8B20EE' }} />
                          <p className="text-sm" style={{ color: '#8B20EE' }}>
                            <span className="font-semibold">{service.assignedTeam}</span>
                            {service.assignedCollaborator && ` • ${service.assignedCollaborator}`}
                          </p>
                        </div>
                      </div>
                    )}
                    {service.observations && (
                      <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                        <p className="text-xs text-gray-600 mb-1">Observações</p>
                        <p className="text-sm">{service.observations}</p>
                      </div>
                    )}

                    {/* REMOVIDO: Linha do Tempo e Notas daqui */}
                    
                    {/* NOVO: Seção de botões com espaçamento */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap justify-center gap-2 mt-3">
                      {/* Botão Ver Fotos (sem alteração) */}
                      {service.photoDocumentation && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 hover:opacity-90 transition-all text-white"
                          style={{ 
                            backgroundColor: '#6400A4'
                          }}
                          onClick={() => {
                            if (!carouselPhotoType[service.id]) {
                              setCarouselPhotoType(prev => ({ ...prev, [service.id]: 'before' }));
                              setCarouselPhotoIndex(prev => ({ ...prev, [service.id]: 0 }));
                            }
                            setOpenPhotoViewer(service.id);
                          }}
                        >
                          <Camera className="h-4 w-4" />
                          Ver Fotos
                        </Button>
                      )}

                      {/* NOVO: Botão de Rastreio (só aparece se tiver dados) */}
                      {(currentTimeline.length > 0 || currentNotes.length > 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                          onClick={() => setDetailsModalServiceId(service.id)}
                        >
                          <Activity className="h-4 w-4" />
                          Ver Rastreio
                        </Button>
                      )}
                    </div>


                    {/* ... (Aviso de "agendado para breve" - sem alteração) ... */}
                    {service.status === 'upcoming' && isUpcoming(service.scheduledDate) && (
                      <div className="mt-3 flex items-center gap-2 text-sm" style={{ color: '#35BAE6' }}>
                        <AlertCircle className="h-4 w-4" />
                        <span>Serviço agendado para breve</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
            );
          })
        )}
      </div>

      {/* ... (Informação Adicional - sem alteração) ... */}
      {sortedServices.length > 0 && (
        <Card className="mt-6" style={{ backgroundColor: 'rgba(100, 0, 164, 0.02)' }}>
          {/* ... */}
        </Card>
      )}

      {/* Modal de Visualizador de Fotos Centralizado (O CORRETO - sem alteração) */}
      {openPhotoViewer && (
        (() => {
        // ... (lógica do modal de fotos)
        const service = clientServices.find(s => s.id === openPhotoViewer);
        if (!service || !service.photoDocumentation) return null;
        
        const currentType = carouselPhotoType[openPhotoViewer] || 'before';
        const currentIndex = carouselPhotoIndex[openPhotoViewer] || 0;
        const photos = currentType === 'before' 
          ? service.photoDocumentation.beforePhotos 
          : service.photoDocumentation.afterPhotos;

        const handleTypeChange = (type: 'before' | 'after') => {
          setCarouselPhotoType(prev => ({ ...prev, [openPhotoViewer]: type }));
          setCarouselPhotoIndex(prev => ({ ...prev, [openPhotoViewer]: 0 }));
        };
        const handlePrevPhoto = () => {
          setCarouselPhotoIndex(prev => ({
            ...prev,
            [openPhotoViewer]: currentIndex > 0 ? currentIndex - 1 : photos.length - 1
          }));
        };
        const handleNextPhoto = () => {
          setCarouselPhotoIndex(prev => ({
            ...prev,
            [openPhotoViewer]: currentIndex < photos.length - 1 ? currentIndex + 1 : 0
          }));
        };

        return (
          <Dialog open={true} onOpenChange={() => setOpenPhotoViewer(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle style={{ color: '#6400A4' }}>
                  Documentação Fotográfica - {service.serviceType}
                </DialogTitle>
                <DialogDescription>
                  {service.id} | Enviado em {service.photoDocumentation.uploadDate}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Toggle Antes/Depois */}
                <div className="flex justify-center gap-2">
                  <Button
                    variant={currentType === 'before' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTypeChange('before')}
                    style={currentType === 'before' ? { 
                      backgroundColor: '#6400A4',
                      color: 'white'
                    } : {
                      borderColor: '#6400A4',
                      color: '#6400A4'
                    }}
                  >
                    Antes ({service.photoDocumentation.beforePhotos.length})
                  </Button>
                  <Button
                    variant={currentType === 'after' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTypeChange('after')}
                    style={currentType === 'after' ? { 
                      backgroundColor: '#6400A4',
                      color: 'white'
                    } : {
                      borderColor: '#6400A4',
                      color: '#6400A4'
                    }}
                  >
                    Depois ({service.photoDocumentation.afterPhotos.length})
                  </Button>
                </div>

                {/* Carrossel de Fotos */}
                <div className="relative">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={photos[currentIndex]} 
                      alt={`${currentType === 'before' ? 'Antes' : 'Depois'} ${currentIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Navegação */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevPhoto}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                        style={{ color: '#6400A4' }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={handleNextPhoto}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                        style={{ color: '#6400A4' }}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Indicador de posição */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1.5 rounded-full text-sm">
                    {currentIndex + 1} / {photos.length}
                  </div>
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Enviado por {service.photoDocumentation.uploadedBy}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        );
      })()
      )}

      {/* REMOVIDO: Dialog de Fotos obsoleto */}
      
      {/* NOVO: Modal de Detalhes e Rastreio */}
      <Dialog open={!!detailsModalServiceId} onOpenChange={() => setDetailsModalServiceId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>Rastreio do Serviço</DialogTitle>
          </DialogHeader>
          
          {(() => {
            if (!detailsModalServiceId) return null;
            
            const service = clientServices.find(s => s.id === detailsModalServiceId);
            if (!service) return null;
            
            // Filtra e ordena os dados para este modal
            const serviceTimeline = timeline
              .filter(t => t.serviceId === detailsModalServiceId)
              .sort((a, b) => { // Ordena do mais antigo para o mais novo
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                if (dateA.getTime() !== dateB.getTime()) {
                  return dateA.getTime() - dateB.getTime();
                }
                return a.time.localeCompare(b.time); // Compara o tempo se as datas forem iguais
              });
              
            const modalServiceNotes = serviceNotes
              .filter(n => n.serviceId === detailsModalServiceId)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Mais nova primeiro

            return (
              <div className="space-y-6 py-4">
                {/* Resumo do Serviço */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold text-lg" style={{ color: '#6400A4' }}>{service.serviceType}</h3>
                  <p className="text-sm text-gray-600 mb-2">{service.id}</p>
                  <p className="text-sm">{service.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{formatDate(service.scheduledDate)} às {service.scheduledTime}</span>
                    </div>
                    {service.assignedTeam && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{service.assignedTeam}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Renderiza os componentes reutilizados */}
                <ServiceTimeline events={serviceTimeline} />
                <ServiceNotes notes={modalServiceNotes} />

                {serviceTimeline.length === 0 && serviceNotes.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Nenhum rastreio ou nota disponível para este serviço.</p>
                )}
              </div>
            );
          })()}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalServiceId(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Dialog de Confirmação de Data (sem alteração) */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        {/* ... (seu modal de confirmação) ... */}
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Confirmação de Data - {selectedConfirmation?.id}
            </DialogTitle>
            <DialogDescription>
              O gestor propôs uma data diferente da solicitada. Revise os detalhes e confirme ou recuse.
            </DialogDescription>
          </DialogHeader>
          {selectedConfirmation && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border-2" style={{ borderColor: '#FFFF20', backgroundColor: 'rgba(255, 255, 32, 0.05)' }}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 mt-0.5" style={{ color: '#DAA520' }} />
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: '#DAA520' }}>Data Diferente da Solicitada</p>
                    <p className="text-sm text-gray-600 mt-1">
                      O gestor não pôde agendar para a data que você solicitou e está propondo uma nova data.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label>Tipo de Serviço</Label>
                <p className="mt-2 p-2 bg-gray-50 rounded border">{selectedConfirmation.serviceType}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg border bg-gray-50">
                  <Label className="text-xs text-gray-600">Data Solicitada por Você</Label>
                  <p className="font-medium text-gray-900 mt-1">{selectedConfirmation.requestedDate}</p>
                </div>
                <div className="p-3 rounded-lg border-2" style={{ borderColor: '#6400A4', backgroundColor: 'rgba(100, 0, 164, 0.02)' }}>
                  <Label className="text-xs" style={{ color: '#6400A4' }}>Nova Data Proposta</Label>
                  <p className="font-medium mt-1" style={{ color: '#6400A4' }}>{selectedConfirmation.proposedDate}</p>
                </div>
              </div>
              {selectedConfirmation.reason && (
                <div className="p-4 rounded-lg border bg-white">
                  <Label className="flex items-center gap-2 mb-2" style={{ color: '#6400A4' }}>
                    <Calendar className="h-4 w-4" />
                    Motivo da Mudança
                  </Label>
                  <p className="text-sm text-gray-700">{selectedConfirmation.reason}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Motivo da Recusa <span className="text-xs text-gray-500">(opcional, mas recomendado)</span>
                </Label>
                <Textarea
                  placeholder="Se você não puder aceitar esta data, explique o motivo para que o gestor possa propor uma alternativa mais adequada..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmationDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="outline"
              onClick={handleRejectDate}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Recusar Data
            </Button>
            <Button
              onClick={handleAcceptDate}
              style={{ backgroundColor: '#10B981', color: 'white' }}
              className="hover:opacity-90"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Aceitar Data Proposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}

// =============================================================
// Sub-componentes (sem alteração, movidos para o final)
// =============================================================
const getTimelineIcon = (icon: string) => {
  switch (icon) {
    case 'play': return <PlayCircle className="h-5 w-5" />;
    case 'scissors': return <Scissors className="h-5 w-5" />;
    case 'coffee': return <Coffee className="h-5 w-5" />;
    default: return <Clock className="h-5 w-5" />;
  }
};

function ServiceTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t">
      <h4 className="font-semibold mb-3">Linha do Tempo do Serviço</h4>
      <div className="relative pl-8 space-y-4 border-l-2 border-dashed" style={{ borderColor: '#8B20EE' }}>
        {events.map((event, index) => (
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