import { useState, useEffect } from 'react';
import ScreenHeader from '../../public/ScreenHeader';
import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';

import { useClients } from './hooks/useClients';
import { ClientStats } from './components/ClientStats';
import { ClientFilters } from './components/ClientFilters';
import { ClientList } from './components/ClientList';
import { ClientFormDialog } from './components/ClientFormDialog';
import { ClientViewDialog } from './components/ClientViewDialog';
import { DeleteClientDialog } from './components/DeleteClientDialog';
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
    updateClientLocations,
    removeClientLocation,
    addClientLocation,    // NOVO: Adicionado do hook
    updateClientLocation  // NOVO: Adicionado do hook
  } = useClients();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  // Sincroniza o cliente em visualização com a lista atualizada
  useEffect(() => {
    if (viewingClient && isViewOpen) {
      // Busca a versão mais recente deste cliente na lista atualizada
      const updatedClient = clients.find(c => c.id === viewingClient.id);
      
      // Se achou (e mudou algo), atualiza o estado do modal
      if (updatedClient && updatedClient !== viewingClient) {
        setViewingClient(updatedClient);
      }
    }
  }, [clients, viewingClient, isViewOpen]);

  // Cálculos para estatísticas
  const activeCount = clients.filter(c => c.status === 'active').length;
  const inactiveCount = clients.filter(c => c.status === 'inactive').length;
  const totalRevenue = clients.reduce((sum, c) => {
    if (!c.totalValue) return sum;
    const valueStr = c.totalValue.replace(/[R$\s.]/g, '').replace(',', '.');
    const value = parseFloat(valueStr);
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  // Filtragem de clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      `${client.address.street} ${client.address.number} ${client.address.neighborhood} ${client.address.city}`
        .toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Permissões
  const canDelete = userRole === 'admin'; 
  const canCreateEdit = userRole === 'admin' || userRole === 'manager';

  // Handlers
  const handleCreate = () => { setEditingClient(null); setIsFormOpen(true); };
  const handleEdit = (client: Client) => { setEditingClient(client); setIsFormOpen(true); };
  const handleView = (client: Client) => { setViewingClient(client); setIsViewOpen(true); };
  const handleDeleteClick = (client: Client) => { setClientToDelete(client); };
  
  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      const success = await deleteClient(clientToDelete.id);
      if (success) {
        setClientToDelete(null);
        // Se estava vendo o cliente que foi deletado, fecha o modal
        if (viewingClient?.id === clientToDelete.id) {
          setIsViewOpen(false);
          setViewingClient(null);
        }
      }
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

  const emptyFunction = () => {};

  return (
    <div className="h-full bg-gray-50">
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
                className="hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Cliente
              </Button>
            )}
          </div>
          <ClientStats total={clients.length} active={activeCount} inactive={inactiveCount} revenue={totalRevenue} />
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <ClientFilters 
            searchTerm={searchTerm} onSearchChange={setSearchTerm}
            filterStatus={filterStatus} onFilterChange={setFilterStatus}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <ClientList 
          clients={filteredClients}
          onView={handleView}
          onEdit={canCreateEdit ? handleEdit : emptyFunction} 
          onDelete={canDelete ? handleDeleteClick : undefined}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      <ClientFormDialog 
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingClient(null); }}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />

      {viewingClient && (
        <ClientViewDialog 
          isOpen={isViewOpen} 
          onClose={() => { setIsViewOpen(false); setViewingClient(null); }} 
          client={viewingClient} 
          onEdit={(client) => { 
            setIsViewOpen(false); 
            setEditingClient(client); 
            setIsFormOpen(true); 
          }}
          // ADIÇÃO: Funções novas para resolver o erro 404
          onAddLocation={addClientLocation}
          onUpdateLocation={updateClientLocation}
          onDeleteLocation={(locId) => removeClientLocation(viewingClient.id, locId)}
          // Mantido por compatibilidade
          onUpdateClientLocations={updateClientLocations}
          
          canDelete={canDelete} 
        />
      )}

      <DeleteClientDialog 
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleConfirmDelete}
        clientName={clientToDelete?.name}
      />
    </div>
  );
}