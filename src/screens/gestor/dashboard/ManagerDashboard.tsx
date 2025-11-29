import { useDashboardApi } from './hooks/useDashboardApi';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorDisplay } from './ErrorDisplay';
import { DashboardHeader } from './DashboardHeader';
import { StatsCards } from './StatsCards';
import { OperationalMap } from './OperationalMap';
import { ActiveServicesTable } from './ActiveServicesTable';

const ManagerDashboard = () => {
  // 1. Obter o estado 'teams' do nosso hook atualizado
  const { stats, services, teams, loading, error, actionLoading, handleRefresh } = useDashboardApi();

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={handleRefresh} />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-gray-50/30">
      <DashboardHeader onRefresh={handleRefresh} isRefreshing={actionLoading} />
      <main>
        <StatsCards stats={stats} />
        {/* 2. Passar os dados reais das equipes para o componente do mapa */}
        <OperationalMap teams={teams} />
        <ActiveServicesTable services={services} />
      </main>
    </div>
  );
};

export default ManagerDashboard;