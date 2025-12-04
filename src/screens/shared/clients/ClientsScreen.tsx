// /shared/clients/ClientsScreen.tsx - VERSÃO CORRIGIDA
import { useState } from 'react';
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
  const { clients, saveClient, deleteClient, toggleClientStatus, updateClientLocations } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

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

  // Permissões baseadas no tipo de usuário
  const canDelete = userRole === 'admin';
  const canCreateEdit = userRole === 'admin' || userRole === 'manager';

  // Handlers
  const handleCreate = () => { 
    setEditingClient(null); 
    setIsFormOpen(true); 
  };

  const handleEdit = (client: Client) => { 
    setEditingClient(client); 
    setIsFormOpen(true); 
  };

  const handleView = (client: Client) => { 
    setViewingClient(client); 
    setIsViewOpen(true); 
  };
  
  const handleDeleteClick = (client: Client) => { 
    setClientToDelete(client); 
  };
  
  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      const success = await deleteClient(clientToDelete.id);
      if (success) {
        setClientToDelete(null);
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

  // Função vazia para quando não há permissão
  const emptyFunction = () => {};

  return (
    <div className="h-full bg-gray-50">
      {/* Header com Background Branco */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header com Botão */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ScreenHeader 
                title="Gestão de Clientes"
                description="Gerencie todos os clientes e histórico de serviços"
                onBack={onBack}
              />
            </div>
            
            {/* Botão Condicional - Admin e Gestor podem criar */}
            {canCreateEdit && (
              <Button 
                onClick={handleCreate}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                className="hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            )}
          </div>

          {/* Cards de Estatísticas */}
          <ClientStats 
            total={clients.length}
            active={activeCount}
            inactive={inactiveCount}
            revenue={totalRevenue}
          />
        </div>
      </div>

      {/* Filtros com Background Branco */}
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

      {/* Lista de Clientes */}
      <div className="max-w-7xl mx-auto p-6">
        <ClientList 
          clients={filteredClients}
          onView={handleView}
          onEdit={canCreateEdit ? handleEdit : emptyFunction} 
          onDelete={canDelete ? handleDeleteClick : emptyFunction}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Dialogs */}
      <ClientFormDialog 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        editingClient={editingClient}
      />

      {/* Dialog de Visualização */}
      {viewingClient && (
        <ClientViewDialog 
          isOpen={isViewOpen} 
          onClose={() => {
            setIsViewOpen(false);
            setViewingClient(null);
          }} 
          client={viewingClient} 
          onEdit={(client) => { 
            setIsViewOpen(false); 
            setEditingClient(client); 
            setIsFormOpen(true); 
          }}
          onUpdateClientLocations={updateClientLocations}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteClientDialog 
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleConfirmDelete}
        clientName={clientToDelete?.name}
      />
    </div>
  );
}