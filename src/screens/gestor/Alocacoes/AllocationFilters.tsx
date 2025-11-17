import { Button } from '../../../components/ui/button';

interface AllocationFiltersProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const filters = [
  { id: 'all', label: 'Todos', style: { backgroundColor: '#6400A4', color: 'white' } },
  { id: 'active', label: 'Em Andamento', style: { backgroundColor: '#10B981', color: 'white' } },
  { id: 'upcoming', label: 'Agendadas', style: { backgroundColor: '#35BAE6', color: 'white' } },
  { id: 'completed', label: 'Concluídas', style: {} },
];

export function AllocationFilters({ filterStatus, setFilterStatus }: AllocationFiltersProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {filters.map(filter => (
          <Button
            key={filter.id}
            size="sm"
            variant={filterStatus === filter.id ? 'default' : 'outline'}
            onClick={() => setFilterStatus(filter.id)}
            style={filterStatus === filter.id ? filter.style : {}}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}