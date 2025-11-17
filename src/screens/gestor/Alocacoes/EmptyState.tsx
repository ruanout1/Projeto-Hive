import { Users, Plus } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

interface EmptyStateProps {
  onNewAllocation: () => void;
  filterStatus: string;
}

export function EmptyState({ onNewAllocation, filterStatus }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="mb-4 p-6 rounded-full mx-auto w-24 h-24 flex items-center justify-center" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
          <Users className="h-12 w-12" style={{ color: '#6400A4' }} />
        </div>
        <h3 className="text-xl mb-2" style={{ color: '#6400A4' }}>Nenhuma alocação encontrada</h3>
        <p className="text-gray-600 mb-6">
          {filterStatus === 'all'
            ? 'Comece criando uma nova alocação de colaborador para um cliente.'
            : 'Não há alocações com este status no momento.'
          }
        </p>
        {filterStatus === 'all' && (
          <Button
            onClick={onNewAllocation}
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Alocação
          </Button>
        )}
      </CardContent>
    </Card>
  );
}