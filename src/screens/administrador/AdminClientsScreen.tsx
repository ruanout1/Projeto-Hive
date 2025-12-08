import { useState, useEffect } from 'react';
import ScreenHeader from '../../components/ScreenHeader';
import { 
  Building,
  Plus,
  Edit,
  Eye,
  Trash2,
  Power,
  Search,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Check,
  Star,
  TrendingUp,
  Loader2,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { HighlightText } from '../../components/ui/search-highlight';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Switch } from '../../components/ui/switch';
import { toast } from 'sonner';



// ============================================================================
// INTERFACES
// ============================================================================
interface Address {
  street: string;
  number: string;
  complement: string;
  zipCode: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface ClientLocation {
  id: string;
  name: string;
  address: Address;
  area: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  isPrimary: boolean;
}

interface Client {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: Address;
  area: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  locations: ClientLocation[];
  status: 'active' | 'inactive';
  servicesActive: number;
  servicesCompleted: number;
  lastService: string;
  rating: number;
  totalValue: string;
  notes?: string;
  createdAt?: string;
}

interface AdminClientsScreenProps {
  onBack?: () => void;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  totalRevenue: number;
}

interface ApiFilters {
  status?: string;
  search?: string;
}

// ============================================================================
// API SERVICE
// ============================================================================
const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const clientsAPI = {
  getAll: async (filters: ApiFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    
    const response = await fetch(`${API_BASE_URL}/clients?${params}`, {
      headers: getAuthHeaders()
    });
    
    if (response.status === 401) {
      toast.error('Sessão expirada. Faça login novamente.');
      throw new Error('Unauthorized');
    }
    
    if (!response.ok) throw new Error('Erro ao buscar clientes');
    return response.json();
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Erro ao buscar cliente');
    return response.json();
  },

  create: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao criar cliente');
    }
    return response.json();
  },

  update: async (id: number, data: any) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao atualizar cliente');
    }
    return response.json();
  },

  toggleStatus: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Erro ao alterar status');
    return response.json();
  },

  delete: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Erro ao excluir cliente');
    return response.json();
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/clients/stats/summary`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) throw new Error('Erro ao buscar estatísticas');
    return response.json();
  }
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function AdminClientsScreen({ onBack }: AdminClientsScreenProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<Client | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0
  });
  
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      zipCode: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    area: 'centro' as 'norte' | 'sul' | 'leste' | 'oeste' | 'centro',
    notes: '',
    status: 'active' as 'active' | 'inactive'
  });
  
  const [locations, setLocations] = useState<ClientLocation[]>([
    {
      id: 'temp-1',
      name: 'Unidade Principal',
      address: {
        street: '',
        number: '',
        complement: '',
        zipCode: '',
        neighborhood: '',
        city: '',
        state: ''
      },
      area: 'centro',
      isPrimary: true
    }
  ]);

  const [originalFormData, setOriginalFormData] = useState(formData);
  const [originalLocations, setOriginalLocations] = useState<ClientLocation[]>([]);

  // ============================================================================
  // CARREGAR DADOS
  // ============================================================================
  const loadClients = async () => {
    try {
      setLoading(true);
      const statusFilter = filterStatus === 'todos' ? undefined : filterStatus;
      const result = await clientsAPI.getAll({ 
        status: statusFilter, 
        search: searchTerm 
      });
      setClients(result.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await clientsAPI.getStats();
      setStats(result.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    loadStats();
    loadClients();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClients();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, filterStatus]);

  // ============================================================================
  // FORMATAÇÃO
  // ============================================================================
  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatZipCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.street,
      address.number,
      address.complement,
      address.neighborhood,
      address.city,
      address.state
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // ============================================================================
  // HANDLERS - DIALOGS
  // ============================================================================
  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      
      const initialFormData = {
        name: client.name,
        cnpj: client.cnpj,
        email: client.email,
        phone: client.phone,
        address: { 
          street: client.address.street,
          number: client.address.number,
          complement: client.address.complement || '',
          zipCode: client.address.zipCode,
          neighborhood: client.address.neighborhood,
          city: client.address.city,
          state: client.address.state
        },
        area: client.area,
        notes: client.notes || '',
        status: client.status
      };
      
      setFormData(initialFormData);
      setOriginalFormData(initialFormData);
      
      const locationsWithFixedComplement = client.locations.map(location => ({
        ...location,
        address: {
          ...location.address,
          complement: location.address.complement || ''
        }
      }));
      
      setLocations(locationsWithFixedComplement);
      setOriginalLocations(locationsWithFixedComplement);
    } else {
      setEditingClient(null);
      
      const defaultFormData = {
        name: '',
        cnpj: '',
        email: '',
        phone: '',
        address: {
          street: '',
          number: '',
          complement: '',
          zipCode: '',
          neighborhood: '',
          city: '',
          state: ''
        },
        area: 'centro' as 'norte' | 'sul' | 'leste' | 'oeste' | 'centro',
        notes: '',
        status: 'active' as 'active' | 'inactive'
      };
      
      setFormData(defaultFormData);
      setOriginalFormData(defaultFormData);
      
      const defaultLocations = [
        {
          id: 'temp-1',
          name: 'Unidade Principal',
          address: {
            street: '',
            number: '',
            complement: '',
            zipCode: '',
            neighborhood: '',
            city: '',
            state: ''
          },
          area: 'centro' as 'norte' | 'sul' | 'leste' | 'oeste' | 'centro',
          isPrimary: true
        }
      ];
      
      setLocations(defaultLocations);
      setOriginalLocations(defaultLocations);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingClient(null);
  };

  const handleAddLocation = () => {
    const newLocation: ClientLocation = {
      id: `temp-${Date.now()}`,
      name: `Unidade ${locations.length + 1}`,
      address: {
        street: '',
        number: '',
        complement: '',
        zipCode: '',
        neighborhood: '',
        city: '',
        state: ''
      },
      area: 'centro',
      isPrimary: false
    };
    setLocations([...locations, newLocation]);
  };

  const handleRemoveLocation = (locationId: string) => {
    if (locations.length === 1) {
      toast.error('O cliente deve ter pelo menos uma unidade!');
      return;
    }
    setLocations(locations.filter(loc => loc.id !== locationId));
  };

  const handleUpdateLocation = (locationId: string, field: keyof ClientLocation, value: any) => {
    setLocations(locations.map(loc => 
      loc.id === locationId ? { ...loc, [field]: value } : loc
    ));
  };

  const hasClientChanges = () => {
    if (!editingClient) return true;
    
    const formChanged = 
      formData.name !== originalFormData.name ||
      formData.cnpj !== originalFormData.cnpj ||
      formData.email !== originalFormData.email ||
      formData.phone !== originalFormData.phone ||
      formData.area !== originalFormData.area ||
      formData.notes !== originalFormData.notes ||
      formData.status !== originalFormData.status ||
      JSON.stringify(formData.address) !== JSON.stringify(originalFormData.address);
    
    const locationsChanged = JSON.stringify(locations) !== JSON.stringify(originalLocations);
    
    return formChanged || locationsChanged;
  };

  // ============================================================================
  // HANDLERS - CRUD
  // ============================================================================
  const handleSaveClient = async () => {
    if (!formData.name || !formData.cnpj || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    if (!formData.address.street || !formData.address.number || !formData.address.zipCode || 
        !formData.address.neighborhood || !formData.address.city || !formData.address.state) {
      toast.error('Preencha todos os campos obrigatórios do endereço principal!');
      return;
    }

    const invalidLocation = locations.find(loc => 
      !loc.address.street || !loc.address.number || !loc.address.zipCode || 
      !loc.address.neighborhood || !loc.address.city || !loc.address.state
    );
    if (invalidLocation) {
      toast.error('Todas as unidades devem ter endereço completo!');
      return;
    }

    try {
      setSaving(true);
      
      const payload = {
        ...formData,
        locations
      };

      if (editingClient) {
        await clientsAPI.update(editingClient.id, payload);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await clientsAPI.create(payload);
        toast.success('Cliente criado com sucesso!');
      }
      
      handleCloseDialog();
      loadClients();
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleViewClient = async (client: Client) => {
    try {
      const result = await clientsAPI.getById(client.id);
      setViewingClient(result.data);
      setIsViewDialogOpen(true);
    } catch (error) {
      toast.error('Erro ao carregar detalhes do cliente');
    }
  };

  const handleToggleStatus = async (clientId: number) => {
    try {
      await clientsAPI.toggleStatus(clientId);
      toast.success('Status alterado com sucesso!');
      loadClients();
      loadStats();
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handleDeleteClient = (client: Client) => {
    setDeleteConfirmClient(client);
  };

  const confirmDeleteClient = async () => {
    if (!deleteConfirmClient) return;
    
    try {
      await clientsAPI.delete(deleteConfirmClient.id);
      toast.success('Cliente excluído com sucesso!');
      setDeleteConfirmClient(null);
      loadClients();
      loadStats();
    } catch (error) {
      toast.error('Erro ao excluir cliente');
    }
  };

  const filteredClients = clients;

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ScreenHeader 
                title="Gestão de Clientes"
                description="Gerencie todos os clientes e histórico de serviços"
                onBack={() => onBack?.()}
              />
            </div>
            
            <Button
              onClick={() => handleOpenDialog()}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold" style={{ color: '#6400A4' }}>{stats.total}</p>
                </div>
                <Building className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <Check className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Inativos</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <Power className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFFF20' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-800">
                    R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-600 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CNPJ, email, telefone ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#6400A4' }} />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClients.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-gray-500">Nenhum cliente encontrado</p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl p-5 hover:shadow-md transition-all border-2 border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="h-12 w-12" style={{ backgroundColor: client.status === 'active' ? '#6400A4' : '#9CA3AF' }}>
                        <AvatarFallback style={{ backgroundColor: client.status === 'active' ? '#6400A4' : '#9CA3AF', color: 'white' }}>
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold" style={{ color: '#6400A4' }}>
                            <HighlightText text={client.name} searchTerm={searchTerm} highlightClassName="search-highlight" />
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#6400A4' }} />
                            <span className="truncate"><HighlightText text={client.cnpj} searchTerm={searchTerm} highlightClassName="search-highlight" /></span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <Mail className="h-4 w-4 flex-shrink-0" style={{ color: '#6400A4' }} />
                            <span className="truncate"><HighlightText text={client.email} searchTerm={searchTerm} highlightClassName="search-highlight" /></span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <Phone className="h-4 w-4 flex-shrink-0" style={{ color: '#6400A4' }} />
                            <span className="truncate"><HighlightText text={client.phone} searchTerm={searchTerm} highlightClassName="search-highlight" /></span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 mt-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                          <span className="truncate"><HighlightText text={formatAddress(client.address)} searchTerm={searchTerm} highlightClassName="search-highlight" /></span>
                        </div>

                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
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

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClient(client)}
                        style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
                        className="hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(client)}
                        style={{ borderColor: '#6400A4', color: '#6400A4' }}
                        className="hover:bg-purple-50"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(client.id)}
                        style={{
                          borderColor: client.status === 'active' ? '#EF4444' : '#10B981',
                          color: client.status === 'active' ? '#EF4444' : '#10B981'
                        }}
                        className={client.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'}
                      >
                        <Power className="h-4 w-4 mr-2" />
                        {client.status === 'active' ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClient(client)}
                        style={{ borderColor: '#EF4444', color: '#EF4444' }}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Dialog Criar/Editar Cliente */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingClient ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Dados Básicos */}
            <div className="space-y-4">
              <h3 className="font-semibold" style={{ color: '#6400A4' }}>Dados Básicos</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome / Razão Social *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <Label>CNPJ *</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                    placeholder="00.000.000/0000-00"
                    maxLength={18}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Endereço Principal */}
            <div className="space-y-4">
              <h3 className="font-semibold" style={{ color: '#6400A4' }}>Endereço Principal</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label>Rua *</Label>
                  <Input
                    value={formData.address.street}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                    placeholder="Nome da rua"
                  />
                </div>
                <div>
                  <Label>Número *</Label>
                  <Input
                    value={formData.address.number}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, number: e.target.value } })}
                    placeholder="123"
                  />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input
                    value={formData.address.complement}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, complement: e.target.value } })}
                    placeholder="Sala 456"
                  />
                </div>
                <div>
                  <Label>CEP *</Label>
                  <Input
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: formatZipCode(e.target.value) } })}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
                <div>
                  <Label>Bairro *</Label>
                  <Input
                    value={formData.address.neighborhood}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, neighborhood: e.target.value } })}
                    placeholder="Centro"
                  />
                </div>
                <div>
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.address.city}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                    placeholder="São Paulo"
                  />
                </div>
                <div>
                  <Label>Estado *</Label>
                  <Input
                    value={formData.address.state}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value.toUpperCase() } })}
                    placeholder="SP"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label>Área</Label>
                  <Select value={formData.area} onValueChange={(value: any) => setFormData({ ...formData, area: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="norte">Norte</SelectItem>
                      <SelectItem value="sul">Sul</SelectItem>
                      <SelectItem value="leste">Leste</SelectItem>
                      <SelectItem value="oeste">Oeste</SelectItem>
                      <SelectItem value="centro">Centro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Outras Unidades/Localizações */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold" style={{ color: '#6400A4' }}>Unidades / Localizações</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLocation}
                  style={{ borderColor: '#6400A4', color: '#6400A4' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Unidade
                </Button>
              </div>

              {locations.map((location, index) => (
                <div key={location.id} className="p-4 border rounded-lg space-y-3" style={{ borderColor: location.isPrimary ? '#6400A4' : '#E5E7EB' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Input
                        value={location.name}
                        onChange={(e) => handleUpdateLocation(location.id, 'name', e.target.value)}
                        placeholder="Nome da unidade"
                        className="w-64"
                      />
                      {location.isPrimary && (
                        <Badge style={{ backgroundColor: '#6400A4' }}>Principal</Badge>
                      )}
                    </div>
                    {!location.isPrimary && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLocation(location.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Input
                        value={location.address.street}
                        onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, street: e.target.value })}
                        placeholder="Rua *"
                      />
                    </div>
                    <Input
                      value={location.address.number}
                      onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, number: e.target.value })}
                      placeholder="Número *"
                    />
                    <Input
                      value={location.address.complement}
                      onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, complement: e.target.value })}
                      placeholder="Complemento"
                    />
                    <Input
                      value={location.address.zipCode}
                      onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, zipCode: formatZipCode(e.target.value) })}
                      placeholder="CEP *"
                      maxLength={9}
                    />
                    <Input
                      value={location.address.neighborhood}
                      onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, neighborhood: e.target.value })}
                      placeholder="Bairro *"
                    />
                    <Input
                      value={location.address.city}
                      onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, city: e.target.value })}
                      placeholder="Cidade *"
                    />
                    <Input
                      value={location.address.state}
                      onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, state: e.target.value.toUpperCase() })}
                      placeholder="Estado *"
                      maxLength={2}
                    />
                    <Select value={location.area} onValueChange={(value: any) => handleUpdateLocation(location.id, 'area', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="norte">Norte</SelectItem>
                        <SelectItem value="sul">Sul</SelectItem>
                        <SelectItem value="leste">Leste</SelectItem>
                        <SelectItem value="oeste">Oeste</SelectItem>
                        <SelectItem value="centro">Centro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            {/* Observações e Status */}
            <div className="space-y-4">
              <div>
                <Label>Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informações adicionais sobre o cliente"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.status === 'active'}
                  onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
                />
                <Label>Cliente Ativo</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveClient}
              disabled={saving || (!editingClient ? false : !hasClientChanges())}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                editingClient ? 'Atualizar Cliente' : 'Criar Cliente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Visualizar Cliente */}
      <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsViewDialogOpen(false);
          setViewingClient(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {viewingClient && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16" style={{ backgroundColor: '#6400A4' }}>
                    <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white', fontSize: '1.5rem' }}>
                      {getInitials(viewingClient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl" style={{ color: '#6400A4' }}>
                      {viewingClient.name}
                    </DialogTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-600">{viewingClient.cnpj}</span>
                      <Badge
                        variant={viewingClient.status === 'active' ? 'default' : 'secondary'}
                        style={viewingClient.status === 'active' ? { backgroundColor: '#10B981' } : {}}
                      >
                        {viewingClient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {viewingClient.rating > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{viewingClient.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Informações de Contato */}
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: '#6400A4' }}>Informações de Contato</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" style={{ color: '#6400A4' }} />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm">{viewingClient.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" style={{ color: '#6400A4' }} />
                      <div>
                        <p className="text-xs text-gray-500">Telefone</p>
                        <p className="text-sm">{viewingClient.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 mt-4">
                    <MapPin className="h-4 w-4 mt-1" style={{ color: '#8B20EE' }} />
                    <div>
                      <p className="text-xs text-gray-500">Endereço Principal</p>
                      <p className="text-sm">{formatAddress(viewingClient.address)}</p>
                    </div>
                  </div>
                </div>

                {/* Estatísticas */}
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: '#6400A4' }}>Estatísticas</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Serviços Ativos</p>
                      <p className="text-xl font-bold" style={{ color: '#6400A4' }}>{viewingClient.servicesActive}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Concluídos</p>
                      <p className="text-xl font-bold text-green-600">{viewingClient.servicesCompleted}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Último Serviço</p>
                      <p className="text-sm font-bold text-blue-600">{viewingClient.lastService}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600">Receita Total</p>
                      <p className="text-lg font-bold text-gray-800">{viewingClient.totalValue}</p>
                    </div>
                  </div>
                </div>

                {/* Unidades/Localizações */}
                {viewingClient.locations && viewingClient.locations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: '#6400A4' }}>Unidades / Localizações</h3>
                    <div className="space-y-3">
                      {viewingClient.locations.map((location) => (
                        <div key={location.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-semibold">{location.name}</p>
                            {location.isPrimary && (
                              <Badge style={{ backgroundColor: '#6400A4' }}>Principal</Badge>
                            )}
                            <Badge variant="outline" style={{ borderColor: '#8B20EE', color: '#8B20EE' }}>
                              {location.area.charAt(0).toUpperCase() + location.area.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{formatAddress(location.address)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observações */}
                {viewingClient.notes && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#6400A4' }}>Observações</h3>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{viewingClient.notes}</p>
                  </div>
                )}

                {/* Data de Cadastro */}
                {viewingClient.createdAt && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>Cliente desde {viewingClient.createdAt}</span>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleOpenDialog(viewingClient);
                  }}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                  Editar Cliente
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog Excluir */}
      <AlertDialog open={!!deleteConfirmClient} onOpenChange={() => setDeleteConfirmClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{deleteConfirmClient?.name}</strong>?
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClient}
              style={{ backgroundColor: '#EF4444' }}
              className="hover:opacity-90"
            >
              Excluir Cliente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}