// /shared/clients/components/ClientCard.tsx - NOVO COMPONENTE
import { Eye, Edit, Trash2, Power, MapPin, Phone, Mail, FileText, Calendar, Star } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../../../components/ui/avatar';
import { Client } from '../types/client';

interface ClientCardProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onToggleStatus: (id: number, status: string) => void;
}

export function ClientCard({ client, onView, onEdit, onDelete, onToggleStatus }: ClientCardProps) {
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Endereço não informado';
    return [address.street, address.number, address.neighborhood, address.city, address.state]
      .filter(Boolean).join(', ');
  };

  return (
    <div className="bg-white rounded-2xl p-5 hover:shadow-md transition-all border-2 border-transparent hover:border-gray-100">
      <div className="flex items-center justify-between">
        {/* Client Info */}
        <div className="flex items-center space-x-4 flex-1">
          <Avatar 
            className="h-12 w-12" 
            style={{ backgroundColor: client.status === 'active' ? '#6400A4' : '#9CA3AF' }}
          >
            <AvatarFallback 
              style={{ 
                backgroundColor: client.status === 'active' ? '#6400A4' : '#9CA3AF', 
                color: 'white' 
              }}
            >
              {getInitials(client.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 style={{ color: '#6400A4' }} className="text-lg font-semibold">
                {client.name}
              </h3>
              <Badge
                variant={client.status === 'active' ? 'default' : 'secondary'}
                style={client.status === 'active' ? { backgroundColor: '#10B981', color: 'white' } : {}}
              >
                {client.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
              {client.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">{client.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Informações de Contato - Layout do Protótipo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600 mb-2">
              <div className="flex items-center space-x-2 min-w-0">
                <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#6400A4' }} />
                <span className="truncate">{client.cnpj}</span>
              </div>
              <div className="flex items-center space-x-2 min-w-0">
                <Mail className="h-4 w-4 flex-shrink-0" style={{ color: '#6400A4' }} />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center space-x-2 min-w-0">
                <Phone className="h-4 w-4 flex-shrink-0" style={{ color: '#6400A4' }} />
                <span className="truncate">{client.phone}</span>
              </div>
            </div>

            {/* Endereço */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
              <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
              <span className="truncate">{formatAddress(client.address)}</span>
            </div>

            {/* Estatísticas - Layout do Protótipo */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <span>Serviços Ativos: <span style={{ color: '#6400A4' }}>{client.servicesActive}</span></span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Concluídos: <span className="text-green-600">{client.servicesCompleted}</span></span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" style={{ color: '#8B20EE' }} />
                <span>Último: {client.lastService}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>Total: <span style={{ color: '#6400A4' }}>{client.totalValue}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Layout do Protótipo */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(client)}
            style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
            className="hover:bg-blue-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(client)}
            style={{ borderColor: '#6400A4', color: '#6400A4' }}
            className="hover:bg-purple-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(client.id, client.status)}
            style={{
              borderColor: client.status === 'active' ? '#EF4444' : '#10B981',
              color: client.status === 'active' ? '#EF4444' : '#10B981'
            }}
            className={client.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}
          >
            <Power className="h-4 w-4 mr-2" />
            {client.status === 'active' ? 'Desativar' : 'Ativar'}
          </Button>

          {/* Botão Excluir Condicional (Só Admin) */}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(client)}
              style={{ borderColor: '#EF4444', color: '#EF4444' }}
              className="hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}