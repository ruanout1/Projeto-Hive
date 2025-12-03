import { 
  CheckCircle, Clock, User, MapPin, Star, Calendar, Bot, DollarSign, StickyNote, FileText, 
  TrendingUp, ArrowRight, Camera, Eye, ChevronLeft, ChevronRight, AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Button } from '../../components/ui/button';
import { useState, useEffect } from 'react';
import AIAssistant from '../../components/AIAssistant';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { toast } from 'sonner';
import api from '../../lib/api';


// Tipagens
// =============================
interface CurrentService {
  id: string;
  title: string;
  status: string;
  progress: number;
  startDate: string;
  expectedEnd: string;
  team: string;
  leader: string;
  phone: string;
  location: string;
}

interface PhotoDocumentation {
  beforePhotos: string[];
  afterPhotos: string[];
  uploadDate: string;
  uploadedBy: string;
}

interface ServiceHistoryItem {
  id: string;
  service: string;
  date: string;
  team: string;
  status: string;
  rating: number;
  duration: string;
  photoDocumentation: PhotoDocumentation;
}

interface ClientDashboardProps {
  onSectionChange?: (section: string, params?: any) => void;
}

// =============================================================
// DADOS ESTÁTICOS DE FALLBACK (caso backend não responda)
// =============================================================
const FALLBACK_CURRENT_SERVICE: CurrentService = {
  id: "OS-2024-089",
  title: "Limpeza Geral - Escritório Corporate",
  status: "em-andamento",
  progress: 70,
  startDate: "23/09/2024",
  expectedEnd: "23/09/2024 - 17:00",
  team: "Equipe Alpha",
  leader: "Carlos Silva",
  phone: "(11) 99999-8888",
  location: "Av. Paulista, 1000 - 15º andar"
};

const FALLBACK_SERVICE_HISTORY: ServiceHistoryItem[] = [
  {
    id: "OS-2024-078",
    service: "Limpeza Geral",
    date: "20/09/2024",
    team: "Equipe Beta",
    status: "completed",
    rating: 5,
    duration: "6h",
    photoDocumentation: {
      beforePhotos: [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
        "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800",
        "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?w=800"
      ],
      afterPhotos: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800"
      ],
      uploadDate: "20/09/2024 17:30",
      uploadedBy: "Carlos Silva"
    }
  },
  {
    id: "OS-2024-065",
    service: "Limpeza de Vidros",
    date: "15/09/2024",
    team: "Equipe Alpha",
    status: "completed",
    rating: 4,
    duration: "4h",
    photoDocumentation: {
      beforePhotos: [
        "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=800",
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800"
      ],
      afterPhotos: [
        "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800",
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800"
      ],
      uploadDate: "15/09/2024 16:45",
      uploadedBy: "Marina Costa"
    }
  }
];

// =============================
// Componente Principal
// =============================
export default function ClientDashboard({ onSectionChange }: ClientDashboardProps) {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<{ photos: string[], currentIndex: number, type: 'before' | 'after' } | null>(null);
  const [photoCarousels, setPhotoCarousels] = useState<{ [key: string]: { currentIndex: number, currentType: 'before' | 'after' } }>({});
  const [openPhotoViewer, setOpenPhotoViewer] = useState<string | null>(null);

  // =============================
  // ✅ INTEGRAÇÃO COM BACKEND
  // =============================
  const [currentService, setCurrentService] = useState<CurrentService | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // =============================================================
  // ✅ BUSCAR DADOS DO BACKEND
  // =============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Buscando dados do backend...');
        
        // Faz as duas requisições em paralelo
        const [currentResponse, historyResponse] = await Promise.allSettled([
          api.get('/client-portal/current-service'),
          api.get('/client-portal/history')
        ]);

        // Processa serviço atual
        if (currentResponse.status === 'fulfilled' && currentResponse.value.data) {
          setCurrentService(currentResponse.value.data);
          console.log(' Serviço atual carregado do backend');
        } else {
          setCurrentService(FALLBACK_CURRENT_SERVICE);
          console.log('ℹ Usando dados de fallback para Serviço Atual');
        }

        // Processa histórico
        if (historyResponse.status === 'fulfilled' && Array.isArray(historyResponse.value.data) && historyResponse.value.data.length > 0) {
          setServiceHistory(historyResponse.value.data);
          console.log(' Histórico carregado do backend:', historyResponse.value.data.length, 'serviços');
        } else {
          setServiceHistory(FALLBACK_SERVICE_HISTORY);
          console.log('ℹ Usando dados de fallback para Histórico');
        }

      } catch (error: any) {
        console.error(" Erro ao buscar dados do backend:", error);
        
        // Verifica tipo de erro
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          toast.info('Backend offline - usando dados de exemplo', {
            description: 'Os dados mostrados são apenas para demonstração'
          });
        } else if (error.response?.status === 401) {
          console.log('❌ Token inválido ou expirado');
        } else {
          toast.error('Erro ao carregar dados', {
            description: 'Usando dados de exemplo'
          });
        }
        
        // Usa fallback em caso de erro
        setCurrentService(FALLBACK_CURRENT_SERVICE);
        setServiceHistory(FALLBACK_SERVICE_HISTORY);
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =============================================================
  // Funções Auxiliares
  // =============================================================
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'em-andamento':
        return <Badge className="border-none" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' }}>Em Andamento</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-none">Concluído</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-none">Agendado</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const initializeCarousel = (serviceId: string) => {
    if (!photoCarousels[serviceId]) {
      setPhotoCarousels(prev => ({
        ...prev,
        [serviceId]: { currentIndex: 0, currentType: 'before' }
      }));
    }
  };

  const handleTypeChange = (serviceId: string, type: 'before' | 'after') => {
    setPhotoCarousels(prev => ({
      ...prev,
      [serviceId]: { currentIndex: 0, currentType: type }
    }));
  };

  const handlePrevPhoto = (serviceId: string, photosLength: number) => {
    setPhotoCarousels(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        currentIndex: prev[serviceId].currentIndex === 0 ? photosLength - 1 : prev[serviceId].currentIndex - 1
      }
    }));
  };

  const handleNextPhoto = (serviceId: string, photosLength: number) => {
    setPhotoCarousels(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        currentIndex: prev[serviceId].currentIndex === photosLength - 1 ? 0 : prev[serviceId].currentIndex + 1
      }
    }));
  };

  const handleViewPhotos = (photoDoc: any, type: 'before' | 'after', index: number) => {
    const photos = type === 'before' ? photoDoc.beforePhotos : photoDoc.afterPhotos;
    setExpandedPhoto({ photos, currentIndex: index, type });
  };

  const handleExpandedPrevPhoto = () => {
    if (expandedPhoto) {
      setExpandedPhoto({
        ...expandedPhoto,
        currentIndex: expandedPhoto.currentIndex === 0 
          ? expandedPhoto.photos.length - 1 
          : expandedPhoto.currentIndex - 1
      });
    }
  };

  const handleExpandedNextPhoto = () => {
    if (expandedPhoto) {
      setExpandedPhoto({
        ...expandedPhoto,
        currentIndex: expandedPhoto.currentIndex === expandedPhoto.photos.length - 1 
          ? 0 
          : expandedPhoto.currentIndex + 1
      });
    }
  };

  // =============================================================
  // RENDERIZAÇÃO - LOADING
  // =============================================================
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Clock className="h-8 w-8 mx-auto mb-2 animate-spin" style={{ color: '#6400A4' }} />
        <p>Carregando...</p>
      </div>
    );
  }
  
  // =============================================================
  // RENDERIZAÇÃO - ERRO
  // =============================================================
  if (!currentService) {
    return (
      <div className="p-6 text-center text-red-500">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Erro ao carregar dados</p>
      </div>
    );
  }

  // =============================================================
  // RENDERIZAÇÃO PRINCIPAL
  // =============================================================
  return (
    <div className="p-6 overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="hive-screen-title">Dashboard de Serviços</h1>
          <p className="text-black">
            Status atual dos seus serviços e histórico completo de atendimentos.
          </p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          style={{ backgroundColor: '#6400A4', color: 'white' }}
          onClick={() => setIsAIOpen(true)}
        >
          <Bot className="h-4 w-4" />
          <span>IA</span>
        </Button>
      </div>

      {/* Serviço Atual */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-black flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Serviço Atual
            </div>
            {getStatusBadge(currentService.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Principais */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-black mb-3">{currentService.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-start space-x-2 text-sm text-black mb-3">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{currentService.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-black mb-2">
                      <StickyNote className="h-4 w-4" style={{ color: '#8B20EE' }} />
                      <span>OS: {currentService.id}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-black mb-2">
                      <Calendar className="h-4 w-4" style={{ color: '#8B20EE' }} />
                      <span>Iniciado: {currentService.startDate}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-black">
                      <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
                      <span>Previsão: {currentService.expectedEnd}</span>
                    </div>
                  </div>

                  <div className="border-l pl-4">
                    <h4 className="text-black mb-3">Equipe Responsável</h4>
                    <div className="flex items-center space-x-2 text-sm text-black mb-2">
                      <User className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      <span>Líder: {currentService.leader}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-black mb-2">
                      <Badge className="border-none" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' }}>
                        {currentService.team}
                      </Badge>
                    </div>
                    <div className="text-sm text-black">
                      📞 {currentService.phone}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progresso */}
            <div className="space-y-4">
              <div>
                <h4 className="text-black mb-3">Progresso do Serviço</h4>
                <div className="flex justify-center mb-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#E5E7EB"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#6400A4"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - currentService.progress / 100)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-black" style={{ fontSize: '1.5rem' }}>{currentService.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {currentService.progress < 30 && 'Início dos trabalhos'}
                    {currentService.progress >= 30 && currentService.progress < 70 && 'Em andamento'}
                    {currentService.progress >= 70 && currentService.progress < 100 && 'Finalização em breve'}
                    {currentService.progress === 100 && 'Concluído'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Acesso Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSectionChange?.('dashboard-gastos')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                  <DollarSign className="h-6 w-6" style={{ color: '#35BAE6' }} />
                </div>
                <div>
                  <h3 className="text-black">Dashboard de Gastos</h3>
                  <p className="text-sm text-gray-600">Controle financeiro completo</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onSectionChange?.('documentos-cliente')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                  <FileText className="h-6 w-6" style={{ color: '#6400A4' }} />
                </div>
                <div>
                  <h3 className="text-black">Documentos</h3>
                  <p className="text-sm text-gray-600">Contratos e relatórios</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Serviços */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
            Histórico de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serviceHistory.map((service, index) => (
              <div 
                key={index} 
                className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white" 
                style={{ borderColor: 'rgba(100, 0, 164, 0.2)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      <h4 className="text-black">{service.service}</h4>
                    </div>
                    <p className="text-sm text-gray-600">OS: {service.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 mb-1">
                      {renderStars(service.rating)}
                    </div>
                    <Badge 
                      className="border-none"
                      style={{ 
                        backgroundColor: 'rgba(53, 186, 230, 0.1)', 
                        color: '#35BAE6' 
                      }}
                    >
                      Concluído
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
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

                <div className="pt-3 border-t border-gray-100 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:opacity-90 transition-all text-white"
                    style={{ 
                      backgroundColor: '#6400A4'
                    }}
                    onClick={() => {
                      initializeCarousel(service.id);
                      setOpenPhotoViewer(service.id);
                    }}
                  >
                    <Camera className="h-4 w-4" />
                    Ver Fotos
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        userType="cliente"
      />

      {/* Modal de Visualizador de Fotos */}
      {openPhotoViewer && (() => {
        const service = serviceHistory.find(s => s.id === openPhotoViewer);
        if (!service || !service.photoDocumentation) return null;

        const carousel = photoCarousels[openPhotoViewer] || { currentIndex: 0, currentType: 'before' as const };
        const currentType = carousel.currentType;
        const photos = currentType === 'before' 
          ? service.photoDocumentation.beforePhotos 
          : service.photoDocumentation.afterPhotos;
        const currentIndex = carousel.currentIndex;

        return (
          <Dialog open={true} onOpenChange={() => setOpenPhotoViewer(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle style={{ color: '#6400A4' }}>
                  Documentação Fotográfica - {service.service}
                </DialogTitle>
                <DialogDescription>
                  OS: {service.id} | Enviado em {service.photoDocumentation.uploadDate}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Toggle Antes/Depois */}
                <div className="flex justify-center gap-2">
                  <Button
                    variant={currentType === 'before' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTypeChange(openPhotoViewer, 'before')}
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
                    onClick={() => handleTypeChange(openPhotoViewer, 'after')}
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
                        onClick={() => handlePrevPhoto(openPhotoViewer, photos.length)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                        style={{ color: '#6400A4' }}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => handleNextPhoto(openPhotoViewer, photos.length)}
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

      {/* Modal de Foto Expandida */}
      <Dialog open={!!expandedPhoto} onOpenChange={() => setExpandedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Visualização de Fotos - {expandedPhoto?.type === 'before' ? 'Antes' : 'Depois'}
            </DialogTitle>
            <DialogDescription>
              Navegue pelas fotos usando as setas ou feche clicando fora da imagem
            </DialogDescription>
          </DialogHeader>
          {expandedPhoto && (
            <div className="relative">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={expandedPhoto.photos[expandedPhoto.currentIndex]} 
                  alt={`${expandedPhoto.type === 'before' ? 'Antes' : 'Depois'} ${expandedPhoto.currentIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Navegação */}
              {expandedPhoto.photos.length > 1 && (
                <>
                  <button
                    onClick={handleExpandedPrevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                    style={{ color: '#6400A4' }}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={handleExpandedNextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                    style={{ color: '#6400A4' }}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Indicador de posição */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-2 rounded-full text-sm">
                {expandedPhoto.currentIndex + 1} / {expandedPhoto.photos.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}