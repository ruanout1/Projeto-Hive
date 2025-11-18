import { useDashboardApi } from './hooks/useDashboardApi';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorDisplay } from './ErrorDisplay';
import { DashboardHeader } from './DashboardHeader';
import { StatsCards } from './StatsCards';
import { OperationalMap } from './OperationalMap';
import { ActiveServicesTable } from './ActiveServicesTable';

const ManagerDashboard = () => {
  const { stats, services, loading, error, actionLoading, handleRefresh } = useDashboardApi();

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
        <OperationalMap />
        <ActiveServicesTable services={services} />
      </main>
    </div>
  );
};

export default ManagerDashboard;
