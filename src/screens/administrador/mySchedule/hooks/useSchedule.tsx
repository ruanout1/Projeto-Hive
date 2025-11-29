import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '../../../../lib/api';

export interface Participant {
  id: string;
  name: string;
  role: string;
}

// CORREÇÃO: Adicionei 'meeting' e 'personal' nos tipos permitidos
export interface PersonalEvent {
  id: string;
  title: string;
  description: string;
  date: string; 
  time: string; 
  endTime?: string;
  color?: string;
  reminder?: 'one_day_before' | 'two_hours_before' | 'none';
  type: 'event' | 'service' | 'meeting' | 'personal'; 
  location?: string;
  participants?: Participant[];
}

export function useSchedule(userRole: 'admin' | 'manager' | 'collaborator') {
  const [events, setEvents] = useState<PersonalEvent[]>([]);
  const [potentialParticipants, setPotentialParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/schedule');
      
      const formattedEvents: PersonalEvent[] = response.data.map((item: any) => {
        const startObj = new Date(item.start_at);
        const endObj = new Date(item.end_at);

        return {
          id: String(item.source_id),
          title: item.title,
          description: item.description || '',
          date: startObj.toISOString().split('T')[0], 
          time: startObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          endTime: endObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          color: item.color || (item.item_type === 'service' ? '#35BAE6' : '#6400A4'),
          type: item.item_type, // O backend já retorna 'service', 'meeting' ou 'personal'
          location: item.location
        };
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar agenda");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchParticipants = useCallback(async () => {
    try {
      const response = await api.get('/users');
      const allUsers = response.data.data || response.data; 

      let filteredUsers = [];
      if (userRole === 'admin') {
        filteredUsers = allUsers;
      } else {
        filteredUsers = allUsers.filter((u: any) => u.role === 'Colaborador' || u.role === 'collaborator');
      }

      setPotentialParticipants(filteredUsers.map((u: any) => ({
        id: u.id,
        name: u.name || u.full_name,
        role: u.role
      })));
    } catch (error) {
      console.error(error);
    }
  }, [userRole]);

  const createEvent = async (eventData: any) => {
    try {
      const startDateTime = `${eventData.date}T${eventData.time}:00`;
      let endDateTime = eventData.endTime 
        ? `${eventData.date}T${eventData.endTime}:00`
        : new Date(new Date(startDateTime).getTime() + 60*60*1000).toISOString();

      const payload = {
        title: eventData.title,
        description: eventData.description,
        start_date: startDateTime,
        end_date: endDateTime,
        event_type: eventData.type || 'personal',
        location: eventData.location,
        color: eventData.color,
        participants: eventData.participants
      };

      await api.post('/schedule', payload);
      toast.success('Salvo com sucesso!');
      fetchEvents();
      return true;
    } catch (error) {
      toast.error("Erro ao salvar.");
      return false;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await api.delete(`/schedule/${id}?type=event`);
      toast.success("Removido.");
      fetchEvents();
      return true;
    } catch (error) {
      toast.error("Erro ao excluir.");
      return false;
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchParticipants();
  }, [fetchEvents, fetchParticipants]);

  return {
    events,
    potentialParticipants,
    loading,
    createEvent,
    deleteEvent,
    refresh: fetchEvents
  };
}