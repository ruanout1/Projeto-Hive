import { useState } from 'react';
import ScreenHeader from './ScreenHeader';
import { Calendar, Clock, Plus, Edit2, Trash2, CalendarDays, AlertCircle, Bell, BellOff, ChevronLeft, ChevronRight, Eye, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';

type ReminderType = 'one_day_before' | 'two_hours_before' | 'none';
type ViewMode = 'daily' | 'weekly' | 'monthly';

interface PersonalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  color?: string;
  reminder?: ReminderType;
}

interface MyPersonalScheduleScreenProps {
  userRole: 'admin' | 'manager';
  onBack?: () => void;
}

export default function MyPersonalScheduleScreen({ userRole, onBack }: MyPersonalScheduleScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 16)); // 16 de outubro de 2025
  
  const [events, setEvents] = useState<PersonalEvent[]>([
    // Outubro 16
    { id: 'EVT-001', title: 'Reunião com Fornecedores', description: 'Discutir novos contratos de fornecimento de materiais', date: '2025-10-16', time: '09:00', color: '#6400A4', reminder: 'two_hours_before' },
    { id: 'EVT-002', title: 'Revisão de Contratos', description: 'Análise de contratos pendentes', date: '2025-10-16', time: '14:00', color: '#8B20EE' },
    
    // Outubro 17
    { id: 'EVT-003', title: 'Planejamento Estratégico', description: 'Revisão de metas trimestrais e ajuste de estratégias', date: '2025-10-17', time: '10:30', color: '#35BAE6', reminder: 'one_day_before' },
    { id: 'EVT-004', title: 'Reunião de Diretoria', description: 'Apresentação de resultados', date: '2025-10-17', time: '15:00', color: '#6400A4' },
    
    // Outubro 18
    { id: 'EVT-005', title: 'Entrevistas RH', description: 'Seleção de novos colaboradores', date: '2025-10-18', time: '09:00', color: '#8B20EE' },
    { id: 'EVT-006', title: 'Auditoria Interna', description: 'Revisão de processos', date: '2025-10-18', time: '13:30', color: '#35BAE6' },
    
    // Outubro 19
    { id: 'EVT-007', title: 'Workshop de Liderança', description: 'Desenvolvimento de gestores', date: '2025-10-19', time: '08:00', color: '#6400A4' },
    
    // Outubro 20
    { id: 'EVT-008', title: 'Apresentação de Projetos', description: 'Review trimestral', date: '2025-10-20', time: '10:00', color: '#8B20EE', reminder: 'one_day_before' },
    { id: 'EVT-009', title: 'Almoço com Cliente', description: 'Cliente Premium - Proposta comercial', date: '2025-10-20', time: '12:30', color: '#35BAE6' },
    
    // Outubro 21
    { id: 'EVT-010', title: 'Reunião de Vendas', description: 'Análise de performance', date: '2025-10-21', time: '09:30', color: '#6400A4' },
    { id: 'EVT-011', title: 'Treinamento de Equipe', description: 'Capacitação sobre novos procedimentos de segurança', date: '2025-10-21', time: '14:00', color: '#8B20EE', reminder: 'two_hours_before' },
    
    // Outubro 22
    { id: 'EVT-012', title: 'Conferência Online', description: 'Tendências do mercado 2025', date: '2025-10-22', time: '11:00', color: '#35BAE6' },
    { id: 'EVT-013', title: 'Análise Financeira', description: 'Fechamento mensal', date: '2025-10-22', time: '16:00', color: '#6400A4' },
    
    // Outubro 23
    { id: 'EVT-014', title: 'Visita a Obras', description: 'Inspeção de projetos em andamento', date: '2025-10-23', time: '08:30', color: '#8B20EE' },
    { id: 'EVT-015', title: 'Reunião com Investidores', description: 'Apresentação de resultados', date: '2025-10-23', time: '15:30', color: '#35BAE6', reminder: 'one_day_before' },
    
    // Outubro 24
    { id: 'EVT-016', title: 'Comitê de Qualidade', description: 'Revisão de processos ISO', date: '2025-10-24', time: '10:00', color: '#6400A4' },
    { id: 'EVT-017', title: 'Evento de Networking', description: 'Câmara de Comércio', date: '2025-10-24', time: '18:00', color: '#8B20EE' },
    
    // Outubro 25
    { id: 'EVT-018', title: 'Reunião de Inovação', description: 'Brainstorming de novos produtos', date: '2025-10-25', time: '09:00', color: '#35BAE6' },
    
    // Outubro 26
    { id: 'EVT-019', title: 'Palestra Externa', description: 'Evento do setor na universidade', date: '2025-10-26', time: '14:00', color: '#6400A4' },
    
    // Outubro 27
    { id: 'EVT-020', title: 'Revisão Orçamentária', description: 'Planejamento 2026', date: '2025-10-27', time: '10:30', color: '#8B20EE', reminder: 'one_day_before' },
    { id: 'EVT-021', title: 'Reunião com TI', description: 'Atualização de sistemas', date: '2025-10-27', time: '16:00', color: '#35BAE6' },
    
    // Outubro 28
    { id: 'EVT-022', title: 'Avaliação de Desempenho', description: 'Feedback com gerentes', date: '2025-10-28', time: '09:00', color: '#6400A4' },
    { id: 'EVT-023', title: 'Negociação Comercial', description: 'Grande contrato em andamento', date: '2025-10-28', time: '14:30', color: '#8B20EE' },
    
    // Outubro 29
    { id: 'EVT-024', title: 'Consultoria Jurídica', description: 'Revisão de contratos trabalhistas', date: '2025-10-29', time: '11:00', color: '#35BAE6' },
    { id: 'EVT-025', title: 'Happy Hour Equipe', description: 'Integração mensal', date: '2025-10-29', time: '18:30', color: '#6400A4' },
    
    // Outubro 30
    { id: 'EVT-026', title: 'Reunião de Sustentabilidade', description: 'Iniciativas ambientais', date: '2025-10-30', time: '10:00', color: '#8B20EE' },
    { id: 'EVT-027', title: 'Webinar Internacional', description: 'Melhores práticas globais', date: '2025-10-30', time: '15:00', color: '#35BAE6' },
    
    // Outubro 31
    { id: 'EVT-028', title: 'Fechamento Mensal', description: 'Consolidação de resultados', date: '2025-10-31', time: '09:00', color: '#6400A4', reminder: 'two_hours_before' },
    { id: 'EVT-029', title: 'Planejamento Novembro', description: 'Definição de prioridades', date: '2025-10-31', time: '14:00', color: '#8B20EE' },
  ]);

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PersonalEvent | null>(null);
  const [selectedEventForReminder, setSelectedEventForReminder] = useState<PersonalEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Lista de colaboradores disponíveis
  const availableCollaborators = [
    { id: 'col-1', name: 'Carlos Silva', position: 'Faxineiro(a)', area: 'norte' },
    { id: 'col-2', name: 'Maria Silva', position: 'Serviços Gerais', area: 'sul' },
    { id: 'col-3', name: 'João Santos', position: 'Jardineiro', area: 'oeste' },
    { id: 'col-4', name: 'Ana Costa', position: 'Limpeza Especializada', area: 'leste' },
    { id: 'col-5', name: 'Pedro Oliveira', position: 'Manutenção', area: 'norte' },
    { id: 'col-6', name: 'Julia Mendes', position: 'Serviços Gerais', area: 'sul' },
    { id: 'col-7', name: 'Roberto Lima', position: 'Faxineiro(a)', area: 'centro' },
    { id: 'col-8', name: 'Fernanda Costa', position: 'Limpeza Comercial', area: 'leste' },
  ];

  // Estados para nova reunião
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    description: '',
    selectedCollaborators: [] as string[]
  });
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    color: '#6400A4'
  });
  const [originalEventForm, setOriginalEventForm] = useState(eventForm);
  const [reminderType, setReminderType] = useState<ReminderType>('none');

  const handleAddEvent = () => {
    setIsEditMode(false);
    setSelectedEvent(null);
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      color: '#6400A4'
    });
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: PersonalEvent) => {
    setIsEditMode(true);
    setSelectedEvent(event);
    const initialFormData = {
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      color: event.color || '#6400A4'
    };
    setEventForm(initialFormData);
    setOriginalEventForm(initialFormData);
    setIsEventDialogOpen(true);
    setIsDetailsDialogOpen(false);
  };

  const hasEventChanges = () => {
    if (!isEditMode) return true; // Se está criando, sempre habilita
    return JSON.stringify(eventForm) !== JSON.stringify(originalEventForm);
  };

  const handleViewEvent = (event: PersonalEvent) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isEditMode && selectedEvent) {
      setEvents(events.map(evt => 
        evt.id === selectedEvent.id 
          ? { ...evt, ...eventForm }
          : evt
      ));
      toast.success('Evento atualizado com sucesso!');
    } else {
      const newEvent: PersonalEvent = {
        id: `EVT-${String(events.length + 1).padStart(3, '0')}`,
        ...eventForm
      };
      setEvents([...events, newEvent]);
      toast.success('Evento criado com sucesso!');
    }

    setIsEventDialogOpen(false);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(evt => evt.id !== eventId));
    toast.success('Evento excluído com sucesso!');
    setIsDetailsDialogOpen(false);
  };

  const handleOpenReminderDialog = (event: PersonalEvent) => {
    setSelectedEventForReminder(event);
    setReminderType(event.reminder || 'none');
    setIsReminderDialogOpen(true);
    setIsDetailsDialogOpen(false);
  };

  const handleSaveReminder = () => {
    if (!selectedEventForReminder) return;

    setEvents(events.map(evt => 
      evt.id === selectedEventForReminder.id 
        ? { ...evt, reminder: reminderType }
        : evt
    ));

    if (reminderType !== 'none') {
      const reminderText = reminderType === 'one_day_before' 
        ? 'um dia antes do evento' 
        : '2 horas antes do evento';
      
      alert(
        `✅ Lembrete configurado!\n\n` +
        `Você receberá uma notificação ${reminderText} através:\n` +
        `• Notificações do sistema\n` +
        `• E-mail cadastrado\n\n` +
        `Evento: ${selectedEventForReminder.title}\n` +
        `Data: ${formatDate(selectedEventForReminder.date)}\n` +
        `Horário: ${selectedEventForReminder.time}`
      );
      toast.success('Lembrete adicionado com sucesso!');
    } else {
      toast.success('Lembrete removido');
    }

    setIsReminderDialogOpen(false);
  };

  const getReminderLabel = (reminder?: ReminderType) => {
    if (!reminder || reminder === 'none') return null;
    return reminder === 'one_day_before' ? '1 dia antes' : '2h antes';
  };

  const handleCreateMeeting = () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time || !meetingForm.location || meetingForm.selectedCollaborators.length === 0) {
      toast.error('Preencha todos os campos obrigatórios e selecione pelo menos um colaborador');
      return;
    }

    const selectedCollabs = availableCollaborators.filter(c => 
      meetingForm.selectedCollaborators.includes(c.id)
    );

    toast.success('Reunião criada com sucesso!', {
      description: `${selectedCollabs.length} colaborador(es) notificado(s). A reunião aparecerá na agenda de: ${selectedCollabs.map(c => c.name).join(', ')}`
    });

    // Adicionar o evento na agenda
    const newEvent: PersonalEvent = {
      id: `MTG-${Date.now()}`,
      title: meetingForm.title,
      description: `Local: ${meetingForm.location}${meetingForm.endTime ? `\nHorário: ${meetingForm.time} - ${meetingForm.endTime}` : ''}\nParticipantes: ${selectedCollabs.map(c => c.name).join(', ')}\n\n${meetingForm.description}`,
      date: meetingForm.date,
      time: meetingForm.time,
      color: '#8B20EE',
      reminder: 'two_hours_before'
    };

    setEvents(prev => [...prev, newEvent]);

    // Resetar formulário
    setMeetingForm({
      title: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      description: '',
      selectedCollaborators: []
    });

    setIsMeetingDialogOpen(false);
  };

  const toggleCollaborator = (collaboratorId: string) => {
    setMeetingForm(prev => ({
      ...prev,
      selectedCollaborators: prev.selectedCollaborators.includes(collaboratorId)
        ? prev.selectedCollaborators.filter(id => id !== collaboratorId)
        : [...prev.selectedCollaborators, collaboratorId]
    }));
  };

  const getAreaColor = (area: string) => {
    const colors = {
      norte: '#8B20EE',
      sul: '#35BAE6',
      leste: '#FFFF20',
      oeste: '#6400A4',
      centro: '#000000'
    };
    return colors[area as keyof typeof colors] || '#6400A4';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isEventToday = (dateString: string) => {
    const today = new Date(2025, 9, 16);
    const eventDate = new Date(dateString + 'T00:00:00');
    return today.toDateString() === eventDate.toDateString();
  };

  const isEventUpcoming = (dateString: string) => {
    const today = new Date(2025, 9, 16);
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateString + 'T00:00:00');
    return eventDate >= today;
  };

  // Navegação de período
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date(2025, 9, 16));
  };

  // Obter eventos por data
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateString);
  };

  // Estatísticas
  const stats = {
    total: events.length,
    upcoming: events.filter(e => isEventUpcoming(e.date)).length,
    today: events.filter(e => isEventToday(e.date)).length,
    withReminder: events.filter(e => e.reminder && e.reminder !== 'none').length
  };

  // Renderizar visualização diária
  const renderDailyView = () => {
    const eventsForDay = getEventsForDate(currentDate);
    
    return (
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2" style={{ borderColor: '#6400A4' }}>
          <h3 className="text-lg mb-1" style={{ color: '#6400A4' }}>
            {currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
          </h3>
          <p className="text-2xl">
            {currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {eventsForDay.length} {eventsForDay.length === 1 ? 'evento agendado' : 'eventos agendados'}
          </p>
        </div>

        {eventsForDay.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4" style={{ color: '#8B20EE', opacity: 0.3 }} />
            <p className="text-gray-500">Nenhum evento agendado para este dia</p>
            <Button 
              onClick={handleAddEvent}
              className="mt-4"
              style={{ backgroundColor: '#6400A4', color: 'white' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Evento
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {eventsForDay
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((event) => renderEventCard(event))}
          </div>
        )}
      </div>
    );
  };

  // Renderizar visualização semanal
  const renderWeeklyView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
          <h3 className="text-lg" style={{ color: '#6400A4' }}>
            Semana de {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} a {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((date, index) => {
            const eventsForDay = getEventsForDate(date);
            const isToday = date.toDateString() === new Date(2025, 9, 16).toDateString();
            
            return (
              <div key={index} className="space-y-2">
                <div 
                  className="rounded-lg p-3 text-center border-2"
                  style={{ 
                    borderColor: isToday ? '#6400A4' : '#e5e7eb',
                    backgroundColor: isToday ? 'rgba(100, 0, 164, 0.05)' : 'white'
                  }}
                >
                  <p className="text-xs text-gray-600">
                    {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </p>
                  <p className="text-xl" style={{ color: isToday ? '#6400A4' : 'inherit' }}>
                    {date.getDate()}
                  </p>
                  <p className="text-xs" style={{ color: '#8B20EE' }}>
                    {eventsForDay.length} eventos
                  </p>
                </div>
                
                <div className="space-y-1">
                  {eventsForDay.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-shadow"
                      style={{ 
                        backgroundColor: `${event.color}15`,
                        borderLeft: `3px solid ${event.color}`
                      }}
                      onClick={() => handleViewEvent(event)}
                    >
                      <p className="truncate">{event.time}</p>
                      <p className="truncate font-semibold">{event.title}</p>
                    </div>
                  ))}
                  {eventsForDay.length > 3 && (
                    <p className="text-xs text-center text-gray-500 py-1">
                      +{eventsForDay.length - 3} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar visualização mensal
  const renderMonthlyView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const weeks = [];
    let currentWeek = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      currentWeek.push(new Date(date));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
          <h3 className="text-2xl" style={{ color: '#6400A4' }}>
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="p-3 text-center text-sm text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Grade do calendário */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
              {week.map((date, dayIndex) => {
                const eventsForDay = getEventsForDate(date);
                const isCurrentMonth = date.getMonth() === month;
                const isToday = date.toDateString() === new Date(2025, 9, 16).toDateString();
                
                return (
                  <div
                    key={dayIndex}
                    className="min-h-[120px] p-2 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors"
                    style={{ 
                      backgroundColor: isToday ? 'rgba(100, 0, 164, 0.05)' : isCurrentMonth ? 'white' : '#f9fafb'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span 
                        className="text-sm"
                        style={{ 
                          color: isToday ? '#6400A4' : isCurrentMonth ? 'black' : '#9ca3af',
                          fontWeight: isToday ? 700 : 400
                        }}
                      >
                        {date.getDate()}
                      </span>
                      {eventsForDay.length > 0 && (
                        <Badge 
                          className="text-xs"
                          style={{ 
                            backgroundColor: '#8B20EE',
                            color: 'white'
                          }}
                        >
                          {eventsForDay.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {eventsForDay.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ 
                            backgroundColor: `${event.color}15`,
                            borderLeft: `2px solid ${event.color}`
                          }}
                          onClick={() => handleViewEvent(event)}
                        >
                          <p className="truncate font-semibold">{event.time}</p>
                          <p className="truncate">{event.title}</p>
                        </div>
                      ))}
                      {eventsForDay.length > 2 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{eventsForDay.length - 2}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar card de evento
  const renderEventCard = (event: PersonalEvent) => {
    return (
      <Card 
        key={event.id}
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleViewEvent(event)}
        style={isEventToday(event.date) ? { borderLeft: '4px solid #FFFF20' } : {}}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <h3 className="font-semibold">{event.title}</h3>
                {isEventToday(event.date) && (
                  <Badge style={{ backgroundColor: '#FFFF20', color: '#000' }}>
                    Hoje
                  </Badge>
                )}
                {event.reminder && event.reminder !== 'none' && (
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1"
                    style={{ borderColor: '#6400A4', color: '#6400A4' }}
                  >
                    <Bell className="h-3 w-3" />
                    {getReminderLabel(event.reminder)}
                  </Badge>
                )}
              </div>
              
              {event.description && (
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" style={{ color: '#8B20EE' }} />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleViewEvent(event);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <ScreenHeader 
            title="Minha Agenda"
            description="Gerencie seus eventos e compromissos pessoais"
            onBack={() => onBack?.()}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleAddEvent}
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </Button>
          <Button 
            onClick={() => setIsMeetingDialogOpen(true)}
            style={{ backgroundColor: '#8B20EE', color: 'white' }}
            className="hover:opacity-90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Agendar Reunião
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl" style={{ color: '#6400A4' }}>{stats.total}</p>
            </div>
            <CalendarDays className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próximos</p>
              <p className="text-2xl" style={{ color: '#8B20EE' }}>{stats.upcoming}</p>
            </div>
            <Calendar className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hoje</p>
              <p className="text-2xl" style={{ color: '#35BAE6' }}>{stats.today}</p>
            </div>
            <AlertCircle className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Com Lembrete</p>
              <p className="text-2xl text-yellow-600">{stats.withReminder}</p>
            </div>
            <Bell className="h-8 w-8 text-yellow-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Controles de Visualização */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Seletor de visualização */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="daily">Diária</TabsTrigger>
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Navegação de período */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                style={{ 
                  backgroundColor: '#6400A4',
                  color: 'white',
                  borderColor: '#6400A4'
                }}
              >
                {(() => {
                  if (viewMode === 'daily') {
                    const today = new Date(2025, 9, 16);
                    const isToday = currentDate.toDateString() === today.toDateString();
                    return isToday ? 'Hoje' : currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
                  } else if (viewMode === 'weekly') {
                    const startOfWeek = new Date(currentDate);
                    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
                    return `Semana ${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
                  } else {
                    const month = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
                    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
                    return `${capitalizedMonth}/${currentDate.getFullYear()}`;
                  }
                })()}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Renderização da visualização selecionada */}
      {viewMode === 'daily' && renderDailyView()}
      {viewMode === 'weekly' && renderWeeklyView()}
      {viewMode === 'monthly' && renderMonthlyView()}

      {/* Dialog de Criar/Editar Evento */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {isEditMode ? 'Editar Evento' : 'Novo Evento'}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Atualize as informações do evento' : 'Adicione um novo evento à sua agenda pessoal'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                placeholder="Ex: Reunião com equipe"
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                placeholder="Detalhes sobre o evento..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                />
              </div>

              <div>
                <Label>Horário *</Label>
                <Input
                  type="time"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                />
              </div>
            </div>


          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEvent}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              disabled={!eventForm.title || !eventForm.date || !eventForm.time || !hasEventChanges()}
            >
              {isEditMode ? 'Salvar Alterações' : 'Criar Evento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes do Evento */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Detalhes do Evento
            </DialogTitle>
            <DialogDescription>
              {selectedEvent?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedEvent.color }}
                />
                <h3 className="text-xl">{selectedEvent.title}</h3>
                {selectedEvent.reminder && selectedEvent.reminder !== 'none' && (
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1"
                    style={{ borderColor: '#6400A4', color: '#6400A4' }}
                  >
                    <Bell className="h-3 w-3" />
                    {getReminderLabel(selectedEvent.reminder)}
                  </Badge>
                )}
              </div>

              {selectedEvent.description && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Descrição</p>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Data</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: '#8B20EE' }} />
                    <p>{formatDate(selectedEvent.date)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Horário</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
                    <p>{selectedEvent.time}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => selectedEvent && handleOpenReminderDialog(selectedEvent)}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Lembrete
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedEvent && handleEditEvent(selectedEvent)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configurar Lembrete */}
      <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurar Lembrete
              </div>
            </DialogTitle>
            <DialogDescription>
              Escolha quando deseja ser lembrado sobre este evento
            </DialogDescription>
          </DialogHeader>

          {selectedEventForReminder && (
            <div className="space-y-4 py-4">
              {/* Informações do Evento */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f5fc' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedEventForReminder.color }}
                  />
                  <h4 className="font-semibold">{selectedEventForReminder.title}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" style={{ color: '#8B20EE' }} />
                    <span>{formatDate(selectedEventForReminder.date)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" style={{ color: '#8B20EE' }} />
                    <span>{selectedEventForReminder.time}</span>
                  </div>
                </div>
              </div>

              {/* Seleção de Lembrete */}
              <div>
                <Label>Tipo de Lembrete</Label>
                <Select value={reminderType} onValueChange={(value) => setReminderType(value as ReminderType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione quando ser lembrado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <BellOff className="h-4 w-4" />
                        <span>Sem lembrete</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="one_day_before">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>1 dia antes do evento</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="two_hours_before">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>2 horas antes do evento</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Aviso sobre notificações */}
              {reminderType !== 'none' && (
                <div className="p-3 rounded-lg bg-purple-50 border" style={{ borderColor: '#6400A4' }}>
                  <div className="flex gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#6400A4' }} />
                    <div className="text-sm">
                      <p className="mb-1" style={{ color: '#6400A4' }}>
                        <strong>Você será notificado via:</strong>
                      </p>
                      <ul className="text-gray-600 space-y-1 ml-2">
                        <li>• Notificações do sistema</li>
                        <li>• E-mail cadastrado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveReminder}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
            >
              Confirmar Lembrete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Nova Reunião com Colaboradores */}
      <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#8B20EE' }}>
              <UserPlus className="h-5 w-5" />
              Agendar Reunião com Colaboradores
            </DialogTitle>
            <DialogDescription>
              Crie uma reunião e selecione os colaboradores. A reunião aparecerá automaticamente na agenda deles.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Título da Reunião */}
            <div>
              <Label htmlFor="meeting-title">Título da Reunião *</Label>
              <Input
                id="meeting-title"
                placeholder="Ex: Reunião de Briefing Semanal"
                value={meetingForm.title}
                onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
              />
            </div>

            {/* Data e Horários */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="meeting-date">Data *</Label>
                <Input
                  id="meeting-date"
                  type="date"
                  value={meetingForm.date}
                  onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meeting-time">Horário Início *</Label>
                <Input
                  id="meeting-time"
                  type="time"
                  value={meetingForm.time}
                  onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="meeting-end-time">Horário Término</Label>
                <Input
                  id="meeting-end-time"
                  type="time"
                  value={meetingForm.endTime}
                  onChange={(e) => setMeetingForm({ ...meetingForm, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Local */}
            <div>
              <Label htmlFor="meeting-location">Local *</Label>
              <Input
                id="meeting-location"
                placeholder="Ex: Escritório Central - Sala 2"
                value={meetingForm.location}
                onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="meeting-description">Descrição/Pauta</Label>
              <Textarea
                id="meeting-description"
                placeholder="Descreva os tópicos que serão abordados na reunião..."
                rows={3}
                value={meetingForm.description}
                onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
              />
            </div>

            {/* Seleção de Colaboradores */}
            <div>
              <Label className="mb-3 block">Selecionar Colaboradores *</Label>
              <div className="p-4 rounded-lg border-2" style={{ borderColor: '#8B20EE', backgroundColor: 'rgba(139, 32, 238, 0.02)' }}>
                <p className="text-sm text-gray-600 mb-3">
                  {meetingForm.selectedCollaborators.length} colaborador(es) selecionado(s)
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableCollaborators.map((collaborator) => {
                    const isSelected = meetingForm.selectedCollaborators.includes(collaborator.id);
                    return (
                      <div
                        key={collaborator.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'border-l-4' : ''
                        }`}
                        style={{
                          borderColor: isSelected ? '#8B20EE' : '#E5E7EB',
                          backgroundColor: isSelected ? 'rgba(139, 32, 238, 0.05)' : 'white',
                          borderLeftColor: isSelected ? '#8B20EE' : '#E5E7EB'
                        }}
                        onClick={() => toggleCollaborator(collaborator.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: isSelected ? '#8B20EE' : '#6400A4', color: 'white' }}
                            >
                              {collaborator.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: isSelected ? '#8B20EE' : '#1F2937' }}>
                                {collaborator.name}
                              </p>
                              <p className="text-sm text-gray-600">{collaborator.position}</p>
                            </div>
                          </div>
                          <Badge
                            style={{
                              backgroundColor: `${getAreaColor(collaborator.area)}15`,
                              color: getAreaColor(collaborator.area),
                              border: `1px solid ${getAreaColor(collaborator.area)}40`
                            }}
                          >
                            {collaborator.area.charAt(0).toUpperCase() + collaborator.area.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Resumo */}
            {meetingForm.selectedCollaborators.length > 0 && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Atenção:</strong> Esta reunião será adicionada automaticamente na agenda dos {meetingForm.selectedCollaborators.length} colaborador(es) selecionado(s) e eles receberão uma notificação.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsMeetingDialogOpen(false);
                setMeetingForm({
                  title: '',
                  date: '',
                  time: '',
                  endTime: '',
                  location: '',
                  description: '',
                  selectedCollaborators: []
                });
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateMeeting}
              disabled={!meetingForm.title || !meetingForm.date || !meetingForm.time || !meetingForm.location || meetingForm.selectedCollaborators.length === 0}
              style={{ backgroundColor: '#8B20EE', color: 'white' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Reunião
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
