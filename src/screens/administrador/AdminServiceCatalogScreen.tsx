import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Check, Power, FolderPlus, Tag, FolderOpen } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import api from '../../lib/api';
import { Service, ServiceFormData, Category, ServiceCatalogScreenProps, emptyFormData } from './catalog/types';
import { filterServices } from './catalog/utils';
import FiltersBar from './catalog/FiltersBar';
import ServiceList from './catalog/ServiceList';
import ServiceFormDialog from './catalog/ServiceFormDialog';
import CategoryDialog from './catalog/CategoryDialog';
import DeleteConfirmationDialog from './catalog/DeleteConfirmationDialog';
import CategoriesTab from './catalog/CategoriesTab';
import DeleteCategoryDialog from './catalog/DeleteCategoryDialog';
import { useCatalog } from './catalog/hooks/useCatalog';
import { useCatalogMutations } from './catalog/hooks/useCatalogMutations';

export default function ServiceCatalogScreen({ onBack }: ServiceCatalogScreenProps) {
  const {
    services,
    setServices,
    categories,
    setCategories,
    loading,
    error,
    refetch,
  } = useCatalog();

  const {
    actionLoading,
    saveService,
    toggleServiceStatus,
    deleteService,
    saveCategory,
    deleteCategory,
  } = useCatalogMutations(refetch);

  // UI states
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

  // Form states
  const [formData, setFormData] = useState<ServiceFormData>(emptyFormData);
  const [originalFormData, setOriginalFormData] = useState<ServiceFormData | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '', color: '#6400A4' });

  // UI logic
  const filteredServices = filterServices(services, searchTerm, filterStatus, filterCategory);
  const activeCount = services.filter((s: Service) => s.status === 'active').length;
  const inactiveCount = services.filter((s: Service) => s.status === 'inactive').length;

  const getCategoryStats = () => {
    const totalCategories = categories.length;
    const usedCategories = categories.filter(category =>
      services.some(service => service.category?.id === category.id)
    ).length;
    const freeCategories = totalCategories - usedCategories;
    return { totalCategories, usedCategories, freeCategories };
  };
  const categoryStats = getCategoryStats();

  // Handlers
  const handleOpenServiceDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      const initialFormData: ServiceFormData = {
        name: service.name,
        description: service.description,
        category_id: service.category?.id || '',
        price: service.price,
        duration_value: service.duration_value,
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

  const handleDeleteService = (service: Service) => {
    setDeleteConfirmService(service);
  };

  const handleDeleteCategory = (category: Category) => {
    setDeleteConfirmCategory(category);
  };

  // Action handlers
  const handleSaveService = async () => {
    // Validação
    if (!formData.name || !formData.category_id || typeof formData.price !== 'number' || typeof formData.duration_value !== 'number') {
      toast.error('Campos obrigatórios', { description: 'Preencha todos os campos marcados com *' });
      return;
    }

    const price = Number(formData.price);
    const durationValue = Number(formData.duration_value);

    if (isNaN(price) || price < 0) {
      toast.error('Preço inválido'); return;
    }
    if (isNaN(durationValue) || durationValue <= 0) {
      toast.error('Duração inválida'); return;
    }

    const payload = { ...formData, price, duration_value: durationValue } as any;

    const success = await saveService(payload, editingService);
    if (success) {
      handleCloseServiceDialog();
    }
  };

  const handleToggleStatus = async (service: Service) => {
    const updatedService = await toggleServiceStatus(service);
    if (updatedService) {
      setServices(services.map(s =>
        s.id === service.id ? updatedService : s
      ));
    }
  };

  const confirmDeleteService = async () => {
    if (!deleteConfirmService) return;
    const success = await deleteService(deleteConfirmService);
    if (success) {
      setDeleteConfirmService(null);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!deleteConfirmCategory) return;
    const success = await deleteCategory(deleteConfirmCategory);
    if (success) {
      setDeleteConfirmCategory(null);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name) {
      toast.error('Nome obrigatório');
      return;
    }

    const success = await saveCategory(categoryFormData, editingCategory);
    if (success) {
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      setCategoryFormData({ name: '', color: '#6400A4' });
    }
  };

  // Render
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
          <Button onClick={refetch} className="ml-4">Tentar Novamente</Button>
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

              {/* Tabs */}
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
