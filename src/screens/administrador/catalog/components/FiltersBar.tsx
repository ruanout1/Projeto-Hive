import { Search } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Category } from '../types';
import { Grid3x3, List } from 'lucide-react';

interface FiltersBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  categories: Category[];
  loading: boolean;
}

export default function FiltersBar({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterCategory,
  onFilterCategoryChange,
  viewMode,
  onViewModeChange,
  categories,
  loading
}: FiltersBarProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou descrição do serviço..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>

          {/* Category Filter */}
          <Select value={filterCategory} onValueChange={onFilterCategoryChange} disabled={loading}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Tabs value={filterStatus} onValueChange={onFilterStatusChange} className="w-auto">
            <TabsList>
              <TabsTrigger value="todos" disabled={loading}>Todos</TabsTrigger>
              <TabsTrigger value="active" disabled={loading}>Ativos</TabsTrigger>
              <TabsTrigger value="inactive" disabled={loading}>Inativos</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* View Mode */}
          <div className="flex space-x-1 border border-gray-200 rounded-md p-1">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-purple-100' : 'hover:bg-gray-100'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={viewMode === 'grid' ? { color: '#8B20EE' } : {}}
              disabled={loading}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-purple-100' : 'hover:bg-gray-100'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={viewMode === 'list' ? { color: '#8B20EE' } : {}}
              disabled={loading}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
