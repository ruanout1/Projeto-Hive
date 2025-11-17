import { Edit, Power, Trash2, ClipboardList } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Service } from './types';
import { formatPrice, formatDuration, HighlightText } from './utils';

interface ServiceListProps {
  services: Service[];
  viewMode: 'grid' | 'list';
  searchTerm: string;
  onEditService: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onDeleteService: (service: Service) => void;
  loading: boolean;
}

export default function ServiceList({
  services,
  viewMode,
  searchTerm,
  onEditService,
  onToggleStatus,
  onDeleteService,
  loading
}: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center">
        <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="text-gray-500">Nenhum serviço encontrado</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {viewMode === 'grid' ? (
        <GridView
          services={services}
          viewMode={viewMode}
          searchTerm={searchTerm}
          onEditService={onEditService}
          onToggleStatus={onToggleStatus}
          onDeleteService={onDeleteService}
          loading={loading}
        />
      ) : (
        <ListView
          services={services}
          viewMode={viewMode}
          searchTerm={searchTerm}
          onEditService={onEditService}
          onToggleStatus={onToggleStatus}
          onDeleteService={onDeleteService}
          loading={loading}
        />
      )}
    </div>
  );
}

// Componente para visualização em grid
function GridView({
  services,
  viewMode,
  searchTerm,
  onEditService,
  onToggleStatus,
  onDeleteService,
  loading
}: ServiceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          searchTerm={searchTerm}
          onEditService={onEditService}
          onToggleStatus={onToggleStatus}
          onDeleteService={onDeleteService}
          loading={loading}
        />
      ))}
    </div>
  );
}

// Componente para visualização em lista
function ListView({
  services,
  viewMode,
  searchTerm,
  onEditService,
  onToggleStatus,
  onDeleteService,
  loading
}: ServiceListProps) {
  return (
    <div className="space-y-3">
      {services.map((service) => (
        <ServiceListItem
          key={service.id}
          service={service}
          searchTerm={searchTerm}
          onEditService={onEditService}
          onToggleStatus={onToggleStatus}
          onDeleteService={onDeleteService}
          loading={loading}
        />
      ))}
    </div>
  );
}

// Card individual do serviço (Grid)
function ServiceCard({
  service,
  searchTerm,
  onEditService,
  onToggleStatus,
  onDeleteService,
  loading
}: {
  service: Service;
  searchTerm: string;
  onEditService: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onDeleteService: (service: Service) => void;
  loading: boolean;
}) {
  const category = service.category;

  return (
    <div className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 style={{ color: '#8B20EE' }}>
              <HighlightText text={service.name} searchTerm={searchTerm} />
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
          <p className="text-sm">{formatDuration(service.duration_value, service.duration_type)}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditService(service)}
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
          onClick={() => onToggleStatus(service)}
          style={{
            borderColor: service.status === 'active' ? '#EF4444' : '#10B981',
            color: service.status === 'active' ? '#EF4444' : '#10B981'
          }}
          className={`flex-1 ${service.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
          disabled={loading}
        >
          <Power className="h-3 w-3 mr-1" />
          {service.status === 'active' ? 'Desativar' : 'Ativar'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeleteService(service)}
          style={{ borderColor: '#EF4444', color: '#EF4444' }}
          className="hover:bg-red-50"
          disabled={loading}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// Item individual do serviço (Lista)
function ServiceListItem({
  service,
  searchTerm,
  onEditService,
  onToggleStatus,
  onDeleteService,
  loading
}: {
  service: Service;
  searchTerm: string;
  onEditService: (service: Service) => void;
  onToggleStatus: (service: Service) => void;
  onDeleteService: (service: Service) => void;
  loading: boolean;
}) {
  const category = service.category;

  return (
    <div className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 style={{ color: '#8B20EE' }}>
              <HighlightText text={service.name} searchTerm={searchTerm} />
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
              Duração: <span className="text-black">{formatDuration(service.duration_value, service.duration_type)}</span>
            </span>
            <span className="text-xs text-gray-400">Criado em {new Date(service.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditService(service)}
            style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
            className="hover:bg-purple-50"
            disabled={loading}
          >
            <Edit className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(service)}
            style={{
              borderColor: service.status === 'active' ? '#EF4444' : '#10B981',
              color: service.status === 'active' ? '#EF4444' : '#10B981'
            }}
            className={service.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}
            disabled={loading}
          >
            <Power className="h-3 w-3 mr-1" />
            {service.status === 'active' ? 'Desativar' : 'Ativar'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteService(service)}
            style={{ borderColor: '#EF4444', color: '#EF4444' }}
            className="hover:bg-red-50"
            disabled={loading}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
