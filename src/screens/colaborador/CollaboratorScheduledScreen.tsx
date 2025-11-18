import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, FileText, MapPin, CheckCircle, AlertCircle, Camera, Eye, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { getMySchedule } from '../../lib/api'; // IMPORT API FUNCTION
import { toast } from 'sonner';


interface ScheduledService {
  id: string;
  serviceRequestId: string;
  serviceRequest: {
    client: {
      name: string;
    };
    serviceType: string;
    description: string;
    location: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  observations?: string;
  teamId?: string;
  // Photo documentation might be added later
}

interface CollaboratorScheduledScreenProps {
  onBack?: () => void;
}

export default function CollaboratorScheduledScreen({ onBack }: CollaboratorScheduledScreenProps) {
  const [services, setServices] = useState<ScheduledService[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const data = await getMySchedule();
        setServices(data);
      } catch (error) {
        toast.error('Falha ao buscar agenda', { description: 'Não foi possível carregar os serviços agendados.' });
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  const getStatusConfig = (status: string) => {
    const configs = {
      'upcoming': { label: 'Agendado', color: '#35BAE6', bg: 'rgba(53, 186, 230, 0.1)', icon: Calendar },
      'in-progress': { label: 'Em Andamento', color: '#8B20EE', bg: 'rgba(139, 32, 238, 0.1)', icon: AlertCircle },
      'completed': { label: 'Concluído', color: '#16a34a', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle }
    };
    return configs[status as keyof typeof configs] || configs.upcoming;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00'); // Ensure correct date parsing
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Filters and Sorting
  const filteredServices = services.filter(service => {
    if (statusFilter === 'all') return true;
    return service.status === statusFilter;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    const dateA = new Date(a.scheduledDate + 'T' + a.scheduledTime);
    const dateB = new Date(b.scheduledDate + 'T' + b.scheduledTime);
    return dateA.getTime() - dateB.getTime(); // Older first
  });

  // Statistics
  const stats = {
    total: services.length,
    upcoming: services.filter(s => s.status === 'upcoming').length,
    inProgress: services.filter(s => s.status === 'in-progress').length,
    completed: services.filter(s => s.status === 'completed').length
  };

  if (loading) {
    return <div>Carregando agenda...</div>; // Replace with a proper loader
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <ScreenHeader 
        title="Minha Agenda de Serviços"
        description="Acompanhe os serviços que foram agendados para sua equipe"
        onBack={onBack}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total */}
        <Card className="bg-white border-l-4 border-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Serviços</CardTitle>
            <Users className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-purple-600">{stats.total}</p></CardContent>
        </Card>
        {/* Agendados */}
        <Card className="bg-white border-l-4 border-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Agendados</CardTitle>
            <Calendar className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p></CardContent>
        </Card>
         {/* Em Andamento */}
         <Card className="bg-white border-l-4 border-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Em Andamento</CardTitle>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p></CardContent>
        </Card>
        {/* Concluídos */}
        <Card className="bg-white border-l-4 border-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Concluídos</CardTitle>
            <CheckCircle className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">{stats.completed}</p></CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-white">
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

      {/* Service List */}
      <div className="space-y-4">
        {sortedServices.length === 0 ? (
          <Card className="p-12 text-center bg-white">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Nenhum serviço agendado encontrado para o filtro selecionado.</p>
          </Card>
        ) : (
          sortedServices.map((service) => {
            const statusConfig = getStatusConfig(service.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300 bg-white">
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
                          <p className="font-semibold text-gray-700">{formatDate(service.scheduledDate)} às {service.scheduledTime}</p>
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

                    {service.observations && (
                      <div className="mt-4 p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <p className="text-xs text-purple-800 font-semibold mb-1">Observações do Gestor</p>
                        <p className="text-sm text-gray-700">{service.observations}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

