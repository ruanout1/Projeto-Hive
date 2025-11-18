import { useState, useEffect } from 'react';
import ScreenHeader from '../../../components/ScreenHeader'; // Corrigido
import { Card, CardContent } from '../../../components/ui/card'; // Corrigido
import { ScheduleItem, MyScheduleScreenProps, UseScheduleApiReturn } from './types';
import ScheduleStats from './ScheduleStats';
import ScheduleCalendar from './ScheduleCalendar';
import ScheduleDetailModal from './ScheduleDetailModal';
import { useManagerScheduleApi } from './hooks/useManagerScheduleApi';

export default function ManagerPersonalScheduleScreen({ onBack }: MyScheduleScreenProps) {
  const {
    schedule,
    stats,
    loading,
    error,
    refetch,
  }: UseScheduleApiReturn = useManagerScheduleApi();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  const handleItemClick = (item: ScheduleItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Erro ao carregar agenda</p>
            <p>{error}</p>
            <button
              onClick={refetch}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <ScreenHeader 
            title="Minha Agenda"
            description="Visualize suas atividades agendadas e reuniões"
            onBack={() => onBack?.()}
          />
          
          <ScheduleStats stats={stats} schedule={schedule} />
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <ScheduleCalendar
                schedule={schedule}
                selectedDate={selectedDate}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onDateChange={handleDateChange}
                onItemClick={handleItemClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ScheduleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        selectedItem={selectedItem}
      />
    </div>
  );
}