import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, MapPin, CheckCircle, AlertCircle, Camera, Play, StopCircle, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { getMySchedule, updateServiceStatus } from '../../lib/api'; // IMPORTA A NOVA FUNÇÃO
import { toast } from 'sonner';

// A interface agora reflete a resposta formatada do nosso backend
interface ScheduledService {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled'; // Status completo do backend
  notes?: string;
  serviceRequest: {
    client: {
      name: string;
    };
    serviceType: string;
    description: string;
    location: string;
  };
}

interface CollaboratorScheduledScreenProps {
  onBack?: () => void;
}

export default function CollaboratorScheduledScreen({ onBack }: CollaboratorScheduledScreenProps) {
  const [services, setServices] = useState<ScheduledService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // Estado para feedback no botão
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Função para buscar os dados
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await getMySchedule();
      setServices(data);
    } catch (error: any) { // <<< CORREÇÃO AQUI
      toast.error('Falha ao buscar agenda', { 
        description: error.response?.data?.message || 'Não foi possível carregar os serviços agendados.' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // ========================================================
  // NOVA FUNÇÃO: Lógica para atualizar o status do serviço
  // ========================================================
  const handleUpdateStatus = async (serviceId: string, newStatus: 'in_progress' | 'completed') => {
    setIsUpdating(true);
    const originalServices = [...services];

    // Otimismo na UI: atualiza o estado localmente primeiro
    setServices(currentServices => 
        currentServices.map(s => s.id === serviceId ? { ...s, status: newStatus } : s)
    );

    try {
        const updatedService = await updateServiceStatus(serviceId, { newStatus });
        // Sincroniza o estado com a resposta final do servidor
        setServices(currentServices => 
            currentServices.map(s => s.id === updatedService.id ? updatedService : s)
        );
        toast.success('Status atualizado com sucesso!');
    } catch (error: any) { // <<< CORREÇÃO AQUI
        // Reverte em caso de erro
        setServices(originalServices);
        toast.error('Falha ao atualizar status', { 
            description: error.response?.data?.message || 'Não foi possível conectar ao servidor.'
        });
    } finally {
        setIsUpdating(false);
    }
  };

  // Mapeia os status do backend para o que o frontend espera
  const getStatusConfig = (status: ScheduledService['status']) => {
    const configs = {
      'scheduled': { label: 'Agendado', color: '#35BAE6', bg: 'rgba(53, 186, 230, 0.1)', icon: Calendar },
      'in_progress': { label: 'Em Andamento', color: '#FFA500', bg: 'rgba(255, 165, 0, 0.1)', icon: AlertCircle },
      'completed': { label: 'Concluído', color: '#16a34a', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle },
      'cancelled': { label: 'Cancelado', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: X },
      'rescheduled': { label: 'Reagendado', color: '#8B20EE', bg: 'rgba(139, 32, 238, 0.1)', icon: AlertTriangle }
    };
    return configs[status] || configs.scheduled;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString + 'T00:00:00'); // Evita problemas de fuso horário
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit', 
      month: 'long'
    });
  };

  const formatTime = (timeString: string) => {
      if (!timeString) return '--:--';
      return timeString.substring(0, 5); // Pega apenas HH:mm
  }

  // Filtros e ordenação
  const filteredServices = services.filter(service => {
    if (statusFilter === 'all') return true;
    // O filtro agora usa o status real do backend
    if (statusFilter === 'scheduled') return service.status === 'scheduled';
    if (statusFilter === 'in_progress') return service.status === 'in_progress';
    if (statusFilter === 'completed') return service.status === 'completed';
    return false;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    const dateA = new Date(`${a.scheduledDate}T${a.scheduledTime || '00:00:00'}`);
    const dateB = new Date(`${b.scheduledDate}T${b.scheduledTime || '00:00:00'}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Estatísticas
  const stats = {
    total: services.length,
    upcoming: services.filter(s => s.status === 'scheduled').length,
    inProgress: services.filter(s => s.status === 'in_progress').length,
    completed: services.filter(s => s.status === 'completed').length
  };

  if (loading) {
    return <div>Carregando sua agenda...</div>; // TODO: Usar um Skeleton Loader
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-full">
      <ScreenHeader 
        title="Minha Agenda de Serviços"
        description="Acompanhe e gerencie os serviços agendados para você."
        onBack={onBack}
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-l-4 border-purple-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent></Card>
        <Card className="border-l-4 border-blue-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Agendados</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.upcoming}</div></CardContent></Card>
        <Card className="border-l-4 border-orange-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Em Andamento</CardTitle><AlertCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.inProgress}</div></CardContent></Card>
        <Card className="border-l-4 border-green-500"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Concluídos</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.completed}</div></CardContent></Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6"><CardContent className="p-4"><Tabs value={statusFilter} onValueChange={setStatusFilter}><TabsList><TabsTrigger value="all">Todos</TabsTrigger><TabsTrigger value="scheduled">Agendados</TabsTrigger><TabsTrigger value="in_progress">Em Andamento</TabsTrigger><TabsTrigger value="completed">Concluídos</TabsTrigger></TabsList></Tabs></CardContent></Card>

      {/* Lista de Serviços */}
      <div className="space-y-4">
        {sortedServices.length === 0 ? (
          <Card className="p-12 text-center"><Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">Nenhum serviço encontrado.</p></Card>
        ) : (
          sortedServices.map((service) => {
            const statusConfig = getStatusConfig(service.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300 bg-white overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-gray-800">{service.serviceRequest.serviceType}</h3>
                            <Badge style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.color}` }}>
                              <StatusIcon className="h-3 w-3 mr-1.5" />
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">Cliente: {service.serviceRequest.client.name}</p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{service.serviceRequest.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 border">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 mt-0.5 text-purple-600" />
                        <div>
                          <p className="text-xs text-gray-500">Data e Horário</p>
                          <p className="font-semibold text-gray-700">{formatDate(service.scheduledDate)} às {formatTime(service.scheduledTime)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 mt-0.5 text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Local</p>
                          <p className="text-sm font-semibold text-gray-700">{service.serviceRequest.location}</p>
                        </div>
                      </div>
                    </div>

                    {service.notes && (
                      <div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-xs text-purple-800 font-semibold mb-1">Observações do Gestor</p>
                        <p className="text-sm text-gray-700">{service.notes}</p>
                      </div>
                    )}
                  </CardContent>

                  {/* ========================================================
                  //      NOVA SEÇÃO: BOTÕES DE AÇÃO DO COLABORADOR
                  // ======================================================== */}
                  <CardFooter className="bg-gray-50/50 px-5 py-3 flex justify-end gap-3">
                    {service.status === 'scheduled' && (
                      <Button 
                        onClick={() => handleUpdateStatus(service.id, 'in_progress')}
                        disabled={isUpdating}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Iniciar Serviço
                      </Button>
                    )}
                    {service.status === 'in_progress' && (
                      <Button 
                        onClick={() => handleUpdateStatus(service.id, 'completed')}
                        disabled={isUpdating}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Concluir Serviço
                      </Button>
                    )}
                     <Button variant="outline"><Camera className="h-4 w-4 mr-2" /> Anexar Foto</Button>
                  </CardFooter>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}