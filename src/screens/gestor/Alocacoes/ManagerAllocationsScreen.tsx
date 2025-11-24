import { Plus } from 'lucide-react';
import ScreenHeader from '../../public/ScreenHeader';
import { Button } from '../../../components/ui/button';
import AllocationStats from './AllocationStats';
import AllocationFilters from './AllocationFilters';
import AllocationList from './AllocationList';
import EmptyState from './EmptyState';
import AllocationDialog from './AllocationDialog';
import { useAllocations } from './hooks/useAllocations';
import { AllocationsScreenProps } from './types';

export default function ManagerAllocationsScreen({ onBack }: AllocationsScreenProps) {
  const {
    allocations,
    stats,
    dialogOpen,
    editingAllocation,
    filterStatus,
    setFilterStatus,
    handleOpenDialog,
    handleCloseDialog,
    handleSaveAllocation,
    handleDeleteAllocation,
    formState,
    mockData
  } = useAllocations();

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <ScreenHeader 
              title="Alocações de Colaboradores"
              description="Gerencie contratos fixos e alocações de longo prazo."
              onBack={onBack}
            />
            <Button
              onClick={() => handleOpenDialog()}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Alocação
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <AllocationStats stats={stats} onFilterChange={setFilterStatus} />

          <div className="flex items-center justify-between">
            <AllocationFilters currentFilter={filterStatus} onFilterChange={setFilterStatus} />
          </div>

          {allocations.length === 0 ? (
            <EmptyState onNewAllocation={() => handleOpenDialog()} filterStatus={filterStatus} />
          ) : (
            <AllocationList 
              allocations={allocations} 
              onEdit={handleOpenDialog} 
              onDelete={handleDeleteAllocation} 
            />
          )}
        </div>
      </div>

      <AllocationDialog
        open={dialogOpen}
        editingAllocation={editingAllocation}
        onClose={handleCloseDialog}
        onSave={handleSaveAllocation}
        formState={formState}
        mockData={mockData}
      />
    </div>
  );
}
