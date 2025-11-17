import { Allocation } from './types';
import { AllocationCard } from './AllocationCard.tsx';
import { EmptyState } from './EmptyState.tsx';

interface AllocationListProps {
  allocations: Allocation[];
  onEdit: (allocation: Allocation) => void;
  onDelete: (id: number) => void;
  onNewAllocation: () => void;
  filterStatus: string;
}

export function AllocationList({
  allocations,
  onEdit,
  onDelete,
  onNewAllocation,
  filterStatus
}: AllocationListProps) {
  
  if (allocations.length === 0) {
    return (
      <EmptyState 
        onNewAllocation={onNewAllocation} 
        filterStatus={filterStatus} 
      />
    );
  }

  return (
    <div className="space-y-3">
      {allocations.map((allocation) => (
        <AllocationCard
          key={allocation.id}
          allocation={allocation}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}