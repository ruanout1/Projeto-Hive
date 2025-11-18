import { Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface DashboardHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const DashboardHeader = ({ onRefresh, isRefreshing }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="hive-screen-title">Central de Gestão</h1>
        <p className="text-black">
          Distribuição de equipes e acompanhamento de serviços em tempo real.
        </p>
      </div>
      <Button 
        onClick={onRefresh}
        disabled={isRefreshing}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <Clock className="h-4 w-4" />
        <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
      </Button>
    </div>
  );
};