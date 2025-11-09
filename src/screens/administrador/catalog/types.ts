// Interfaces para o catálogo de serviços
export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: Category | null;
  price: number;
  duration_value: number;
  duration_type: 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual' | 'horas';
  status: 'active' | 'inactive';
  created_at: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  category_id: string;
  price: string;
  duration_value: string;
  duration_type: 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual' | 'horas';
}

export interface ServiceCatalogScreenProps {
  onBack?: () => void;
}

export interface Filters {
  searchTerm: string;
  filterStatus: string;
  filterCategory: string;
  viewMode: 'grid' | 'list';
}

export const emptyFormData: ServiceFormData = {
  name: '',
  description: '',
  category_id: '',
  price: '',
  duration_value: '',
  duration_type: 'horas'
};

// NOVAS INTERFACES PARA A ABA DE CATEGORIAS
export interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryFormData: { name: string; color: string };
  onCategoryFormDataChange: (data: { name: string; color: string }) => void;
  onSave: () => void;
  loading: boolean;
  editingCategory?: Category | null;
}

export interface DeleteCategoryDialogProps {
  deleteConfirmCategory: Category | null;
  onOpenChange: (category: Category | null) => void;
  onConfirm: () => void;
  loading: boolean;
}