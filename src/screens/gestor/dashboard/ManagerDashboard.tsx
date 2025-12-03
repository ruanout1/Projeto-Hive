import { useState } from 'react';
import { useDashboardApi } from './hooks/useDashboardApi';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorDisplay } from './components/ErrorDisplay';
import { DashboardHeader } from './components/DashboardHeader';
import { StatsCards } from './components/StatsCards';
import { OperationalMap } from './components/OperationalMap';
import { ActiveServicesTable } from './components/ActiveServicesTable';
import AIAssistant from '../../public/AIAssistant'; // ADICIONAR IMPORT
import { Bot } from 'lucide-react'; // ADICIONAR IMPORT
import { Button } from '../../../components/ui/button'; // ADICIONAR IMPORT

interface ManagerDashboardProps {
  onSectionChange?: (section: string) => void;
}

const ManagerDashboard = ({ onSectionChange }: ManagerDashboardProps) => {
  const [isAIOpen, setIsAIOpen] = useState(false); // NOVO ESTADO
  
  const { stats, services, teams, loading, error, actionLoading, handleRefresh } = useDashboardApi();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleRefresh} />;
  }

  return (
    <div className="p-6 overflow-hidden relative">
      {/* BOTÃO DE IA FIXO NO CANTO - FALTANDO */}
      <div className="absolute top-6 right-6 z-10">

      </div>

      <DashboardHeader 
        onRefresh={handleRefresh} 
        isRefreshing={actionLoading}
        onOpenAIAssistant={() => setIsAIOpen(true)} // PASSAR FUNÇÃO
      />
      
      <StatsCards stats={stats} />
      <OperationalMap teams={teams} />
      <ActiveServicesTable services={services} />
    </div>
  );
};

export default ManagerDashboard;