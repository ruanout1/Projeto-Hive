// /shared/mySchedule/components/CalendarGrid.tsx
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { Calendar, Clock, Eye, Bell } from 'lucide-react';
import { PersonalEvent } from '../hooks/useSchedule';
import { Button } from '../../../../components/ui/button';

interface CalendarGridProps {
  viewMode: 'daily' | 'weekly' | 'monthly';
  currentDate: Date;
  events: PersonalEvent[];
  onViewEvent: (event: PersonalEvent) => void;
  onDateClick?: (date: Date) => void;
}

export function CalendarGrid({ viewMode, currentDate, events, onViewEvent, onDateClick }: CalendarGridProps) {
  
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateString);
  };

  const isEventToday = (dateString: string) => {
    const today = new Date();
    return today.toISOString().split('T')[0] === dateString;
  };

  const getReminderLabel = (reminder?: string) => {
    if (!reminder || reminder === 'none') return null;
    return reminder === 'one_day_before' ? '1 dia antes' : '2h antes';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // --- RENDER MENSAL (Fiel ao protótipo) ---
  if (viewMode === 'monthly') {
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
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="p-3 text-center text-sm text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
              {week.map((date, dayIndex) => {
                const eventsForDay = getEventsForDate(date);
                const isCurrentMonth = date.getMonth() === month;
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={dayIndex}
                    className="min-h-[120px] p-2 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors"
                    style={{ 
                      backgroundColor: isToday ? 'rgba(100, 0, 164, 0.05)' : isCurrentMonth ? 'white' : '#f9fafb'
                    }}
                    onClick={() => onDateClick?.(date)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewEvent(event);
                          }}
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
  }

  // --- RENDER SEMANAL (Fiel ao protótipo) ---
  if (viewMode === 'weekly') {
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
            const isToday = date.toDateString() === new Date().toDateString();
            
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
                      onClick={() => onViewEvent(event)}
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
  }

  // --- RENDER DIÁRIO (Fiel ao protótipo) ---
  if (viewMode === 'daily') {
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
          </Card>
        ) : (
          <div className="space-y-3">
            {eventsForDay
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((event) => (
                <Card 
                  key={event.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onViewEvent(event)}
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
                          onViewEvent(event);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}