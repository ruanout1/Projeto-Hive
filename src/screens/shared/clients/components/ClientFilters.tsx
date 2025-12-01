// /shared/clients/components/ClientFilters.tsx - VERSÃO CORRIGIDA
import { Search } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';

interface ClientFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterChange: (value: string) => void;
}

export function ClientFilters({ searchTerm, onSearchChange, filterStatus, onFilterChange }: ClientFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search - IDÊNTICO AO PROTÓTIPO */}
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome, CNPJ, email, telefone ou endereço..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter - IDÊNTICO AO PROTÓTIPO */}
      <Tabs value={filterStatus} onValueChange={onFilterChange} className="w-auto">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="inactive">Inativos</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}