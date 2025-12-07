import { FolderOpen, Edit, Trash2, Plus, Sparkles, Users, Droplet, Shield, Wrench, Hammer, PaintBucket, Hash, Tag } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Category, Service } from '../types';

// Mapa de Ícones (String do Banco -> Componente Lucide)
const iconMap: { [key: string]: any } = {
    'Sparkles': Sparkles,
    'Users': Users,
    'Droplet': Droplet,
    'Shield': Shield,
    'Wrench': Wrench,
    'Hammer': Hammer,
    'PaintBucket': PaintBucket,
    'Hash': Hash,
    'Tag': Tag
};

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

  // Função para renderizar o ícone correto
  const getIcon = (iconName?: string) => {
      const IconComponent = iconMap[iconName || 'Hash'] || Hash; // Hash é o padrão
      return <IconComponent className="h-6 w-6 text-white" />;
  };

  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-30 text-gray-400" />
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
            const isSystem = category.isSystem; 

            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-100 shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Ícone com fundo colorido */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: category.color }}
                    >
                      {getIcon(category.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 style={{ color: '#8B20EE' }} className="mb-1 font-semibold text-lg">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {servicesUsingCategory} serviço{servicesUsingCategory !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação (Apenas para customizadas) */}
                {!isSystem && (
                    <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-50">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenCategoryDialog(category)}
                        style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                        className="flex-1 hover:bg-purple-50 h-8"
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
                        className="flex-1 hover:bg-red-50 disabled:opacity-50 h-8"
                        title={servicesUsingCategory > 0 ? 'Categoria em uso' : 'Excluir'}
                    >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                    </Button>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}