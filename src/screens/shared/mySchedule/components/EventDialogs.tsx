// /shared/mySchedule/components/EventDialogs.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../../components/ui/alert-dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Calendar, Clock, MapPin, Bell, Edit2, Trash2, UserPlus, Check, AlertCircle, BellOff, Plus } from 'lucide-react';
import { PersonalEvent, Participant } from '../hooks/useSchedule';
import { useState } from 'react';

type ReminderType = 'one_day_before' | 'two_hours_before' | 'none';

// --- Dialog de Criar/Editar Evento ---
interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditMode: boolean;
  eventForm: {
    title: string;
    description: string;
    date: string;
    time: string;
    color: string;
  };
  onEventFormChange: (field: string, value: string) => void;
  onSave: () => void;
}

export function EventFormDialog({ 
  open, 
  onOpenChange, 
  isEditMode, 
  eventForm, 
  onEventFormChange, 
  onSave 
}: EventFormDialogProps) {
  
  const hasChanges = () => {
    return !!(eventForm.title && eventForm.date && eventForm.time);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => onEventFormChange('title', e.target.value)}
              placeholder="Ex: Reunião com equipe"
            />
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea
              value={eventForm.description}
              onChange={(e) => onEventFormChange('description', e.target.value)}
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
                onChange={(e) => onEventFormChange('date', e.target.value)}
              />
            </div>

            <div>
              <Label>Horário *</Label>
              <Input
                type="time"
                value={eventForm.time}
                onChange={(e) => onEventFormChange('time', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onSave}
            style={{ backgroundColor: '#6400A4', color: 'white' }}
            disabled={!hasChanges()}
          >
            {isEditMode ? 'Salvar Alterações' : 'Criar Evento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Dialog de Detalhes do Evento ---
interface EventDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: PersonalEvent | null;
  onEdit: (event: PersonalEvent) => void;
  onReminder: (event: PersonalEvent) => void;
  onDelete: (eventId: string) => void;
}

export function EventDetailsDialog({ 
  open, 
  onOpenChange, 
  event, 
  onEdit, 
  onReminder, 
  onDelete 
}: EventDetailsDialogProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getReminderLabel = (reminder?: string) => {
    if (!reminder || reminder === 'none') return null;
    return reminder === 'one_day_before' ? '1 dia antes' : '2h antes';
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle style={{ color: '#6400A4' }}>
            Detalhes do Evento
          </DialogTitle>
          <DialogDescription>
            {event.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: event.color }}
            />
            <h3 className="text-xl">{event.title}</h3>
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
            <div>
              <p className="text-sm text-gray-500 mb-1">Descrição</p>
              <p className="text-sm">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Data</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" style={{ color: '#8B20EE' }} />
                <p>{formatDate(event.date)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Horário</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
                <p>{event.time}</p>
              </div>
            </div>
          </div>

          {event.location && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Local</p>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" style={{ color: '#8B20EE' }} />
                <p>{event.location}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onReminder(event)}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Lembrete
          </Button>
          <Button
            variant="outline"
            onClick={() => onEdit(event)}
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete(event.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Dialog de Reunião ---
interface MeetingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingForm: {
    title: string;
    date: string;
    time: string;
    endTime: string;
    location: string;
    description: string;
    selectedCollaborators: string[];
  };
  onMeetingFormChange: (field: string, value: any) => void;
  onToggleCollaborator: (id: string) => void;
  potentialParticipants: Participant[];
  onCreateMeeting: () => void;
}

export function MeetingFormDialog({
  open,
  onOpenChange,
  meetingForm,
  onMeetingFormChange,
  onToggleCollaborator,
  potentialParticipants,
  onCreateMeeting
}: MeetingFormDialogProps) {

  const canCreateMeeting = () => {
    return !!(
      meetingForm.title && 
      meetingForm.date && 
      meetingForm.time && 
      meetingForm.location && 
      meetingForm.selectedCollaborators.length > 0
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div>
            <Label htmlFor="meeting-title">Título da Reunião *</Label>
            <Input
              id="meeting-title"
              placeholder="Ex: Reunião de Briefing Semanal"
              value={meetingForm.title}
              onChange={(e) => onMeetingFormChange('title', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="meeting-date">Data *</Label>
              <Input
                id="meeting-date"
                type="date"
                value={meetingForm.date}
                onChange={(e) => onMeetingFormChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="meeting-time">Horário Início *</Label>
              <Input
                id="meeting-time"
                type="time"
                value={meetingForm.time}
                onChange={(e) => onMeetingFormChange('time', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="meeting-end-time">Horário Término</Label>
              <Input
                id="meeting-end-time"
                type="time"
                value={meetingForm.endTime}
                onChange={(e) => onMeetingFormChange('endTime', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="meeting-location">Local *</Label>
            <Input
              id="meeting-location"
              placeholder="Ex: Escritório Central - Sala 2"
              value={meetingForm.location}
              onChange={(e) => onMeetingFormChange('location', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="meeting-description">Descrição/Pauta</Label>
            <Textarea
              id="meeting-description"
              placeholder="Descreva os tópicos que serão abordados na reunião..."
              rows={3}
              value={meetingForm.description}
              onChange={(e) => onMeetingFormChange('description', e.target.value)}
            />
          </div>

          <div>
            <Label className="mb-3 block">Selecionar Colaboradores *</Label>
            <div className="p-4 rounded-lg border-2" style={{ borderColor: '#8B20EE', backgroundColor: 'rgba(139, 32, 238, 0.02)' }}>
              <p className="text-sm text-gray-600 mb-3">
                {meetingForm.selectedCollaborators.length} colaborador(es) selecionado(s)
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {potentialParticipants.map((collaborator) => {
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
                      onClick={() => onToggleCollaborator(collaborator.id)}
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
                            <p className="text-sm text-gray-600">{collaborator.role}</p>
                          </div>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: '#6400A415',
                            color: '#6400A4',
                            border: `1px solid #6400A440`
                          }}
                        >
                          {collaborator.role}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={onCreateMeeting}
            disabled={!canCreateMeeting()}
            style={{ backgroundColor: '#8B20EE', color: 'white' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Reunião
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Dialog de Lembrete ---
interface ReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: PersonalEvent | null;
  reminderType: ReminderType;
  onReminderTypeChange: (type: ReminderType) => void;
  onSaveReminder: () => void;
}

export function ReminderDialog({
  open,
  onOpenChange,
  event,
  reminderType,
  onReminderTypeChange,
  onSaveReminder
}: ReminderDialogProps) {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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

        <div className="space-y-4 py-4">
          {/* Informações do Evento */}
          <div className="p-3 rounded-lg" style={{ backgroundColor: '#f8f5fc' }}>
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: event.color }}
              />
              <h4 className="font-semibold">{event.title}</h4>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" style={{ color: '#8B20EE' }} />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" style={{ color: '#8B20EE' }} />
                <span>{event.time}</span>
              </div>
            </div>
          </div>

          {/* Seleção de Lembrete */}
          <div>
            <Label>Tipo de Lembrete</Label>
            <Select value={reminderType} onValueChange={(value) => onReminderTypeChange(value as ReminderType)}>
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={onSaveReminder}
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            Confirmar Lembrete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Alert Dialog para Exclusão ---
interface DeleteAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteAlertDialog({ open, onOpenChange, onConfirm }: DeleteAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Evento?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O evento será permanentemente removido da sua agenda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}