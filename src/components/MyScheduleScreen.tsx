import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import React from 'react';


interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  client: string;
  clientPhone: string;
  service: string;
  location: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}

const mockSchedule: ScheduleItem[] = [
  {
    id: '1',
    date: '30/09/2025',
    time: '09:00',
    client: 'Maria Silva',
    clientPhone: '(11) 98765-4321',
    service: 'Limpeza Residencial Completa',
    location: 'Rua das Flores, 123 - Jardim América, São Paulo - SP',
    status: 'scheduled',
    notes: 'Cliente preferencial - Atenção especial aos vidros'
  },
  {
    id: '2',
    date: '30/09/2025',
    time: '14:00',
    client: 'João Santos',
    clientPhone: '(11) 97654-3210',
    service: 'Manutenção de Jardim',
    location: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    status: 'scheduled'
  },
  {
    id: '3',
    date: '01/10/2025',
    time: '10:00',
    client: 'Ana Paula Costa',
    clientPhone: '(11) 96543-2109',
    service: 'Lavagem de Estofados',
    location: 'Rua Augusta, 500 - Consolação, São Paulo - SP',
    status: 'scheduled',
    notes: 'Portaria - Retirar chave com zelador'
  },
  {
    id: '4',
    date: '29/09/2025',
    time: '08:00',
    client: 'Roberto Ferreira',
    clientPhone: '(11) 95432-1098',
    service: 'Limpeza Pós-Obra',
    location: 'Rua Oscar Freire, 200 - Jardim Paulista, São Paulo - SP',
    status: 'completed'
  },
  {
    id: '5',
    date: '28/09/2025',
    time: '15:00',
    client: 'Patricia Lima',
    clientPhone: '(11) 94321-0987',
    service: 'Higienização de Carpetes',
    location: 'Av. Brigadeiro Faria Lima, 1500 - Itaim Bibi, São Paulo - SP',
    status: 'completed'
  },
  {
    id: '6',
    date: '01/10/2025',
    time: '16:00',
    client: 'Carlos Mendes',
    clientPhone: '(11) 93210-9876',
    service: 'Limpeza Comercial',
    location: 'Av. Rebouças, 3000 - Pinheiros, São Paulo - SP',
    status: 'scheduled'
  }
];

export default function MyScheduleScreen() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(mockSchedule);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Statistics
  const todayScheduled = schedule.filter(s => s.date === '30/09/2025' && s.status === 'scheduled').length;
  const weekScheduled = schedule.filter(s => s.status === 'scheduled').length;
  const completed = schedule.filter(s => s.status === 'completed').length;
  const cancelled = schedule.filter(s => s.status === 'cancelled').length;

  // Filtered schedule
  const filteredSchedule = schedule.filter(item => {
    const matchesSearch = 
      item.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group by date
  const groupedSchedule = filteredSchedule.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'scheduled': { label: 'Agendado', bgColor: 'bg-blue-100', textColor: 'text-blue-800', icon: CalendarIcon },
      'in-progress': { label: 'Em Andamento', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', icon: Clock },
      'completed': { label: 'Concluído', bgColor: 'bg-green-100', textColor: 'text-green-800', icon: CheckCircle },
      'cancelled': { label: 'Cancelado', bgColor: 'bg-red-100', textColor: 'text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    return (
      <Badge className={`${config.bgColor} ${config.textColor} border-none flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const handleViewDetails = (item: ScheduleItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDayOfWeek = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                <CalendarIcon className="h-6 w-6" style={{ color: '#6400A4' }} />
              </div>
              <div>
                <h1 className="hive-screen-title">Minha Agenda</h1>
                <p className="text-sm text-gray-600">
                  Visualize e gerencie seus agendamentos de serviços
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hoje</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{todayScheduled}</p>
                </div>
                <CalendarIcon className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Esta Semana</p>
                  <p className="text-2xl" style={{ color: '#6400A4' }}>{weekScheduled}</p>
                </div>
                <Clock className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concluídos</p>
                  <p className="text-2xl text-green-600">{completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelados</p>
                  <p className="text-2xl text-red-600">{cancelled}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, serviço ou local..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="scheduled">Agendados</TabsTrigger>
                <TabsTrigger value="completed">Concluídos</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="max-w-7xl mx-auto p-6">
        {Object.keys(groupedSchedule).length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhum agendamento encontrado</p>
                <p className="text-sm mt-2">Tente ajustar os filtros de busca</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSchedule)
              .sort(([dateA], [dateB]) => {
                const [dayA, monthA, yearA] = dateA.split('/').map(Number);
                const [dayB, monthB, yearB] = dateB.split('/').map(Number);
                return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime();
              })
              .map(([date, items]) => (
                <div key={date}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                      <CalendarIcon className="h-5 w-5" style={{ color: '#6400A4' }} />
                      <p style={{ color: '#6400A4' }}>
                        <span className="font-medium">{getDayOfWeek(date)}</span> - {date}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <div className="space-y-3">
                    {items
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((item) => (
                        <Card 
                          key={item.id} 
                          className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-gray-200"
                          onClick={() => handleViewDetails(item)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4 flex-1">
                                {/* Time */}
                                <div className="text-center min-w-[60px]">
                                  <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                                    <Clock className="h-5 w-5 mx-auto mb-1" style={{ color: '#35BAE6' }} />
                                    <p className="text-sm" style={{ color: '#35BAE6' }}>{item.time}</p>
                                  </div>
                                </div>

                                {/* Client Avatar */}
                                <Avatar className="h-12 w-12" style={{ backgroundColor: '#6400A4' }}>
                                  <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                                    {getInitials(item.client)}
                                  </AvatarFallback>
                                </Avatar>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h3 className="text-black">{item.client}</h3>
                                      <p className="text-sm text-gray-600">{item.clientPhone}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <p className="text-sm text-black">
                                      <strong>Serviço:</strong> {item.service}
                                    </p>
                                    <p className="text-sm text-gray-600 flex items-start">
                                      <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                      <span className="line-clamp-1">{item.location}</span>
                                    </p>
                                    {item.notes && (
                                      <p className="text-sm text-gray-500 flex items-start">
                                        <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" style={{ color: '#F59E0B' }} />
                                        <span className="line-clamp-1">{item.notes}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Status */}
                              <div className="ml-4">
                                {getStatusBadge(item.status)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16" style={{ backgroundColor: '#6400A4' }}>
                    <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                      {getInitials(selectedItem.client)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl" style={{ color: '#6400A4' }}>{selectedItem.client}</h3>
                    <p className="text-sm text-gray-600">{selectedItem.clientPhone}</p>
                  </div>
                </div>
                {getStatusBadge(selectedItem.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: '#8B20EE' }}>Data</Label>
                  <p className="text-black">{selectedItem.date}</p>
                </div>
                <div>
                  <Label style={{ color: '#8B20EE' }}>Horário</Label>
                  <p className="text-black">{selectedItem.time}</p>
                </div>
              </div>

              <div>
                <Label style={{ color: '#8B20EE' }}>Serviço</Label>
                <p className="text-black">{selectedItem.service}</p>
              </div>

              <div>
                <Label style={{ color: '#8B20EE' }}>Local</Label>
                <p className="text-black flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" style={{ color: '#6400A4' }} />
                  <span>{selectedItem.location}</span>
                </p>
              </div>

              {selectedItem.notes && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Label style={{ color: '#F59E0B' }}>Observações Importantes</Label>
                  <p className="text-black mt-1">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}