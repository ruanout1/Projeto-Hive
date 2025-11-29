import { useState } from 'react';
import ScreenHeader from '../../public/ScreenHeader';
// CORREÇÃO: Adicionados 'Check' e 'MapPin' que faltavam
import { Calendar, Clock, Plus, Edit2, Trash2, CalendarDays, AlertCircle, Bell, BellOff, ChevronLeft, ChevronRight, Eye, UserPlus, Check, MapPin } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';

// Import do Hook e da Interface
import { useSchedule, PersonalEvent } from './hooks/useSchedule';

type ReminderType = 'one_day_before' | 'two_hours_before' | 'none';
type ViewMode = 'daily' | 'weekly' | 'monthly';

interface MyPersonalScheduleScreenProps {
  userRole: 'admin' | 'manager';
  onBack?: () => void;
}

export default function MyPersonalScheduleScreen({ userRole, onBack }: MyPersonalScheduleScreenProps) {
  
  // CORREÇÃO: Passando userRole para o hook (remove o erro "Expected 1 arguments")
  const { events, potentialParticipants, createEvent, deleteEvent } = useSchedule(userRole);
  
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date()); 

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  
  const [selectedEvent, setSelectedEvent] = useState<PersonalEvent | null>(null);
  const [selectedEventForReminder, setSelectedEventForReminder] = useState<PersonalEvent | null>(null);
  
  const [eventForm, setEventForm] = useState({
    title: '', description: '', date: '', time: '', color: '#6400A4'
  });

  const [meetingForm, setMeetingForm] = useState({
    title: '', date: '', time: '', endTime: '', location: '', description: '', selectedCollaborators: [] as string[]
  });

  const [reminderType, setReminderType] = useState<ReminderType>('none');

  // --- HANDLERS ---

  const handleAddEvent = () => {
    setEventForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '09:00', color: '#6400A4' });
    setIsEventDialogOpen(true);
  };

  const handleViewEvent = (event: PersonalEvent) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    const success = await createEvent({ ...eventForm, type: 'personal' });
    if (success) setIsEventDialogOpen(false);
  };

  const handleDeleteEventAction = async (eventId: string) => {
    if(window.confirm("Tem certeza?")) {
        await deleteEvent(eventId);
        setIsDetailsDialogOpen(false);
    }
  };

  const handleCreateMeeting = async () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time || !meetingForm.location) {
        toast.error('Preencha os campos obrigatórios');
        return;
    }
    // CORREÇÃO: type: 'meeting' agora é aceito pela interface PersonalEvent
    const success = await createEvent({
        ...meetingForm,
        type: 'meeting', 
        color: '#8B20EE',
        participants: meetingForm.selectedCollaborators
    });

    if (success) setIsMeetingDialogOpen(false);
  };

  const toggleCollaborator = (id: string) => {
    setMeetingForm(prev => ({
        ...prev,
        selectedCollaborators: prev.selectedCollaborators.includes(id)
            ? prev.selectedCollaborators.filter(c => c !== id)
            : [...prev.selectedCollaborators, id]
    }));
  };

  // --- HELPERS ---
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateString);
  };

  const isEventToday = (dateString: string) => {
    const today = new Date();
    return today.toISOString().split('T')[0] === dateString;
  };

  const formatDate = (dateString: string) => {
    if(!dateString) return '-';
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
  };
  
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'daily') newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    else if (viewMode === 'weekly') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    else newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  // --- RENDER VIEW COMPONENTS ---

  const renderEventCard = (event: PersonalEvent) => (
    <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer mb-2 bg-white border-l-4" style={{ borderLeftColor: event.color }}>
      <CardContent className="p-3">
          <div className="flex justify-between items-start">
              <div>
                  <h4 className="font-semibold text-sm text-gray-800">{event.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Clock size={12} className="text-purple-600"/> 
                      {event.time} {event.endTime ? `- ${event.endTime}` : ''}
                  </div>
              </div>
              {event.type === 'service' && <Badge variant="secondary" className="text-[10px]">Serviço</Badge>}
          </div>
      </CardContent>
    </Card>
  );

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
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        currentWeek.push(new Date(d));
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
           <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">{day}</div>
              ))}
           </div>
           {weeks.map((week, idx) => (
               <div key={idx} className="grid grid-cols-7 border-b border-gray-200 last:border-0">
                   {week.map((date, dayIdx) => {
                       const dayEvents = getEventsForDate(date);
                       const isCurrentMonth = date.getMonth() === month;
                       const isToday = date.toDateString() === new Date().toDateString();

                       return (
                           <div key={dayIdx} 
                                className={`min-h-[120px] p-2 border-r last:border-r-0 transition-colors ${isToday ? 'bg-purple-50' : isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'}`}
                                onClick={() => { if(dayEvents.length > 0) { setCurrentDate(date); setViewMode('daily'); } }}
                           >
                               <div className="flex justify-between mb-2">
                                   <span className={`text-sm font-medium ${isToday ? 'text-purple-700' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}`}>{date.getDate()}</span>
                                   {dayEvents.length > 0 && <Badge className="h-5 bg-purple-600">{dayEvents.length}</Badge>}
                               </div>
                               <div className="space-y-1">
                                   {dayEvents.slice(0, 2).map(evt => (
                                       <div key={evt.id} onClick={(e) => { e.stopPropagation(); handleViewEvent(evt); }} 
                                            className="text-[10px] p-1 rounded border-l-2 truncate cursor-pointer hover:opacity-80 bg-white shadow-sm"
                                            style={{ borderLeftColor: evt.color }}>
                                            {evt.time} {evt.title}
                                       </div>
                                   ))}
                                   {dayEvents.length > 2 && <p className="text-[10px] text-center text-gray-400">+{dayEvents.length - 2} mais</p>}
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

  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.date) >= new Date()).length,
    today: getEventsForDate(new Date()).length,
    withReminder: events.filter(e => e.type === 'meeting').length 
  };

  return (
    <div className="p-6 bg-gray-50 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
         <div className="flex-1"><ScreenHeader title="Minha Agenda" description="Gerencie eventos e compromissos" onBack={onBack} /></div>
         <div className="flex gap-2">
            <Button onClick={handleAddEvent} style={{ backgroundColor: '#6400A4', color: 'white' }}><Plus className="mr-2 h-4 w-4"/> Novo Evento</Button>
            <Button onClick={() => setIsMeetingDialogOpen(true)} style={{ backgroundColor: '#8B20EE', color: 'white' }}><UserPlus className="mr-2 h-4 w-4"/> Agendar Reunião</Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <Card className="border-purple-200 bg-purple-50"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm text-gray-600">Total</p><p className="text-2xl text-purple-700 font-bold">{stats.total}</p></div><CalendarDays className="text-purple-400"/></CardContent></Card>
         <Card className="border-blue-200 bg-blue-50"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm text-gray-600">Próximos</p><p className="text-2xl text-blue-600 font-bold">{stats.upcoming}</p></div><Calendar className="text-blue-400"/></CardContent></Card>
         <Card className="border-green-200 bg-green-50"><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm text-gray-600">Hoje</p><p className="text-2xl text-green-600 font-bold">{stats.today}</p></div><AlertCircle className="text-green-400"/></CardContent></Card>
      </div>

      <Card className="mb-6">
         <CardContent className="pt-6 flex justify-between items-center">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                    <TabsTrigger value="daily">Diária</TabsTrigger>
                    <TabsTrigger value="weekly">Semanal</TabsTrigger>
                    <TabsTrigger value="monthly">Mensal</TabsTrigger>
                </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('prev')}><ChevronLeft size={16}/></Button>
                <span className="font-bold text-purple-700 min-w-[150px] text-center">{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</span>
                <Button variant="outline" size="sm" onClick={() => navigatePeriod('next')}><ChevronRight size={16}/></Button>
                <Button size="sm" onClick={goToToday} style={{ backgroundColor: '#6400A4' }}>Hoje</Button>
            </div>
         </CardContent>
      </Card>

      {viewMode === 'monthly' ? renderMonthlyView() : (
          <div className="space-y-4">
             <p className="text-center text-gray-500">Visualização detalhada em lista</p>
             {getEventsForDate(currentDate).map(renderEventCard)}
          </div>
      )}

      {/* 1. Criar Evento Simples */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
         <DialogContent>
            <DialogHeader><DialogTitle>Novo Evento Pessoal</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <Input placeholder="Título" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                    <Input type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
                    <Input type="time" value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})} />
                </div>
                <Textarea placeholder="Descrição" value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} />
            </div>
            <DialogFooter><Button onClick={handleSaveEvent} style={{ backgroundColor: '#6400A4', color: 'white' }}>Salvar Evento</Button></DialogFooter>
         </DialogContent>
      </Dialog>

      {/* 2. Criar Reunião */}
      <Dialog open={isMeetingDialogOpen} onOpenChange={setIsMeetingDialogOpen}>
         <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Agendar Reunião</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <Input placeholder="Assunto da Reunião" value={meetingForm.title} onChange={e => setMeetingForm({...meetingForm, title: e.target.value})} />
                <div className="grid grid-cols-3 gap-4">
                    <Input type="date" value={meetingForm.date} onChange={e => setMeetingForm({...meetingForm, date: e.target.value})} />
                    <Input type="time" value={meetingForm.time} onChange={e => setMeetingForm({...meetingForm, time: e.target.value})} />
                    <Input type="time" placeholder="Fim" value={meetingForm.endTime} onChange={e => setMeetingForm({...meetingForm, endTime: e.target.value})} />
                </div>
                <Input placeholder="Local" value={meetingForm.location} onChange={e => setMeetingForm({...meetingForm, location: e.target.value})} />
                
                <div className="border rounded p-4 max-h-40 overflow-y-auto">
                    <Label className="mb-2 block">Participantes</Label>
                    {potentialParticipants.map(p => (
                        <div key={p.id} className={`flex items-center p-2 border-b cursor-pointer ${meetingForm.selectedCollaborators.includes(p.id) ? 'bg-purple-50' : ''}`} onClick={() => toggleCollaborator(p.id)}>
                            <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center ${meetingForm.selectedCollaborators.includes(p.id) ? 'bg-purple-600' : ''}`}>{meetingForm.selectedCollaborators.includes(p.id) && <Check size={12} className="text-white"/>}</div>
                            <span>{p.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            <DialogFooter><Button onClick={handleCreateMeeting} style={{ backgroundColor: '#8B20EE', color: 'white' }}>Agendar</Button></DialogFooter>
         </DialogContent>
      </Dialog>

      {/* 3. Detalhes */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
         <DialogContent>
             <DialogHeader><DialogTitle className="text-purple-800">{selectedEvent?.title}</DialogTitle></DialogHeader>
             <div className="space-y-3">
                 <div className="flex gap-2 text-sm text-gray-600"><Calendar size={16}/> {selectedEvent && formatDate(selectedEvent.date)}</div>
                 <div className="flex gap-2 text-sm text-gray-600"><Clock size={16}/> {selectedEvent?.time}</div>
                 {selectedEvent?.location && <div className="flex gap-2 text-sm text-gray-600"><MapPin size={16}/> {selectedEvent.location}</div>}
                 <p className="text-sm mt-4 p-3 bg-gray-50 rounded">{selectedEvent?.description || 'Sem descrição.'}</p>
             </div>
             <DialogFooter>
                 {selectedEvent?.type !== 'service' && <Button variant="destructive" onClick={() => selectedEvent && handleDeleteEventAction(selectedEvent.id)}>Excluir</Button>}
             </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}