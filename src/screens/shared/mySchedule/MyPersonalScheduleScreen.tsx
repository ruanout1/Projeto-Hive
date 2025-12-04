// /shared/mySchedule/MyPersonalScheduleScreen.tsx
import { useState } from 'react';
import ScreenHeader from '../../public/ScreenHeader';
import { Plus, UserPlus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useSchedule, PersonalEvent } from './hooks/useSchedule';
import { CalendarGrid } from './components/CalendarGrid';
import { CalendarHeader } from './components/CalendarHeader';
import { StatsCards } from './components/StatsCards';
import {
  EventFormDialog,
  EventDetailsDialog,
  MeetingFormDialog,
  ReminderDialog,
  DeleteAlertDialog
} from './components/EventDialogs';

type ViewMode = 'daily' | 'weekly' | 'monthly';
type ReminderType = 'one_day_before' | 'two_hours_before' | 'none';

interface MyPersonalScheduleScreenProps {
  userRole: 'admin' | 'manager';
  onBack?: () => void;
}

export default function MyPersonalScheduleScreen({ userRole, onBack }: MyPersonalScheduleScreenProps) {
  const { events, potentialParticipants, createEvent, deleteEvent, updateEventReminder } = useSchedule(userRole);
  
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Estados dos dialogs
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Estados dos formulários e seleções
  const [selectedEvent, setSelectedEvent] = useState<PersonalEvent | null>(null);
  const [selectedEventForReminder, setSelectedEventForReminder] = useState<PersonalEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [eventForm, setEventForm] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    time: '', 
    color: '#6400A4' 
  });
  
  const [meetingForm, setMeetingForm] = useState({ 
    title: '', 
    date: '', 
    time: '', 
    endTime: '', 
    location: '', 
    description: '', 
    selectedCollaborators: [] as string[] 
  });
  
  const [reminderType, setReminderType] = useState<ReminderType>('none');

  // --- HELPERS ---
  const isEventToday = (dateString: string) => {
    const today = new Date();
    return today.toISOString().split('T')[0] === dateString;
  };

  const isEventUpcoming = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateString + 'T00:00:00');
    return eventDate >= today;
  };

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

  const goToToday = () => setCurrentDate(new Date());

  // --- HANDLERS ---
  const handleAddEvent = () => {
    setIsEditMode(false);
    setSelectedEvent(null);
    setEventForm({ 
      title: '', 
      description: '', 
      date: new Date().toISOString().split('T')[0], 
      time: '09:00', 
      color: '#6400A4' 
    });
    setIsEventDialogOpen(true);
  };

  const handleEditEvent = (event: PersonalEvent) => {
    setIsEditMode(true);
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      color: event.color || '#6400A4'
    });
    setIsEventDialogOpen(true);
    setIsDetailsDialogOpen(false);
  };

  const handleViewEvent = (event: PersonalEvent) => {
    setSelectedEvent(event);
    setIsDetailsDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    const success = await createEvent({ 
      ...eventForm, 
      type: 'personal' 
    });
    
    if (success) {
      setIsEventDialogOpen(false);
    }
  };

  const handleCreateMeeting = async () => {
    const success = await createEvent({ 
      ...meetingForm, 
      type: 'meeting', 
      color: '#8B20EE', 
      participants: meetingForm.selectedCollaborators 
    });

    if (success) {
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
    }
  };

  const handleOpenReminder = (event: PersonalEvent) => {
    setSelectedEventForReminder(event);
    setReminderType(event.reminder || 'none');
    setIsReminderDialogOpen(true);
    setIsDetailsDialogOpen(false);
  };

  const handleSaveReminder = async () => {
    if (!selectedEventForReminder) return;

    const success = await updateEventReminder(selectedEventForReminder.id, reminderType);
    if (success) {
      setIsReminderDialogOpen(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (eventToDelete) {
      await deleteEvent(eventToDelete);
      setEventToDelete(null);
      setIsDeleteDialogOpen(false);
      setIsDetailsDialogOpen(false);
    }
  };

  const handleEventFormChange = (field: string, value: string) => {
    setEventForm(prev => ({ ...prev, [field]: value }));
  };

  const handleMeetingFormChange = (field: string, value: any) => {
    setMeetingForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleCollaborator = (id: string) => {
    setMeetingForm(prev => ({
      ...prev,
      selectedCollaborators: prev.selectedCollaborators.includes(id)
        ? prev.selectedCollaborators.filter(collabId => collabId !== id)
        : [...prev.selectedCollaborators, id]
    }));
  };

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('daily');
  };

  // --- STATS ---
  const stats = {
    total: events.length,
    upcoming: events.filter(e => isEventUpcoming(e.date)).length,
    today: events.filter(e => isEventToday(e.date)).length,
    withReminder: events.filter(e => e.reminder && e.reminder !== 'none').length
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

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Calendar Header */}
      <CalendarHeader 
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        onNavigate={navigatePeriod}
        onToday={goToToday}
      />

      {/* Calendar Grid */}
      <CalendarGrid 
        viewMode={viewMode}
        currentDate={currentDate}
        events={events}
        onViewEvent={handleViewEvent}
        onDateClick={handleDateClick}
      />

      {/* Dialogs */}
      <EventFormDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        isEditMode={isEditMode}
        eventForm={eventForm}
        onEventFormChange={handleEventFormChange}
        onSave={handleSaveEvent}
      />

      <EventDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        event={selectedEvent}
        onEdit={handleEditEvent}
        onReminder={handleOpenReminder}
        onDelete={handleDeleteEvent}
      />

      <MeetingFormDialog
        open={isMeetingDialogOpen}
        onOpenChange={setIsMeetingDialogOpen}
        meetingForm={meetingForm}
        onMeetingFormChange={handleMeetingFormChange}
        onToggleCollaborator={toggleCollaborator}
        potentialParticipants={potentialParticipants}
        onCreateMeeting={handleCreateMeeting}
      />

      <ReminderDialog
        open={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
        event={selectedEventForReminder}
        reminderType={reminderType}
        onReminderTypeChange={setReminderType}
        onSaveReminder={handleSaveReminder}
      />

      <DeleteAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteEvent}
      />
    </div>
  );
}