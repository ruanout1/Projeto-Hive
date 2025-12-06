import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Card, CardContent } from '../../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { PhotoReviewFilters } from '../types';

interface PhotoFiltersProps {
  searchTerm: string;
  filterArea: string;
  filterManager: string;
  uniqueManagers: string[];
  onSearchChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onManagerChange: (value: string) => void;
  originalFilters: PhotoReviewFilters;
  setOriginalFilters: (filters: PhotoReviewFilters) => void;
  isAdmin: boolean;
}

export function PhotoFilters({
  searchTerm,
  filterArea,
  filterManager,
  uniqueManagers,
  onSearchChange,
  onAreaChange,
  onManagerChange,
  originalFilters,
  setOriginalFilters,
  isAdmin
}: PhotoFiltersProps) {
  const handleTabChange = (value: string) => {
    setOriginalFilters({ ...originalFilters, status: value as any });
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        {/* Tabs para status (pendente/sent/all) */}
        <div className="mb-4">
          <Tabs value={originalFilters.status} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
              <TabsTrigger value="pending" disabled={isAdmin}>Pendentes</TabsTrigger>
              <TabsTrigger value="sent">Enviados</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Filtros adicionais - Layout dinâmico baseado no papel */}
        <div className={`grid ${isAdmin ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-4`}>
          <div className={isAdmin ? '' : 'md:col-span-1'}>
            <Input
              placeholder="Buscar por cliente, colaborador, serviço..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select value={filterArea} onValueChange={onAreaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as áreas</SelectItem>
                <SelectItem value="norte">Norte</SelectItem>
                <SelectItem value="sul">Sul</SelectItem>
                <SelectItem value="leste">Leste</SelectItem>
                <SelectItem value="oeste">Oeste</SelectItem>
                <SelectItem value="centro">Centro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isAdmin && (
            <div>
              <Select value={filterManager} onValueChange={onManagerChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os gestores</SelectItem>
                  {uniqueManagers.map(manager => (
                    <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}