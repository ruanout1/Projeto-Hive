import { useState } from 'react';
import ScreenHeader from './ScreenHeader';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle, 
  ChevronLeft,
  ChevronRight,
  Users,
  Briefcase
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';

interface ScheduleItem {
  id: string;
  date: string; // DD/MM/YYYY
  time: string;
  endTime?: string;
  title: string;
  type: 'service' | 'meeting';
  client?: string;
  clientPhone?: string;
  service?: string;
  location: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  organizer?: string; // Nome do gestor que agendou a reunião
}

const mockSchedule: ScheduleItem[] = [
  // Serviços
  {
    id: '1',
    date: '23/10/2025',
    time: '09:00',
    endTime: '12:00',
    title: 'Limpeza Residencial Completa',
    type: 'service',
    client: 'Maria Silva',
    clientPhone: '(11) 98765-4321',
    service: 'Limpeza Residencial Completa',
    location: 'Rua das Flores, 123 - Jardim América',
    status: 'scheduled',
    notes: 'Cliente preferencial - Atenção especial aos vidros'
  },
  {
    id: '2',
    date: '23/10/2025',
    time: '14:00',
    endTime: '17:00',
    title: 'Manutenção de Jardim',
    type: 'service',
    client: 'João Santos',
    clientPhone: '(11) 97654-3210',
    service: 'Manutenção de Jardim',
    location: 'Av. Paulista, 1000 - Bela Vista',
    status: 'scheduled'
  },
  // Reuniões
  {
    id: '3',
    date: '23/10/2025',
    time: '08:00',
    endTime: '08:30',
    title: 'Reunião de Briefing - Serviços do Dia',
    type: 'meeting',
    location: 'Escritório Central - Sala 2',
    status: 'scheduled',
    organizer: 'Ana Paula Rodrigues',
    notes: 'Discussão sobre os serviços agendados para hoje'
  },
  {
    id: '4',
    date: '24/10/2025',
    time: '10:00',
    endTime: '13:00',
    title: 'Lavagem de Estofados',
    type: 'service',
    client: 'Ana Paula Costa',
    clientPhone: '(11) 96543-2109',
    service: 'Lavagem de Estofados',
    location: 'Rua Augusta, 500 - Consolação',
    status: 'scheduled',
    notes: 'Portaria - Retirar chave com zelador'
  },
  {
    id: '5',
    date: '24/10/2025',
    time: '15:00',
    endTime: '16:00',
    title: 'Reunião de Feedback Mensal',
    type: 'meeting',
    location: 'Escritório Central - Sala 1',
    status: 'scheduled',
    organizer: 'Fernanda Lima',
    notes: 'Avaliação de desempenho e metas'
  },
  {
    id: '6',
    date: '22/10/2025',
    time: '08:00',
    endTime: '11:00',
    title: 'Limpeza Pós-Obra',
    type: 'service',
    client: 'Roberto Ferreira',
    clientPhone: '(11) 95432-1098',
    service: 'Limpeza Pós-Obra',
    location: 'Rua Oscar Freire, 200 - Jardim Paulista',
    status: 'completed'
  },
  {
    id: '7',
    date: '25/10/2025',
    time: '09:00',
    endTime: '09:30',
    title: 'Alinhamento de Equipe',
    type: 'meeting',
    location: 'Escritório Central - Sala 3',
    status: 'scheduled',
    organizer: 'Ana Paula Rodrigues',
    notes: 'Planejamento semanal de atividades'
  },
  {
    id: '8',
    date: '25/10/2025',
    time: '14:00',
    endTime: '17:00',
    title: 'Limpeza Comercial',
    type: 'service',
    client: 'Empresa ABC Ltda',
    clientPhone: '(11) 93210-9876',
    service: 'Limpeza Comercial',
    location: 'Av. Rebouças, 3000 - Pinheiros',
    status: 'scheduled'
  }
];

interface MyScheduleScreenProps {
  onBack?: () => void;
}

export default function MyScheduleScreen({ onBack }: MyScheduleScreenProps) {
  const [schedule] = useState<ScheduleItem[]>(mockSchedule);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  // Funções auxiliares
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const getItemsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return schedule.filter(item => item.date === dateStr);
  };

  const previousMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1));
  };

  const getMonthName = (month: number) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[month];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge style={{ backgroundColor: '#35BAE6', color: 'white' }}>
            Agendado
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge style={{ backgroundColor: '#FFFF20', color: '#6400A4' }}>
            Em Andamento
          </Badge>
        );
      case 'completed':
        return (
          <Badge style={{ backgroundColor: '#10B981', color: 'white' }}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge style={{ backgroundColor: '#EF4444', color: 'white' }}>
            Cancelado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedDate);
  const today = new Date();
  const todayStr = formatDate(today);

  // Estatísticas
  const upcomingServices = schedule.filter(item => {
    const itemDate = parseDate(item.date);
    return item.type === 'service' && item.status === 'scheduled' && itemDate >= today;
  }).length;

  const upcomingMeetings = schedule.filter(item => {
    const itemDate = parseDate(item.date);
    return item.type === 'meeting' && item.status === 'scheduled' && itemDate >= today;
  }).length;

  const completedToday = schedule.filter(item => {
    return item.date === todayStr && item.status === 'completed';
  }).length;

  // Função para obter a cor do tipo de evento
  const getTypeColor = (type: 'service' | 'meeting', status?: string) => {
    if (status === 'completed') {
      return { bg: '#22c55e', light: 'rgba(34, 197, 94, 0.1)', border: '#22c55e' };
    }
    if (type === 'service') {
      return { bg: '#35BAE6', light: 'rgba(53, 186, 230, 0.1)', border: '#35BAE6' };
    }
    return { bg: '#6400A4', light: 'rgba(100, 0, 164, 0.1)', border: '#6400A4' };
  };

  // Função para obter eventos de uma semana específica
  const getWeekDays = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  };

  const getDayName = (dayIndex: number) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[dayIndex];
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <ScreenHeader 
            title="Minha Agenda"
            description="Visualize suas atividades agendadas e reuniões"
            onBack={() => onBack?.()}
          />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6 pb-6" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)', borderLeft: '4px solid #35BAE6' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#0369a1' }}>Serviços Agendados</p>
                    <p className="text-2xl" style={{ color: '#35BAE6' }}>{upcomingServices}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.2)' }}>
                    <Briefcase className="h-6 w-6" style={{ color: '#35BAE6' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 pb-6" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)', borderLeft: '4px solid #8B20EE' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#6b21a8' }}>Reuniões Agendadas</p>
                    <p className="text-2xl" style={{ color: '#8B20EE' }}>{upcomingMeetings}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 32, 238, 0.2)' }}>
                    <Users className="h-6 w-6" style={{ color: '#8B20EE' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 pb-6" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: '#15803d' }}>Concluídos Hoje</p>
                    <p className="text-2xl" style={{ color: '#22c55e' }}>{completedToday}</p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                    <CheckCircle className="h-6 w-6" style={{ color: '#22c55e' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              {/* Header do Calendário */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-black">
                    {viewMode === 'daily' && 'Visualização Diária'}
                    {viewMode === 'weekly' && 'Visualização Semanal'}
                  </h2>
                </div>

                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <Button
                    size="sm"
                    variant={viewMode === 'daily' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('daily')}
                    className="h-8 px-3 text-xs"
                    style={viewMode === 'daily' ? { backgroundColor: '#6400A4', color: 'white' } : {}}
                  >
                    Dia
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'weekly' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('weekly')}
                    className="h-8 px-3 text-xs"
                    style={viewMode === 'weekly' ? { backgroundColor: '#6400A4', color: 'white' } : {}}
                  >
                    Semana
                  </Button>
                </div>
              </div>

              {/* Visualização Diária */}
              {viewMode === 'daily' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2" style={{ borderColor: '#6400A4' }}>
                    <h3 className="text-lg" style={{ color: '#6400A4' }}>
                      {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                    </h3>
                    <p className="text-2xl">
                      {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {getItemsForDate(selectedDate).length} {getItemsForDate(selectedDate).length === 1 ? 'atividade agendada' : 'atividades agendadas'}
                    </p>
                  </div>

                  {getItemsForDate(selectedDate).length === 0 ? (
                    <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Nenhuma atividade agendada para este dia</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getItemsForDate(selectedDate)
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((item) => {
                          const colors = getTypeColor(item.type, item.status);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedItem(item);
                                setIsDetailOpen(true);
                              }}
                              className="border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                              style={{
                                borderColor: colors.border,
                                backgroundColor: colors.light
                              }}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Badge
                                      className="border-none text-xs"
                                      style={{ backgroundColor: colors.bg, color: 'white' }}
                                    >
                                      {item.type === 'service' ? (item.status === 'completed' ? 'Serviço Concluído' : 'Serviço Agendado') : 'Reunião'}
                                    </Badge>
                                    {getStatusBadge(item.status)}
                                  </div>
                                  <h4 className="text-black">{item.title}</h4>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
                                  <span>{item.time}{item.endTime && ` - ${item.endTime}`}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" style={{ color: '#8B20EE' }} />
                                  <span>{item.location}</span>
                                </div>
                              </div>

                              {item.type === 'service' && item.client && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-600">Cliente: <span className="text-black">{item.client}</span></p>
                                </div>
                              )}

                              {item.type === 'meeting' && item.organizer && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-600">Organizado por: <span className="text-black">{item.organizer}</span></p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* Visualização Semanal */}
              {viewMode === 'weekly' && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
                    <h3 className="text-lg" style={{ color: '#6400A4' }}>
                      Semana de {getWeekDays()[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} a {getWeekDays()[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </h3>
                  </div>

                  {getWeekDays().map((date, index) => {
                    const dayItems = getItemsForDate(date);
                    const isToday = formatDate(date) === todayStr;
                    
                    return (
                      <div
                        key={index}
                        className="border-2 rounded-lg p-4 bg-gray-50"
                        style={{ borderColor: isToday ? '#6400A4' : '#e5e7eb' }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-black">{getDayName(date.getDay())} - {date.getDate()}/{date.getMonth() + 1}</h4>
                            {isToday && (
                              <Badge className="mt-1" style={{ backgroundColor: '#6400A4', color: 'white' }}>
                                Hoje
                              </Badge>
                            )}
                          </div>
                          <Badge className="text-xs bg-gray-200 text-gray-700 border-none">
                            {dayItems.length} {dayItems.length === 1 ? 'atividade' : 'atividades'}
                          </Badge>
                        </div>

                        {dayItems.length === 0 ? (
                          <p className="text-xs text-gray-500 text-center py-2">Sem atividades agendadas</p>
                        ) : (
                          <div className="space-y-2">
                            {dayItems
                              .sort((a, b) => a.time.localeCompare(b.time))
                              .map((item) => {
                                const colors = getTypeColor(item.type, item.status);
                                return (
                                  <div
                                    key={item.id}
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsDetailOpen(true);
                                    }}
                                    className="p-3 rounded border-l-4 cursor-pointer hover:shadow-md transition-all"
                                    style={{
                                      borderLeftColor: colors.border,
                                      backgroundColor: colors.light
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm text-black">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.time}{item.endTime && ` - ${item.endTime}`}</p>
                                      </div>
                                      <Badge
                                        className="text-xs border-none ml-2"
                                        style={{ backgroundColor: colors.bg, color: 'white' }}
                                      >
                                        {item.type === 'service' ? (item.status === 'completed' ? 'Concluído' : 'Serviço') : 'Reunião'}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legenda */}
              <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#35BAE6' }}></div>
                  <span className="text-sm text-gray-600">Serviço Agendado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#6400A4' }}></div>
                  <span className="text-sm text-gray-600">Reunião</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }}></div>
                  <span className="text-sm text-gray-600">Concluído</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {selectedItem?.type === 'meeting' ? '📅 Reunião' : '💼 Serviço Agendado'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.date} às {selectedItem?.time}
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Título/Serviço */}
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {selectedItem.type === 'meeting' ? 'Reunião' : 'Serviço'}
                </p>
                <p className="text-black">{selectedItem.title}</p>
              </div>

              {/* Status */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                {getStatusBadge(selectedItem.status)}
              </div>

              {/* Horário */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Horário</p>
                <div className="flex items-center space-x-2 text-gray-700">
                  <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
                  <span>
                    {selectedItem.time}{selectedItem.endTime && ` - ${selectedItem.endTime}`}
                  </span>
                </div>
              </div>

              {/* Localização */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Localização</p>
                <div className="flex items-center space-x-2 text-gray-700">
                  <MapPin className="h-4 w-4" style={{ color: '#8B20EE' }} />
                  <span>{selectedItem.location}</span>
                </div>
              </div>

              {/* Cliente (para serviços) */}
              {selectedItem.type === 'service' && selectedItem.client && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Cliente</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10" style={{ backgroundColor: '#6400A4' }}>
                      <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                        {getInitials(selectedItem.client)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-black">{selectedItem.client}</p>
                      <p className="text-sm text-gray-600">{selectedItem.clientPhone}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Organizador (para reuniões) */}
              {selectedItem.type === 'meeting' && selectedItem.organizer && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Organizado por</p>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10" style={{ backgroundColor: '#8B20EE' }}>
                      <AvatarFallback style={{ backgroundColor: '#8B20EE', color: 'white' }}>
                        {getInitials(selectedItem.organizer)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-black">{selectedItem.organizer}</p>
                      <p className="text-sm text-gray-600">Gestor</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              {selectedItem.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Observações</p>
                  <div className="p-3 rounded-lg bg-gray-50 text-gray-700">
                    {selectedItem.notes}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
