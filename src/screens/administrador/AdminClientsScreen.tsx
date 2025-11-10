import { useState } from 'react';
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
  TrendingUp
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

export default function AdminClientsScreen({ onBack }: AdminClientsScreenProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deleteConfirmClient, setDeleteConfirmClient] = useState<Client | null>(null);
  
  // Form states
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

  // Estados para rastrear valores originais
  const [originalFormData, setOriginalFormData] = useState(formData);
  const [originalLocations, setOriginalLocations] = useState<ClientLocation[]>([]);

  const activeCount = clients.filter(c => c.status === 'active').length;
  const inactiveCount = clients.filter(c => c.status === 'inactive').length;
  const totalRevenue = clients.reduce((sum, c) => {
    const value = parseFloat(c.totalValue.replace(/[R$\s.]/g, '').replace(',', '.'));
    return sum + value;
  }, 0);

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      `${client.address.street} ${client.address.number} ${client.address.neighborhood} ${client.address.city}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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

  const handleOpenDialog = (client?: Client) => {
    if (client) {
        setEditingClient(client);
        
        // CORREÇÃO: Garantir que complement seja string, não undefined
        const initialFormData = {
        name: client.name,
        cnpj: client.cnpj,
        email: client.email,
        phone: client.phone,
        address: { 
            street: client.address.street,
            number: client.address.number,
            complement: client.address.complement || '', // Converter undefined para string vazia
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
        
        // CORREÇÃO: Garantir que todos os complements das locations sejam strings
        const locationsWithFixedComplement = client.locations.map(location => ({
        ...location,
        address: {
            ...location.address,
            complement: location.address.complement || '' // Converter undefined para string vazia
        }
        }));
        
        setLocations(locationsWithFixedComplement);
        setOriginalLocations(locationsWithFixedComplement);
    } else {
        setEditingClient(null);
        
        // CORREÇÃO: Resetar formData para valores padrão com complement como string
        const defaultFormData = {
        name: '',
        cnpj: '',
        email: '',
        phone: '',
        address: {
            street: '',
            number: '',
            complement: '', // Sempre string, nunca undefined
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
            complement: '', // Sempre string, nunca undefined
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
  if (!editingClient) return true; // Se está criando, sempre habilita
  
  // CORREÇÃO: Comparação mais robusta
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

  const handleSaveClient = () => {
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

    if (editingClient) {
      // Editar cliente existente
      setClients(clients.map(c => 
        c.id === editingClient.id 
          ? { ...c, ...formData, locations }
          : c
      ));
      toast.success('Cliente atualizado com sucesso!', {
        description: `As informações de "${formData.name}" foram atualizadas.`
      });
    } else {
      // Criar novo cliente
      const newClient: Client = {
        id: Date.now(),
        ...formData,
        locations,
        servicesActive: 0,
        servicesCompleted: 0,
        lastService: '-',
        rating: 0,
        totalValue: 'R$ 0,00',
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      setClients([...clients, newClient]);
      toast.success('Cliente criado com sucesso!', {
        description: `O cliente "${formData.name}" foi adicionado ao sistema.`
      });
    }
    handleCloseDialog();
  };

  const handleViewClient = (client: Client) => {
    setViewingClient(client);
    setIsViewDialogOpen(true);
  };

  const handleToggleStatus = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    setClients(clients.map(c => 
      c.id === clientId 
        ? { ...c, status: newStatus }
        : c
    ));
    toast.success(
      `Cliente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`,
      { description: `O cliente "${client.name}" foi ${newStatus === 'active' ? 'ativado' : 'desativado'}.` }
    );
  };

  const handleDeleteClient = (client: Client) => {
    setDeleteConfirmClient(client);
  };

  const confirmDeleteClient = () => {
    if (deleteConfirmClient) {
      setClients(clients.filter(c => c.id !== deleteConfirmClient.id));
      toast.success('Cliente excluído com sucesso!', {
        description: `O cliente "${deleteConfirmClient.name}" foi removido do sistema.`
      });
      setDeleteConfirmClient(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

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
                  <p className="text-2xl" style={{ color: '#6400A4' }}>{clients.length}</p>
                </div>
                <Building className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Ativos</p>
                  <p className="text-2xl text-green-600">{activeCount}</p>
                </div>
                <Check className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Inativos</p>
                  <p className="text-2xl text-red-600">{inactiveCount}</p>
                </div>
                <Power className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFFF20' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Receita Total</p>
                  <p className="text-2xl text-gray-800">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CNPJ, email, telefone ou endereço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
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
                  {/* Client Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12" style={{ backgroundColor: client.status === 'active' ? '#6400A4' : '#9CA3AF' }}>
                      <AvatarFallback style={{ backgroundColor: client.status === 'active' ? '#6400A4' : '#9CA3AF', color: 'white' }}>
                        {getInitials(client.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 style={{ color: '#6400A4' }}>
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

                  {/* Actions - ADMIN TEM BOTÃO EXCLUIR */}
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
                    {/* BOTÃO EXCLUIR - APENAS PARA ADMIN */}
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
      </div>

      {/* Resto dos dialogs (Create/Edit, View, Delete) - MANTIDOS IGUAIS */}
      {/* ... (mantenha todos os dialogs do código original) */}
      
    </div>
  );
}