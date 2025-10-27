import { 
  CheckCircle, Clock, User, MapPin, Star, Calendar, Bot, DollarSign, StickyNote, FileText, 
  ArrowRight, Camera, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useState, useEffect } from 'react';
import AIAssistant from '../../components/AIAssistant';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { toast } from 'sonner';
import api from '../../lib/api';

// =============================
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

// =============================
// Componente Principal
// =============================
export default function ClientDashboard({ onSectionChange }: ClientDashboardProps) {
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [expandedPhoto, setExpandedPhoto] = useState<{ photos: string[], currentIndex: number, type: 'before' | 'after' } | null>(null);
  const [photoCarousels, setPhotoCarousels] = useState<{ [key: string]: { currentIndex: number, currentType: 'before' | 'after' } }>({});
  const [openPhotoViewer, setOpenPhotoViewer] = useState<string | null>(null);

  // Estados do backend
  const [currentService, setCurrentService] = useState<CurrentService | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // =============================
  // Buscar dados do backend
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/clientes/history');
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          setServiceHistory(data);
        } else {
          // fallback se o backend estiver vazio
          setServiceHistory([
            {
              id: "OS-2024-078",
              service: "Limpeza Geral",
              date: "20/09/2024",
              team: "Equipe Beta",
              status: "completed",
              rating: 5,
              duration: "6h",
              photoDocumentation: {
                beforePhotos: ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800"],
                afterPhotos: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
                uploadDate: "20/09/2024 17:30",
                uploadedBy: "Carlos Silva"
              }
            }
          ]);
        }

        // Serviço atual (mantém fixo para apresentação)
        setCurrentService({
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
        });
      } catch (error) {
        console.error("Erro ao buscar serviços do backend:", error);
        toast.error("Erro ao carregar dados do servidor");

        // fallback estático
        setServiceHistory([
          {
            id: "OS-2024-052",
            service: "Limpeza Geral + Enceramento",
            date: "10/09/2024",
            team: "Equipe Gamma",
            status: "completed",
            rating: 5,
            duration: "8h",
            photoDocumentation: {
              beforePhotos: ["https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800"],
              afterPhotos: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
              uploadDate: "10/09/2024 18:15",
              uploadedBy: "Roberto Mendes"
            }
          }
        ]);

        setCurrentService({
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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // =============================
  // Funções auxiliares
  // =============================
  const renderStars = (rating: number) => (
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ))
  );

  if (loading || !currentService) {
    return <div className="p-6 text-center text-gray-500">Carregando dados...</div>;
  }

  // =============================
  // Renderização principal
  // =============================
  return (
    <div className="p-6 overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="hive-screen-title">Dashboard de Serviços</h1>
          <p className="text-black">Status atual e histórico de serviços.</p>
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
            <Badge className="border-none" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' }}>
              Em Andamento
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-black mb-3">{currentService.title}</h3>
          <p className="text-gray-600">Equipe: {currentService.team} — Líder: {currentService.leader}</p>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-black flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
            Histórico de Serviços
          </CardTitle>
          <Button
            className="mt-3 sm:mt-0"
            style={{ backgroundColor: '#6400A4', color: 'white' }}
            onClick={async () => {
              try {
                const novoServico = {
                  service: "Limpeza de Teste",
                  date: new Date().toLocaleDateString("pt-BR"),
                  team: "Equipe Nova",
                  status: "pendente",
                  rating: 0,
                  duration: "0h"
                };
                await api.post("/api/clientes/history", novoServico);
                toast.success("Serviço criado com sucesso!");
              } catch (err) {
                console.error(err);
                toast.error("Erro ao criar serviço!");
              }
            }}
          >
            Criar novo serviço
          </Button>
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
                      {service.status === 'completed' ? 'Concluído' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: '#8B20EE' }} />
                    <span>{service.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" style={{ color: '#8B20EE' }} />
                    <span>{service.team}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
                    <span>{service.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de IA */}
      <AIAssistant isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} userType="cliente" />
    </div>
  );
}
