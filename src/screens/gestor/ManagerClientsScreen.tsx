import { useState } from 'react';
import ScreenHeader from '../public/ScreenHeader';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Building, Plus, Search, Check, Power, TrendingUp } from 'lucide-react';
import { useClients } from '../administrador/clients/hooks/useClients'; 
import { ClientList } from '../administrador/clients/components/ClientList';
import { ClientFormDialog } from '../administrador/clients/components/ClientFormDialog';
import { ClientViewDialog } from '../administrador/clients/components/ClientViewDialog';
import { Client } from '../administrador/clients/types/client';

interface ManagerClientsScreenProps {
  onBack?: () => void;
}

export default function ManagerClientsScreen({ onBack }: ManagerClientsScreenProps) {
  const { clients, saveClient, toggleClientStatus } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);

  const activeCount = clients.filter(c => c.status === 'active').length;
  const inactiveCount = clients.filter(c => c.status === 'inactive').length;
  const totalRevenue = clients.reduce((sum, c) => {
    if(!c.totalValue) return sum;
    const val = parseFloat(c.totalValue.replace(/[R$\s.]/g, '').replace(',', '.'));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const handleToggleStatus = async (clientId: number, currentStatus: string) => {
    await toggleClientStatus(clientId, currentStatus);
    if (viewingClient && viewingClient.id === clientId) {
        setViewingClient({
            ...viewingClient,
            status: currentStatus === 'active' ? 'inactive' : 'active'
        });
    }
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ScreenHeader 
                title="Gestão de Clientes (Gestor)"
                description="Gerencie todos os clientes e histórico de serviços"
                onBack={onBack}
              />
            </div>
            <Button onClick={handleCreate} style={{ backgroundColor: '#6400A4', color: 'white' }} className="hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Cliente
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-purple-50 rounded-xl p-4 border-2 border-[#6400A4] flex justify-between items-center">
               <div>
                 <p className="text-sm text-gray-600">Total de Clientes</p>
                 <p className="text-2xl text-[#6400A4] font-bold">{clients.length}</p>
               </div>
               <Building className="h-8 w-8 text-[#6400A4] opacity-50" />
            </div>
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-500 flex justify-between items-center">
               <div>
                 <p className="text-sm text-gray-600">Clientes Ativos</p>
                 <p className="text-2xl text-green-600 font-bold">{activeCount}</p>
               </div>
               <Check className="h-8 w-8 text-green-500 opacity-50" />
            </div>
            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-500 flex justify-between items-center">
               <div>
                 <p className="text-sm text-gray-600">Clientes Inativos</p>
                 <p className="text-2xl text-red-600 font-bold">{inactiveCount}</p>
               </div>
               <Power className="h-8 w-8 text-red-500 opacity-50" />
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-400 flex justify-between items-center">
               <div>
                 <p className="text-sm text-gray-600">Receita Total</p>
                 <p className="text-2xl text-gray-800 font-bold">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                 </p>
               </div>
               <TrendingUp className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por nome, CNPJ ou email..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10"
            />
          </div>
          <Tabs value={filterStatus} onValueChange={setFilterStatus}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="inactive">Inativos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <ClientList 
          clients={filteredClients}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      <ClientFormDialog 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={saveClient}
        editingClient={editingClient}
      />

      {viewingClient && (
        <ClientViewDialog 
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          client={viewingClient}
          onEdit={(client) => {
            setIsViewOpen(false);
            setEditingClient(client);
            setIsFormOpen(true);
          }}
        />
      )}
    </div>
  );
}