import { useState } from 'react';
import { ClipboardList, Plus, Edit, Power, Search, Trash2, Check, FolderPlus, Grid3x3, List } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { HighlightText } from './ui/search-highlight';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner';
import React from 'react';


interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  durationType: 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual' | 'horas';
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Limpeza Residencial', color: '#6400A4' },
  { id: '2', name: 'Limpeza Comercial', color: '#8B20EE' },
  { id: '3', name: 'Jardinagem', color: '#10B981' },
  { id: '4', name: 'Manutenção', color: '#35BAE6' },
  { id: '5', name: 'Pintura', color: '#F59E0B' },
  { id: '6', name: 'Segurança', color: '#EF4444' },
  { id: '7', name: 'Portaria | Recepção', color: '#8B5CF6' }
];

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Limpeza Completa Residencial',
    description: 'Limpeza completa de todos os cômodos, incluindo banheiros, cozinha e quartos',
    category: '1',
    price: 250.00,
    duration: 4,
    durationType: 'horas',
    status: 'active',
    createdAt: '10/01/2025'
  },
  {
    id: '2',
    name: 'Limpeza Pós-Obra',
    description: 'Limpeza pesada após reforma ou construção',
    category: '2',
    price: 450.00,
    duration: 6,
    durationType: 'horas',
    status: 'active',
    createdAt: '08/01/2025'
  },
  {
    id: '3',
    name: 'Manutenção de Jardim',
    description: 'Poda, corte de grama e manutenção geral do jardim',
    category: '3',
    price: 180.00,
    duration: 1,
    durationType: 'mensal',
    status: 'active',
    createdAt: '05/01/2025'
  },
  {
    id: '4',
    name: 'Pintura Interna',
    description: 'Pintura de ambientes internos com tinta premium',
    category: '5',
    price: 800.00,
    duration: 1,
    durationType: 'diaria',
    status: 'inactive',
    createdAt: '03/01/2025'
  },
  {
    id: '5',
    name: 'Segurança Patrimonial',
    description: 'Serviço de vigilância e monitoramento de patrimônio',
    category: '6',
    price: 3500.00,
    duration: 1,
    durationType: 'mensal',
    status: 'active',
    createdAt: '15/09/2025'
  },
  {
    id: '6',
    name: 'Portaria e Recepção',
    description: 'Atendimento de portaria e recepção com profissionais qualificados',
    category: '7',
    price: 2800.00,
    duration: 1,
    durationType: 'mensal',
    status: 'active',
    createdAt: '20/09/2025'
  }
];

export default function ServiceCatalogScreen() {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteConfirmService, setDeleteConfirmService] = useState<Service | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    duration: '',
    durationType: 'horas' as 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual' | 'horas'
  });

  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    color: '#6400A4'
  });

  const activeCount = services.filter(s => s.status === 'active').length;
  const inactiveCount = services.filter(s => s.status === 'inactive').length;

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || service.status === filterStatus;
    const matchesCategory = filterCategory === 'todas' || service.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleOpenServiceDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price.toString(),
        duration: service.duration.toString(),
        durationType: service.durationType
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        duration: '',
        durationType: 'horas'
      });
    }
    setIsServiceDialogOpen(true);
  };

  const handleCloseServiceDialog = () => {
    setIsServiceDialogOpen(false);
    setEditingService(null);
  };

  const handleSaveService = () => {
    if (!formData.name || !formData.category || !formData.price || !formData.duration) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingService) {
      setServices(services.map(s => 
        s.id === editingService.id 
          ? { 
              ...s, 
              name: formData.name,
              description: formData.description,
              category: formData.category,
              price: parseFloat(formData.price),
              duration: parseFloat(formData.duration),
              durationType: formData.durationType
            }
          : s
      ));
      toast.success('Serviço atualizado com sucesso!', {
        description: `O serviço "${formData.name}" foi atualizado.`
      });
    } else {
      const newService: Service = {
        id: (services.length + 1).toString(),
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        duration: parseFloat(formData.duration),
        durationType: formData.durationType,
        status: 'active',
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      setServices([...services, newService]);
      toast.success('Serviço criado com sucesso!', {
        description: `O serviço "${formData.name}" foi adicionado ao catálogo.`
      });
    }
    handleCloseServiceDialog();
  };

  const handleToggleStatus = (service: Service) => {
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    setServices(services.map(s => 
      s.id === service.id 
        ? { ...s, status: newStatus }
        : s
    ));
    toast.success(
      `Serviço ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`,
      { description: `O serviço "${service.name}" foi ${newStatus === 'active' ? 'ativado' : 'desativado'}.` }
    );
  };

  const handleDeleteService = (service: Service) => {
    setDeleteConfirmService(service);
  };

  const confirmDeleteService = () => {
    if (deleteConfirmService) {
      setServices(services.filter(s => s.id !== deleteConfirmService.id));
      toast.success('Serviço excluído com sucesso!', {
        description: `O serviço "${deleteConfirmService.name}" foi removido do catálogo.`
      });
      setDeleteConfirmService(null);
    }
  };

  const handleSaveCategory = () => {
    if (!categoryFormData.name) {
      toast.error('Digite o nome da categoria');
      return;
    }

    const newCategory: Category = {
      id: (categories.length + 1).toString(),
      name: categoryFormData.name,
      color: categoryFormData.color
    };
    setCategories([...categories, newCategory]);
    toast.success('Categoria criada com sucesso!', {
      description: `A categoria "${categoryFormData.name}" foi adicionada.`
    });
    setIsCategoryDialogOpen(false);
    setCategoryFormData({ name: '', color: '#6400A4' });
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const formatDuration = (duration: number, durationType: string) => {
    const typeLabels: { [key: string]: string } = {
      'diaria': duration === 1 ? 'diária' : 'diárias',
      'semanal': duration === 1 ? 'semana' : 'semanas',
      'quinzenal': duration === 1 ? 'quinzena' : 'quinzenas',
      'mensal': duration === 1 ? 'mês' : 'meses',
      'anual': duration === 1 ? 'ano' : 'anos',
      'horas': duration === 1 ? 'hora' : 'horas'
    };
    
    return `${duration} ${typeLabels[durationType] || 'horas'}`;
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                <ClipboardList className="h-6 w-6" style={{ color: '#8B20EE' }} />
              </div>
              <div>
                <h1 className="hive-screen-title">Catálogo de Serviços</h1>
                <p className="text-sm text-gray-600">
                  Gerencie serviços, categorias e preços
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setIsCategoryDialogOpen(true)}
                variant="outline"
                style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                className="hover:bg-purple-50"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
              <Button
                onClick={() => handleOpenServiceDialog()}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                className="hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Serviços</p>
                  <p className="text-2xl" style={{ color: '#8B20EE' }}>{services.length}</p>
                </div>
                <ClipboardList className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Serviços Ativos</p>
                  <p className="text-2xl text-green-600">{activeCount}</p>
                </div>
                <Check className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Serviços Inativos</p>
                  <p className="text-2xl text-red-600">{inactiveCount}</p>
                </div>
                <Power className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFFF20' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Categorias</p>
                  <p className="text-2xl text-gray-800">{categories.length}</p>
                </div>
                <FolderPlus className="h-8 w-8 text-gray-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou descrição do serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
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
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* View Mode */}
            <div className="flex space-x-1 border border-gray-200 rounded-md p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-purple-100' : 'hover:bg-gray-100'}`}
                style={viewMode === 'grid' ? { color: '#8B20EE' } : {}}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-purple-100' : 'hover:bg-gray-100'}`}
                style={viewMode === 'list' ? { color: '#8B20EE' } : {}}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services List/Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-gray-500">Nenhum serviço encontrado</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => {
              const category = getCategoryById(service.category);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 style={{ color: '#8B20EE' }}>
                          <HighlightText text={service.name} searchTerm={searchTerm} highlightClassName="search-highlight" />
                        </h3>
                      </div>
                      {category && (
                        <Badge style={{ backgroundColor: category.color, color: 'white' }} className="mb-2">
                          {category.name}
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={service.status === 'active' ? 'default' : 'secondary'}
                      style={service.status === 'active' ? { backgroundColor: '#10B981', color: 'white' } : {}}
                    >
                      {service.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Preço</p>
                      <p style={{ color: '#6400A4' }}>{formatPrice(service.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Duração</p>
                      <p className="text-sm">{formatDuration(service.duration, service.durationType)}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenServiceDialog(service)}
                      style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                      className="flex-1 hover:bg-purple-50"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(service)}
                      style={{
                        borderColor: service.status === 'active' ? '#EF4444' : '#10B981',
                        color: service.status === 'active' ? '#EF4444' : '#10B981'
                      }}
                      className={`flex-1 ${service.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
                    >
                      <Power className="h-3 w-3 mr-1" />
                      {service.status === 'active' ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service)}
                      style={{ borderColor: '#EF4444', color: '#EF4444' }}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredServices.map((service) => {
              const category = getCategoryById(service.category);
              return (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 style={{ color: '#8B20EE' }}>
                          <HighlightText text={service.name} searchTerm={searchTerm} highlightClassName="search-highlight" />
                        </h3>
                        {category && (
                          <Badge style={{ backgroundColor: category.color, color: 'white' }}>
                            {category.name}
                          </Badge>
                        )}
                        <Badge
                          variant={service.status === 'active' ? 'default' : 'secondary'}
                          style={service.status === 'active' ? { backgroundColor: '#10B981', color: 'white' } : {}}
                        >
                          {service.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex items-center space-x-6 text-sm">
                        <span className="text-gray-500">
                          Preço: <span style={{ color: '#6400A4' }}>{formatPrice(service.price)}</span>
                        </span>
                        <span className="text-gray-500">
                          Duração: <span className="text-black">{formatDuration(service.duration, service.durationType)}</span>
                        </span>
                        <span className="text-xs text-gray-400">Criado em {service.createdAt}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenServiceDialog(service)}
                        style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                        className="hover:bg-purple-50"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(service)}
                        style={{
                          borderColor: service.status === 'active' ? '#EF4444' : '#10B981',
                          color: service.status === 'active' ? '#EF4444' : '#10B981'
                        }}
                        className={service.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}
                      >
                        <Power className="h-3 w-3 mr-1" />
                        {service.status === 'active' ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service)}
                        style={{ borderColor: '#EF4444', color: '#EF4444' }}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {filteredServices.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Exibindo <span style={{ color: '#8B20EE' }}>{filteredServices.length}</span> de{' '}
              <span style={{ color: '#8B20EE' }}>{services.length}</span> serviços
            </p>
          </div>
        )}
      </div>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={handleCloseServiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
            <DialogDescription>
              {editingService ? 'Atualize as informações do serviço' : 'Adicione um novo serviço ao catálogo'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="serviceName" style={{ color: '#8B20EE' }}>Nome do Serviço *</Label>
              <Input
                id="serviceName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Limpeza Completa Residencial"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="serviceDescription" style={{ color: '#8B20EE' }}>Descrição</Label>
              <Textarea
                id="serviceDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva os detalhes do serviço..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceCategory" style={{ color: '#8B20EE' }}>Categoria *</Label>
                <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="servicePrice" style={{ color: '#8B20EE' }}>Preço (R$) *</Label>
                <Input
                  id="servicePrice"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0,00"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceDurationType" style={{ color: '#8B20EE' }}>Tipo de Duração *</Label>
                <Select 
                  value={formData.durationType} 
                  onValueChange={(value: 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual' | 'horas') => 
                    setFormData({ ...formData, durationType: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diaria">Diária</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                    <SelectItem value="horas">Horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="serviceDuration" style={{ color: '#8B20EE' }}>
                  {formData.durationType === 'horas' ? 'Quantidade de Horas *' : 'Quantidade *'}
                </Label>
                <Input
                  id="serviceDuration"
                  type="number"
                  step={formData.durationType === 'horas' ? '0.5' : '1'}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder={formData.durationType === 'horas' ? 'Ex: 4' : 'Ex: 1'}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseServiceDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveService}
              disabled={!formData.name || !formData.category || !formData.price || !formData.duration}
              style={{ backgroundColor: '#8B20EE', color: 'white' }}
              className="hover:opacity-90"
            >
              <Check className="h-4 w-4 mr-2" />
              {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria de serviços
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="categoryName" style={{ color: '#8B20EE' }}>Nome da Categoria *</Label>
              <Input
                id="categoryName"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                placeholder="Ex: Limpeza Residencial"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="categoryColor" style={{ color: '#8B20EE' }}>Cor</Label>
              <div className="flex space-x-2 mt-1">
                {['#6400A4', '#8B20EE', '#10B981', '#35BAE6', '#F59E0B', '#EF4444'].map(color => (
                  <button
                    key={color}
                    onClick={() => setCategoryFormData({ ...categoryFormData, color })}
                    className={`w-10 h-10 rounded-lg transition-transform ${categoryFormData.color === color ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={!categoryFormData.name}
              style={{ backgroundColor: '#8B20EE', color: 'white' }}
              className="hover:opacity-90"
            >
              <Check className="h-4 w-4 mr-2" />
              Criar Categoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmService} onOpenChange={() => setDeleteConfirmService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#8B20EE' }}>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#000000' }}>
              Tem certeza que deseja excluir o serviço <strong>{deleteConfirmService?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteService}
              style={{ backgroundColor: '#EF4444', color: 'white' }}
              className="hover:opacity-90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}