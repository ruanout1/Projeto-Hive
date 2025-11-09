import { Search } from 'lucide-react';
// --- CORREÇÃO: Ajustando o caminho de '...' para '..' ---
import { Input } from '../../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
// --- FIM DA CORREÇÃO ---

// (Importaremos os tipos, embora não sejam estritamente necessários aqui, é uma boa prática)
// import { Team } from './types'; 

interface FiltersBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: 'todos' | 'active' | 'inactive') => void;
  actionLoading: boolean;
}

export function FiltersBar({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  actionLoading
}: FiltersBarProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome da equipe, gestor ou membro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={actionLoading}
            />
          </div>

          {/* Status Filter */}
          <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'todos' | 'active' | 'inactive')} className="w-auto">
            <TabsList>
              <TabsTrigger value="todos" disabled={actionLoading}>Todas</TabsTrigger>
              <TabsTrigger value="active" disabled={actionLoading}>Ativas</TabsTrigger>
              <TabsTrigger value="inactive" disabled={actionLoading}>Inativas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

