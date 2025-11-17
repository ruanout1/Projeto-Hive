import { FolderOpen, Tag, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Category, Service } from './types';

interface CategoriesTabProps {
  categories: Category[];
  services: Service[];
  onOpenCategoryDialog: (category?: Category) => void;
  onDeleteCategory: (category: Category) => void;
  loading: boolean;
}

export default function CategoriesTab({
  categories,
  services,
  onOpenCategoryDialog,
  onDeleteCategory,
  loading
}: CategoriesTabProps) {
  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-gray-500">Nenhuma categoria cadastrada</p>
          <Button
            onClick={() => onOpenCategoryDialog()}
            style={{ backgroundColor: '#8B20EE', color: 'white' }}
            className="hover:opacity-90 mt-4"
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Categoria
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => {
            const servicesUsingCategory = services.filter(s => s.category?.id === category.id).length;
            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 style={{ color: '#8B20EE' }} className="mb-1">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {servicesUsingCategory} serviço{servicesUsingCategory !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100"></div>

                <div className="flex space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenCategoryDialog(category)}
                    style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                    className="flex-1 hover:bg-purple-50"
                    disabled={loading}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteCategory(category)}
                    disabled={servicesUsingCategory > 0 || loading}
                    style={{ borderColor: '#EF4444', color: '#EF4444' }}
                    className="flex-1 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={servicesUsingCategory > 0 ? 'Categoria em uso não pode ser excluída' : 'Excluir categoria'}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {categories.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-xl text-center">
          <p className="text-sm text-gray-600">
            Total de <span style={{ color: '#8B20EE' }}>{categories.length}</span> categoria{categories.length !== 1 ? 's' : ''} cadastrada{categories.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}
