import { useState } from 'react';
import { Calendar, Clock, Users, FileText, MapPin, CheckCircle, AlertCircle, Camera, Eye, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

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

interface ClientScheduledServicesScreenProps {
  onBack?: () => void;
}

export default function ClientScheduledServicesScreen({ onBack }: ClientScheduledServicesScreenProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoDocumentation | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  
  // Estados para o visualizador de fotos centralizado
  const [openPhotoViewer, setOpenPhotoViewer] = useState<string | null>(null);
  const [carouselPhotoType, setCarouselPhotoType] = useState<{ [key: string]: 'before' | 'after' }>({});
  const [carouselPhotoIndex, setCarouselPhotoIndex] = useState<{ [key: string]: number }>({});
  
  // Estados para confirmação de data
  const [selectedConfirmation, setSelectedConfirmation] = useState<PendingConfirmation | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Mock de confirmações pendentes (solicitações com data diferente proposta pelo gestor)
  const pendingConfirmations: PendingConfirmation[] = [
    {
      id: 'REQ-2024-045',
      serviceType: 'Limpeza Profunda',
      requestedDate: '25/10/2024',
      proposedDate: '27/10/2024',
      reason: 'Equipe já alocada na data solicitada'
    }
  ];

  const handleOpenConfirmation = (confirmation: PendingConfirmation) => {
    setSelectedConfirmation(confirmation);
    setIsConfirmationDialogOpen(true);
    setRejectionReason('');
  };

  const handleAcceptDate = () => {
    if (selectedConfirmation) {
      toast.success('Data confirmada com sucesso!', {
        description: `O serviço "${selectedConfirmation.serviceType}" foi confirmado para ${selectedConfirmation.proposedDate}.`
      });
      setIsConfirmationDialogOpen(false);
      setSelectedConfirmation(null);
    }
  };

  const handleRejectDate = () => {
    if (selectedConfirmation && rejectionReason.trim()) {
      toast.info('Data recusada', {
        description: `Sua recusa foi enviada ao gestor. Em breve você receberá uma nova proposta de data.`
      });
      setIsConfirmationDialogOpen(false);
      setSelectedConfirmation(null);
      setRejectionReason('');
    } else {
      toast.error('Por favor, informe o motivo da recusa');
    }
  };

  const clientServices: ClientScheduledService[] = [
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
      id: 'REQ-2024-005',
      serviceType: 'Limpeza Hospitalar',
      description: 'Limpeza especializada em ambiente hospitalar',
      scheduledDate: '2024-10-15',
      scheduledTime: '06:00',
      assignedTeam: 'Equipe Delta',
      assignedCollaborator: 'Maria Silva',
      status: 'completed',
      observations: 'Serviço concluído com excelência',
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
          'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=400'
        ],
        uploadDate: '15/10/2024 - 09:45',
        uploadedBy: 'Maria Silva'
      }
    },
    {
      id: 'REQ-2024-007',
      serviceType: 'Manutenção Elétrica',
      description: 'Troca de lâmpadas e manutenção preventiva do sistema elétrico',
      scheduledDate: '2024-10-12',
      scheduledTime: '14:00',
      assignedTeam: 'Equipe Epsilon',
      status: 'completed',
      photoDocumentation: {
        beforePhotos: [
          'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400',
          'https://images.unsplash.com/photo-1597006342437-8e9bbb93a597?w=400'
        ],
        afterPhotos: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
          'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400'
        ],
        uploadDate: '12/10/2024 - 16:30',
        uploadedBy: 'Pedro Costa'
      }
    }
  ];

  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleViewPhotos = (documentation: PhotoDocumentation, type: 'before' | 'after', index: number = 0) => {
    setSelectedPhotos(documentation);
    setPhotoType(type);
    setSelectedPhotoIndex(index);
    setIsPhotoDialogOpen(true);
  };



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

  // Filtros
  const filteredServices = clientServices.filter(service => {
    if (statusFilter === 'all') return true;
    return service.status === statusFilter;
  });

  // Ordenar por data
  const sortedServices = [...filteredServices].sort((a, b) => {
    const dateA = new Date(a.scheduledDate + 'T' + a.scheduledTime);
    const dateB = new Date(b.scheduledDate + 'T' + b.scheduledTime);
    return dateB.getTime() - dateA.getTime(); // Mais recentes primeiro
  });

  // Estatísticas
  const stats = {
    total: clientServices.length,
    upcoming: clientServices.filter(s => s.status === 'upcoming').length,
    inProgress: clientServices.filter(s => s.status === 'in-progress').length,
    completed: clientServices.filter(s => s.status === 'completed').length
  };

  return (
    <div className="p-6">
      <ScreenHeader 
        title="Meus Serviços Agendados"
        description="Acompanhe os serviços que foram agendados para você"
        onBack={() => onBack?.()}
      />



      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl" style={{ color: '#6400A4' }}>{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agendados</p>
              <p className="text-2xl" style={{ color: '#35BAE6' }}>{stats.upcoming}</p>
            </div>
            <Clock className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Andamento</p>
              <p className="text-2xl" style={{ color: '#8B20EE' }}>{stats.inProgress}</p>
            </div>
            <AlertCircle className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Concluídos</p>
              <p className="text-2xl text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filtros */}
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
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-gray-500">Nenhum serviço agendado encontrado</p>
          </Card>
        ) : (
          sortedServices.map((service) => {
            const statusConfig = getStatusConfig(service.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card 
                key={service.id}
                className="hover:shadow-md transition-shadow"
                style={service.status === 'upcoming' && isUpcoming(service.scheduledDate) ? { borderLeft: '4px solid #35BAE6' } : {}}
              >
                  <CardContent className="p-5">
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

                    {/* Botão Ver Fotos com Popover */}
                    {service.photoDocumentation && (() => {
                      const currentType = carouselPhotoType[service.id] || 'before';
                      const currentIndex = carouselPhotoIndex[service.id] || 0;
                      const photos = currentType === 'before' 
                        ? service.photoDocumentation.beforePhotos 
                        : service.photoDocumentation.afterPhotos;
                      
                      const handlePrevPhoto = () => {
                        setCarouselPhotoIndex(prev => ({
                          ...prev,
                          [service.id]: currentIndex > 0 ? currentIndex - 1 : photos.length - 1
                        }));
                      };

                      const handleNextPhoto = () => {
                        setCarouselPhotoIndex(prev => ({
                          ...prev,
                          [service.id]: currentIndex < photos.length - 1 ? currentIndex + 1 : 0
                        }));
                      };

                      const handleTypeChange = (type: 'before' | 'after') => {
                        setCarouselPhotoType(prev => ({ ...prev, [service.id]: type }));
                        setCarouselPhotoIndex(prev => ({ ...prev, [service.id]: 0 }));
                      };

                      return (
                        <div className="pt-3 border-t border-gray-100 flex justify-center mt-3">
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
                        </div>
                      );
                    })()}

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

      {/* Informação Adicional */}
      {sortedServices.length > 0 && (
        <Card className="mt-6" style={{ backgroundColor: 'rgba(100, 0, 164, 0.02)' }}>
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 mt-0.5" style={{ color: '#6400A4' }} />
              <div>
                <p className="text-sm" style={{ color: '#6400A4' }}>
                  <span className="font-semibold">Informação:</span> Em caso de dúvidas ou necessidade de reagendamento, entre em contato através do menu Comunicação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Visualizador de Fotos Centralizado */}
      {openPhotoViewer && (() => {
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
      })()}

      {/* Dialog de Visualização de Fotos em Tela Cheia */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Documentação Fotográfica - {photoType === 'before' ? 'Antes' : 'Depois'}
            </DialogTitle>
            <DialogDescription>
              Visualize as fotos documentadas do serviço
            </DialogDescription>
          </DialogHeader>

          {selectedPhotos && (
            <div className="space-y-4">
              {/* Foto Principal */}
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={photoType === 'before' 
                    ? selectedPhotos.beforePhotos[selectedPhotoIndex]
                    : selectedPhotos.afterPhotos[selectedPhotoIndex]
                  }
                  alt={`${photoType === 'before' ? 'Antes' : 'Depois'} ${selectedPhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Miniaturas */}
              <div className="grid grid-cols-6 gap-2">
                {(photoType === 'before' ? selectedPhotos.beforePhotos : selectedPhotos.afterPhotos).map((photo, idx) => (
                  <div 
                    key={idx}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      idx === selectedPhotoIndex 
                        ? 'border-purple-600 ring-2 ring-purple-300' 
                        : 'border-gray-200 hover:border-purple-400'
                    }`}
                    onClick={() => setSelectedPhotoIndex(idx)}
                  >
                    <img 
                      src={photo} 
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Botões de Navegação */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhotoType(photoType === 'before' ? 'after' : 'before');
                    setSelectedPhotoIndex(0);
                  }}
                  style={{ borderColor: '#6400A4', color: '#6400A4' }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Ver Fotos "{photoType === 'before' ? 'Depois' : 'Antes'}"
                </Button>

                <div className="text-sm text-gray-600">
                  {selectedPhotoIndex + 1} / {(photoType === 'before' ? selectedPhotos.beforePhotos : selectedPhotos.afterPhotos).length}
                </div>

                <Button
                  onClick={() => setIsPhotoDialogOpen(false)}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Data */}
      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
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
              {/* Alerta de Data Diferente */}
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

              {/* Informações do Serviço */}
              <div>
                <Label>Tipo de Serviço</Label>
                <p className="mt-2 p-2 bg-gray-50 rounded border">{selectedConfirmation.serviceType}</p>
              </div>

              {/* Comparação de Datas */}
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

              {/* Campo de Motivo de Recusa */}
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
