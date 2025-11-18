import { Button } from '../../../components/ui/button';

interface AllocationFiltersProps {
  currentFilter: string;
  onFilterChange: (status: string) => void;
}

export default function AllocationFilters({ currentFilter, onFilterChange }: AllocationFiltersProps) {
  const filters = [
    { id: 'all', label: 'Todos', style: { backgroundColor: '#6400A4', color: 'white' } },
    { id: 'active', label: 'Em Andamento', style: { backgroundColor: '#10B981', color: 'white' } },
    { id: 'upcoming', label: 'Agendadas', style: { backgroundColor: '#35BAE6', color: 'white' } },
    { id: 'completed', label: 'Concluídas', style: {} },
  ];

  return (
    <div className="flex items-center space-x-2">
      {filters.map(filter => (
        <Button
          key={filter.id}
          size="sm"
          variant={currentFilter === filter.id ? 'default' : 'outline'}
          onClick={() => onFilterChange(filter.id)}
          style={currentFilter === filter.id ? filter.style : {}}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
