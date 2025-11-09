import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Check, Power, FolderPlus, Tag, FolderOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import axios from 'axios';

// Importações dos componentes modulares
import { Service, ServiceFormData, Category, ServiceCatalogScreenProps, emptyFormData } from './catalog/types';
import { filterServices } from './catalog/utils';
import FiltersBar from './catalog/FiltersBar';
import ServiceList from './catalog/ServiceList';
import ServiceFormDialog from './catalog/ServiceFormDialog';
import CategoryDialog from './catalog/CategoryDialog';
import DeleteConfirmationDialog from './catalog/DeleteConfirmationDialog';
import CategoriesTab from './catalog/CategoriesTab';
import DeleteCategoryDialog from './catalog/DeleteCategoryDialog';

const API_URL = 'http://localhost:5000/api/manager';

export default function ServiceCatalogScreen({ onBack }: ServiceCatalogScreenProps) {
  // Estados para dados da API
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados da UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'services' | 'categories'>('services');
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmService, setDeleteConfirmService] = useState<Service | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<Category | null>(null);
  
  // Estados dos Formulários
  const [formData, setFormData] = useState<ServiceFormData>(emptyFormData);
  const [originalFormData, setOriginalFormData] = useState<ServiceFormData | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', color: '#6400A4' });

  // Estado para loading de ações
  const [actionLoading, setActionLoading] = useState(false);

  // Busca de dados
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/catalog`),
        axios.get(`${API_URL}/categories`)
      ]);
      
      if (!servicesRes.data || !categoriesRes.data) {
        throw new Error('Resposta da API inválida');
      }
      
      setServices(servicesRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError("Não foi possível carregar os dados. Verifique o backend.");
      toast.error("Erro ao carregar dados", { description: "Verifique a conexão com o servidor." });
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const filteredServices = filterServices(services, searchTerm, filterStatus, filterCategory);
  const activeCount = services.filter((s: Service) => s.status === 'active').length;
  const inactiveCount = services.filter((s: Service) => s.status === 'inactive').length;

  // Estatísticas de Categorias
  const getCategoryStats = () => {
    const totalCategories = categories.length;
    const usedCategories = categories.filter(category => 
      services.some(service => service.category?.id === category.id)
    ).length;
    const freeCategories = totalCategories - usedCategories;

    return { totalCategories, usedCategories, freeCategories };
  };

  const categoryStats = getCategoryStats();

  // Handlers de Serviços
  const handleOpenServiceDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      const initialFormData = {
        name: service.name,
        description: service.description,
        category_id: service.category?.id || '',
        price: service.price.toString(),
        duration_value: service.duration_value.toString(),
        duration_type: service.duration_type
      };
      setFormData(initialFormData);
      setOriginalFormData(initialFormData);
    } else {
      setEditingService(null);
      setFormData(emptyFormData);
      setOriginalFormData(null);
    }
    setIsServiceDialogOpen(true);
  };

  const handleCloseServiceDialog = () => {
    setIsServiceDialogOpen(false);
    setEditingService(null);
  };

  const hasServiceChanges = () => {
    if (!editingService) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const handleSaveService = async () => {
    if (actionLoading) return;
    
    if (!formData.name || !formData.category_id || !formData.price || !formData.duration_value) {
      toast.error('Campos obrigatórios', {
        description: 'Preencha todos os campos marcados com *'
      });
      return;
    }

    const price = parseFloat(formData.price);
    const durationValue = parseFloat(formData.duration_value);
    
    if (isNaN(price) || price < 0) {
      toast.error('Preço inválido', {
        description: 'O preço deve ser um valor numérico válido e positivo'
      });
      return;
    }
    
    if (isNaN(durationValue) || durationValue <= 0) {
      toast.error('Duração inválida', {
        description: 'A duração deve ser um valor numérico válido e maior que zero'
      });
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      category_id: formData.category_id,
      price: price,
      duration_value: durationValue,
      duration_type: formData.duration_type
    };

    setActionLoading(true);
    
    const loadingToast = toast.loading(
      editingService ? 'Atualizando serviço...' : 'Criando serviço...',
      {
        description: 'Aguarde enquanto salvamos suas alterações'
      }
    );

    try {
      if (editingService) {
        await axios.put(`${API_URL}/catalog/${editingService.id}`, payload);
        toast.dismiss(loadingToast);
        toast.success('Serviço atualizado!', {
          description: `"${payload.name}" foi atualizado com sucesso`,
          duration: 4000
        });
      } else {
        await axios.post(`${API_URL}/catalog`, payload);
        toast.dismiss(loadingToast);
        toast.success('Serviço criado!', {
          description: `"${payload.name}" foi adicionado ao catálogo`,
          duration: 4000
        });
      }
      
      await fetchData();
      handleCloseServiceDialog();
      
    } catch (err: any) {
      console.error("Erro ao salvar serviço:", err);
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          "Não foi possível salvar o serviço.";
      
      toast.error("Erro ao salvar", { 
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (service: Service) => {
    if (actionLoading) return;
    
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'ativando' : 'desativando';
    
    setActionLoading(true);
    
    const loadingToast = toast.loading(`${actionText} serviço...`, {
      description: `Alterando status de "${service.name}"`
    });

    try {
      await axios.put(`${API_URL}/catalog/${service.id}/status`, { status: newStatus });
      
      setServices(services.map(s => 
        s.id === service.id ? { ...s, status: newStatus } : s
      ));
      
      toast.dismiss(loadingToast);
      toast.success(
        `Serviço ${newStatus === 'active' ? 'ativado' : 'desativado'}!`,
        { 
          description: `"${service.name}" foi ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
          duration: 3000
        }
      );
    } catch (err: any) {
      console.error("Erro ao mudar status:", err);
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.message || 
                          "Não foi possível atualizar o status.";
      
      toast.error("Erro ao atualizar status", { 
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteService = (service: Service) => {
    setDeleteConfirmService(service);
  };

  const confirmDeleteService = async () => {
    if (!deleteConfirmService || actionLoading) return;
    
    setActionLoading(true);
    
    const loadingToast = toast.loading('Excluindo serviço...', {
      description: `Removendo "${deleteConfirmService.name}"`
    });

    try {
      await axios.delete(`${API_URL}/catalog/${deleteConfirmService.id}`);
      
      setServices(services.filter(s => s.id !== deleteConfirmService.id));
      
      toast.dismiss(loadingToast);
      toast.success('Serviço excluído!', {
        description: `"${deleteConfirmService.name}" foi removido do catálogo.`,
        duration: 4000
      });
      
      setDeleteConfirmService(null);
    } catch (err: any) {
      console.error("Erro ao deletar:", err);
      toast.dismiss(loadingToast);
      const description = err.response?.data?.message || 
                         err.response?.data?.error ||
                         "Não foi possível excluir o serviço.";
      
      toast.error("Erro ao excluir", { 
        description,
        duration: 5000
      });
      
      setDeleteConfirmService(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Handlers para Categorias
  const handleOpenCategoryDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        color: category.color
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', color: '#6400A4' });
    }
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteConfirmCategory(category);
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirmCategory || actionLoading) return;
    
    setActionLoading(true);
    const loadingToast = toast.loading('Excluindo categoria...', {
      description: `Removendo "${deleteConfirmCategory.name}"`
    });

    try {
      await axios.delete(`${API_URL}/categories/${deleteConfirmCategory.id}`);
      
      setCategories(categories.filter(c => c.id !== deleteConfirmCategory.id));
      
      toast.dismiss(loadingToast);
      toast.success('Categoria excluída!', {
        description: `"${deleteConfirmCategory.name}" foi removida.`,
        duration: 4000
      });
      
      setDeleteConfirmCategory(null);
    } catch (err: any) {
      console.error("Erro ao deletar categoria:", err);
      toast.dismiss(loadingToast);
      
      const description = err.response?.data?.message || 
                         "Não foi possível excluir a categoria.";
      
      toast.error("Erro ao excluir", { 
        description,
        duration: 5000
      });
      
      setDeleteConfirmCategory(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (actionLoading) return;
    
    if (!categoryFormData.name) {
      toast.error('Nome obrigatório', {
        description: 'Digite o nome da categoria'
      });
      return;
    }
    
    setActionLoading(true);
    const actionText = editingCategory ? 'Atualizando' : 'Criando';
    const loadingToast = toast.loading(`${actionText} categoria...`, {
      description: 'Aguarde enquanto salvamos a categoria'
    });

    try {
      if (editingCategory) {
        await axios.put(`${API_URL}/categories/${editingCategory.id}`, categoryFormData);
        toast.dismiss(loadingToast);
        toast.success('Categoria atualizada!', {
          description: `"${categoryFormData.name}" foi atualizada com sucesso`,
          duration: 4000
        });
      } else {
        await axios.post(`${API_URL}/categories`, categoryFormData);
        toast.dismiss(loadingToast);
        toast.success('Categoria criada!', {
          description: `"${categoryFormData.name}" foi adicionada com sucesso`,
          duration: 4000
        });
      }
      
      await fetchData();
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryFormData({ name: '', color: '#6400A4' });
      
    } catch (err: any) {
      console.error("Erro ao salvar categoria:", err);
      toast.dismiss(loadingToast);
      
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          "Não foi possível salvar a categoria.";
      
      toast.error("Erro ao salvar", { 
        description: errorMessage,
        duration: 5000
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Renderização
  if (loading) {
    return (
      <div className="h-full bg-gray-50 p-6 flex justify-center items-center">
        <p className="text-xl text-gray-700">Carregando catálogo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50 p-6 flex justify-center items-center bg-red-50">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <Button onClick={fetchData} className="ml-4">Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              {onBack && (
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center">
                  &larr; Voltar
                </button>
              )}
              <h1 className="text-2xl font-bold text-black">Catálogo de Serviços</h1>
              <p className="text-gray-500">Gerencie serviços, categorias e preços</p>
              
               {/* Tabs - Estilo igual ao filtro de status */}
                <div className="flex bg-gray-100 rounded-xl p-1 mt-4 w-fit">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === 'services' 
                      ? 'bg-white text-purple-700 shadow-sm border border-purple-200' 
                      : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Serviços
                </button>
                <button
                  onClick={() => setActiveTab('categories')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'categories' 
                      ? 'bg-white text-purple-700 shadow-sm border border-purple-200' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Categorias
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => handleOpenCategoryDialog()}
                variant="outline"
                style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                className="hover:bg-purple-50"
                disabled={actionLoading}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
              <Button
                onClick={() => handleOpenServiceDialog()}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                className="hover:opacity-90"
                disabled={actionLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Serviço
              </Button>
            </div>
          </div>

          {/* Stats Cards Dinâmicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTab === 'services' ? (
              // Cards para ABA DE SERVIÇOS
              <>
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
              </>
            ) : (
              // Cards para ABA DE CATEGORIAS
              <>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Categorias</p>
                      <p className="text-2xl" style={{ color: '#8B20EE' }}>{categoryStats.totalCategories}</p>
                    </div>
                    <FolderPlus className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Categorias em Uso</p>
                      <p className="text-2xl text-green-600">{categoryStats.usedCategories}</p>
                    </div>
                    <Tag className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Categorias Livres</p>
                      <p className="text-2xl text-blue-600">{categoryStats.freeCategories}</p>
                    </div>
                    <FolderOpen className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters - APENAS PARA ABA DE SERVIÇOS */}
      {activeTab === 'services' && (
        <FiltersBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onFilterStatusChange={setFilterStatus}
          filterCategory={filterCategory}
          onFilterCategoryChange={setFilterCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categories={categories}
          loading={actionLoading}
        />
      )}

      {/* Conteúdo das Tabs */}
      {activeTab === 'services' ? (
        <>
          {/* Services List */}
          <ServiceList
            services={filteredServices}
            viewMode={viewMode}
            searchTerm={searchTerm}
            onEditService={handleOpenServiceDialog}
            onToggleStatus={handleToggleStatus}
            onDeleteService={handleDeleteService}
            loading={actionLoading}
          />

          {/* Summary */}
          {filteredServices.length > 0 && (
            <div className="max-w-7xl mx-auto px-6 pb-6">
              <div className="p-4 bg-white rounded-xl text-center">
                <p className="text-sm text-gray-600">
                  Exibindo <span style={{ color: '#8B20EE' }}>{filteredServices.length}</span> de{' '}
                  <span style={{ color: '#8B20EE' }}>{services.length}</span> serviços
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-6">
          <CategoriesTab
            categories={categories}
            services={services}
            onOpenCategoryDialog={handleOpenCategoryDialog}
            onDeleteCategory={handleDeleteCategory}
            loading={actionLoading}
          />
        </div>
      )}

      {/* Modals */}
      <ServiceFormDialog
        open={isServiceDialogOpen}
        onOpenChange={handleCloseServiceDialog}
        editingService={editingService}
        formData={formData}
        onFormDataChange={setFormData}
        categories={categories}
        onSave={handleSaveService}
        loading={actionLoading}
        hasChanges={hasServiceChanges()}
      />

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        categoryFormData={categoryFormData}
        onCategoryFormDataChange={setCategoryFormData}
        onSave={handleSaveCategory}
        loading={actionLoading}
        editingCategory={editingCategory}
      />

      <DeleteConfirmationDialog
        deleteConfirmService={deleteConfirmService}
        onOpenChange={setDeleteConfirmService}
        onConfirm={confirmDeleteService}
        loading={actionLoading}
      />

      <DeleteCategoryDialog
        deleteConfirmCategory={deleteConfirmCategory}
        onOpenChange={setDeleteConfirmCategory}
        onConfirm={confirmDeleteCategory}
        loading={actionLoading}
      />
    </div>
  );
}