// src\screens\shared\clients\ClientsScreen.tsx - ATUALIZADO

import { useState } from 'react';
import ScreenHeader from '../../public/ScreenHeader';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';

import { useClients } from './hooks/useClients';
import { ClientStats } from './components/ClientStats';
import { ClientFilters } from './components/ClientFilters';
import { ClientList } from './components/ClientList';
import { ClientFormDialog } from './components/ClientFormDialog';
import { DeleteClientDialog } from './components/DeleteClientDialog';
import { ClientManagementScreen } from './components/ClientManagementScreen'; // NOVO IMPORT
import { Client } from './types/client';

interface ClientsScreenProps {
  onBack?: () => void;
  userRole?: 'admin' | 'manager';
}

export default function ClientsScreen({ onBack, userRole = 'admin' }: ClientsScreenProps) {
  const { 
    clients, 
    saveClient, 
    deleteClient, 
    toggleClientStatus, 
    addClientLocation,
    updateClientLocation,
    removeClientLocation
  } = useClients();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null); // NOVO ESTADO

  // Permissões
  const canDelete = userRole === 'admin'; 
  const canCreateEdit = userRole === 'admin' || userRole === 'manager';

  // Estatísticas
  const activeCount = clients.filter(c => c.status === 'active').length;
  const inactiveCount = clients.filter(c => c.status === 'inactive').length;
  const totalRevenue = clients.reduce((sum, c) => {
    if (!c.totalValue) return sum;
    const cleanValue = c.totalValue
      .replace('R$', '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim();
    const value = parseFloat(cleanValue);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  // Filtragem
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      client.name.toLowerCase().includes(searchLower) ||
      client.cnpj.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm) ||
      client.address.street.toLowerCase().includes(searchLower) ||
      client.address.neighborhood.toLowerCase().includes(searchLower) ||
      client.address.city.toLowerCase().includes(searchLower);
    
    const matchesStatus = filterStatus === 'todos' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Handlers
  const handleCreate = () => { 
    setEditingClient(null); 
    setIsFormOpen(true); 
  };

  const handleEdit = (client: Client) => { 
    if (!canCreateEdit) return;
    setEditingClient(client); 
    setIsFormOpen(true); 
  };

  const handleView = (client: Client) => { 
    setViewingClient(client); // AGORA MUDA PARA TELA DEDICADA
  };

  const handleDeleteClick = (client: Client) => { 
    if (!canDelete) return;
    setClientToDelete(client); 
  };
  
  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    
    const success = await deleteClient(clientToDelete.id);
    if (success) {
      setClientToDelete(null);
    }
  };

  const handleToggleStatus = async (clientId: number, currentStatus: string) => {
    await toggleClientStatus(clientId, currentStatus);
  };

  const handleSaveClient = async (clientData: any, isEditing: boolean, id?: number) => {
    const success = await saveClient(clientData, isEditing, id);
    if (success) {
      setIsFormOpen(false);
      setEditingClient(null);
    }
    return success;
  };

  const handleSaveClientFromManagement = async (clientData: any) => {
    const success = await saveClient(clientData, true, viewingClient?.id);
    return success;
  };

  // Funções para o gerenciamento de unidades
  const handleAddLocation = async (clientId: number, locationData: any) => {
    return await addClientLocation(clientId, locationData);
  };

  const handleUpdateLocation = async (clientId: number, locationId: string, locationData: any) => {
    return await updateClientLocation(clientId, locationId, locationData);
  };

  const handleDeleteLocation = async (clientId: number, locationId: string) => {
    await removeClientLocation(clientId, locationId);
  };

  // Função vazia para quando não há permissão
  const emptyFunction = () => {};

  // Se estamos visualizando um cliente, mostra a tela de gerenciamento
  if (viewingClient) {
    return (
      <ClientManagementScreen
        client={viewingClient}
        onBack={() => setViewingClient(null)}
        onSaveClient={handleSaveClientFromManagement}
        onAddLocation={handleAddLocation}
        onUpdateLocation={handleUpdateLocation}
        onDeleteLocation={handleDeleteLocation}
        onToggleClientStatus={toggleClientStatus}
        userRole={userRole}
      />
    );
  }

  // Tela principal de lista de clientes
  return (
    <div className="h-full bg-gray-50">
      {/* Header com estatísticas */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ScreenHeader 
                title="Gestão de Clientes"
                description="Gerencie todos os clientes e histórico de serviços"
                onBack={onBack}
              />
            </div>
            {canCreateEdit && (
              <Button 
                onClick={handleCreate}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                className="hover:opacity-90 transition-opacity shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" /> 
                Adicionar Cliente
              </Button>
            )}
          </div>
          
          <ClientStats 
            total={clients.length} 
            active={activeCount} 
            inactive={inactiveCount} 
            revenue={totalRevenue} 
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <ClientFilters 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus} 
            onFilterChange={setFilterStatus}
          />
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="max-w-7xl mx-auto p-6">
        <ClientList 
          clients={filteredClients}
          onView={handleView} // AGORA LEVA PARA TELA DEDICADA
          onEdit={canCreateEdit ? handleEdit : emptyFunction}
          onDelete={canDelete ? handleDeleteClick : undefined}
          onToggleStatus={canCreateEdit ? handleToggleStatus : emptyFunction}
        />
      </div>

      {/* Diálogos */}
      <ClientFormDialog 
        isOpen={isFormOpen}
        onClose={() => { 
          setIsFormOpen(false); 
          setEditingClient(null); 
        }}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />

      <DeleteClientDialog 
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleConfirmDelete}
        clientName={clientToDelete?.name}
      />
    </div>
  );
}