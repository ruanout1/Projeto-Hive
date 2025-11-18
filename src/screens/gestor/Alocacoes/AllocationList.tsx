import { Allocation } from './types';
import AllocationCard from './AllocationCard';

interface AllocationListProps {
  allocations: Allocation[];
  onEdit: (allocation: Allocation) => void;
  onDelete: (id: number) => void;
}

export default function AllocationList({ allocations, onEdit, onDelete }: AllocationListProps) {
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
