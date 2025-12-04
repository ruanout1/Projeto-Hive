// /shared/mySchedule/components/CalendarHeader.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';

interface CalendarHeaderProps {
  viewMode: 'daily' | 'weekly' | 'monthly';
  setViewMode: (mode: 'daily' | 'weekly' | 'monthly') => void;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onToday: () => void;
}

export function CalendarHeader({ viewMode, setViewMode, currentDate, onNavigate, onToday }: CalendarHeaderProps) {
  
  const getHeaderLabel = () => {
    if (viewMode === 'daily') {
      const today = new Date();
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
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Seletor de visualização */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
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
              onClick={() => onNavigate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onToday}
              style={{ 
                backgroundColor: '#6400A4',
                color: 'white',
                borderColor: '#6400A4'
              }}
            >
              {getHeaderLabel()}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}