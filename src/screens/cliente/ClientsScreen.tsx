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
  street: string; // Logradouro/Rua
  number: string; // Número
  complement?: string; // Complemento (opcional)
  zipCode: string; // CEP
  neighborhood: string; // Setor/Bairro
  city: string; // Cidade
  state: string; // Estado
}

interface ClientLocation {
  id: string;
  name: string; // Nome da unidade (ex: "Matriz", "Filial Centro", etc)
  address: Address;
  area: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  isPrimary: boolean; // Indica se é a unidade principal
}

interface Client {
  id: number;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: Address;
  area: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro'; // Área principal
  locations: ClientLocation[]; // Múltiplas unidades
  status: 'active' | 'inactive';
  servicesActive: number;
  servicesCompleted: number;
  lastService: string;
  rating: number;
  totalValue: string;
  notes?: string;
  createdAt?: string;
}

const mockClients: Client[] = [
  {
    id: 1,
    name: 'Shopping Center Norte',
    cnpj: '12.345.678/0001-90',
    email: 'contato@shoppingnorte.com.br',
    phone: '(11) 3456-7890',
    address: {
      street: 'Av. Otaviano Alves de Lima',
      number: '4400',
      complement: '',
      zipCode: '02201-001',
      neighborhood: 'Tucuruvi',
      city: 'São Paulo',
      state: 'SP'
    },
    area: 'norte',
    locations: [
      {
        id: 'loc-1',
        name: 'Unidade Principal',
        address: {
          street: 'Av. Otaviano Alves de Lima',
          number: '4400',
          complement: '',
          zipCode: '02201-001',
          neighborhood: 'Tucuruvi',
          city: 'São Paulo',
          state: 'SP'
        },
        area: 'norte',
        isPrimary: true
      }
    ],
    status: 'active',
    servicesActive: 3,
    servicesCompleted: 45,
    lastService: '23/09/2024',
    rating: 4.8,
    totalValue: 'R$ 125.000,00',
    notes: 'Cliente premium com contrato de limpeza completa.',
    createdAt: '15/01/2024'
  },
  {
    id: 2,
    name: 'Prédio Comercial São Paulo',
    cnpj: '98.765.432/0001-10',
    email: 'adm@prediocomercial.com.br',
    phone: '(11) 2345-6789',
    address: {
      street: 'Av. Paulista',
      number: '1000',
      complement: '',
      zipCode: '01310-100',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP'
    },
    area: 'centro',
    locations: [
      {
        id: 'loc-2',
        name: 'Matriz - Paulista',
        address: {
          street: 'Av. Paulista',
          number: '1000',
          complement: '',
          zipCode: '01310-100',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP'
        },
        area: 'centro',
        isPrimary: true
      },
      {
        id: 'loc-2b',
        name: 'Filial - Zona Sul',
        address: {
          street: 'Av. Santo Amaro',
          number: '2000',
          complement: '',
          zipCode: '04556-100',
          neighborhood: 'Brooklin',
          city: 'São Paulo',
          state: 'SP'
        },
        area: 'sul',
        isPrimary: false
      }
    ],
    status: 'active',
    servicesActive: 1,
    servicesCompleted: 23,
    lastService: '22/09/2024',
    rating: 4.5,
    totalValue: 'R$ 78.500,00',
    notes: 'Serviços de limpeza básica e manutenção. Cliente com 2 unidades.',
    createdAt: '20/02/2024'
  },
  {
    id: 3,
    name: 'Condomínio Residencial Vista Verde',
    cnpj: '11.222.333/0001-44',
    email: 'sindico@vistaverde.com.br',
    phone: '(11) 4567-8901',
    address: {
      street: 'Rua das Flores',
      number: '500',
      complement: '',
      zipCode: '05434-000',
      neighborhood: 'Vila Madalena',
      city: 'São Paulo',
      state: 'SP'
    },
    area: 'oeste',
    locations: [
      {
        id: 'loc-3',
        name: 'Unidade Única',
        address: {
          street: 'Rua das Flores',
          number: '500',
          complement: '',
          zipCode: '05434-000',
          neighborhood: 'Vila Madalena',
          city: 'São Paulo',
          state: 'SP'
        },
        area: 'oeste',
        isPrimary: true
      }
    ],
    status: 'inactive',
    servicesActive: 0,
    servicesCompleted: 12,
    lastService: '15/09/2024',
    rating: 4.2,
    totalValue: 'R$ 32.000,00',
    notes: 'Contrato suspenso temporariamente.',
    createdAt: '10/03/2024'
  },
  {
    id: 4,
    name: 'Hospital Santa Maria',
    cnpj: '55.666.777/0001-88',
    email: 'administracao@hsantamaria.com.br',
    phone: '(11) 5678-9012',
    address: {
      street: 'Rua da Saúde',
      number: '200',
      complement: '',
      zipCode: '01303-000',
      neighborhood: 'Liberdade',
      city: 'São Paulo',
      state: 'SP'
    },
    area: 'sul',
    locations: [
      {
        id: 'loc-4',
        name: 'Hospital Principal',
        address: {
          street: 'Rua da Saúde',
          number: '200',
          complement: '',
          zipCode: '01303-000',
          neighborhood: 'Liberdade',
          city: 'São Paulo',
          state: 'SP'
        },
        area: 'sul',
        isPrimary: true
      }
    ],
    status: 'active',
    servicesActive: 5,
    servicesCompleted: 67,
    lastService: '24/09/2024',
    rating: 4.9,
    totalValue: 'R$ 234.000,00',
    notes: 'Cliente de alta prioridade - área hospitalar.',
    createdAt: '05/01/2024'
  },
  {
    id: 5,
    name: 'Escritório Corporate Tower',
    cnpj: '99.888.777/0001-66',
    email: 'facilities@corporatetower.com.br',
    phone: '(11) 6789-0123',
    address: {
      street: 'Av. Faria Lima',
      number: '1500',
      complement: '',
      zipCode: '01452-000',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP'
    },
    area: 'oeste',
    locations: [
      {
        id: 'loc-5',
        name: 'Torre Principal',
        address: {
          street: 'Av. Faria Lima',
          number: '1500',
          complement: '',
          zipCode: '01452-000',
          neighborhood: 'Itaim Bibi',
          city: 'São Paulo',
          state: 'SP'
        },
        area: 'oeste',
        isPrimary: true
      }
    ],
    status: 'active',
    servicesActive: 2,
    servicesCompleted: 34,
    lastService: '23/09/2024',
    rating: 4.6,
    totalValue: 'R$ 156.000,00',
    notes: 'Escritório corporativo - horário comercial.',
    createdAt: '12/02/2024'
  }
];

interface ClientsScreenProps {
  onBack?: () => void;
  userType?: string;
  managerPermissions?: {
    canEditClients: boolean;
    canToggleClientStatus: boolean;
  };
}

export default function ClientsScreen({ onBack, userType = 'Administrador', managerPermissions = { canEditClients: true, canToggleClientStatus: true } }: ClientsScreenProps) {
  const [clients, setClients] = useState<Client[]>(mockClients);
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
      area: 'centro' as 'norte' | 'sul' | 'leste' | 'oeste' | 'centro',
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
      const initialFormData = {
        name: client.name,
        cnpj: client.cnpj,
        email: client.email,
        phone: client.phone,
        address: {
          ...client.address, // Copia todos os campos do endereço
          complement: client.address.complement || '' // Garante que 'complement' seja uma string
        },
        area: client.area,
        notes: client.notes || '',
        status: client.status
      };
      setFormData(initialFormData);
      setOriginalFormData(initialFormData);
      setLocations(client.locations);
      setOriginalLocations(client.locations);
    } else {
      setEditingClient(null);
      setFormData({
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
        area: 'centro',
        notes: '',
        status: 'active'
      });
      setLocations([
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
    
    // Comparar formData
    const formChanged = JSON.stringify(formData) !== JSON.stringify(originalFormData);
    
    // Comparar locations
    const locationsChanged = JSON.stringify(locations) !== JSON.stringify(originalLocations);
    
    return formChanged || locationsChanged;
  };

  const handleSaveClient = () => {
    if (!formData.name || !formData.cnpj || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    // Validar endereço principal
    if (!formData.address.street || !formData.address.number || !formData.address.zipCode || 
        !formData.address.neighborhood || !formData.address.city || !formData.address.state) {
      toast.error('Preencha todos os campos obrigatórios do endereço principal!');
      return;
    }

    // Validar que todas as localizações têm endereço completo
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
            
            {userType === 'Administrador' && (
              <Button
                onClick={() => handleOpenDialog()}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                className="hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            )}
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

                  {/* Actions */}
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
                    {(userType === 'Administrador' || managerPermissions.canEditClients) && (
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
                    )}
                    {(userType === 'Administrador' || managerPermissions.canToggleClientStatus) && (
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
                    )}
                    {userType === 'Administrador' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClient(client)}
                        style={{ borderColor: '#EF4444', color: '#EF4444' }}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Client Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingClient 
                ? 'Atualize as informações do cliente abaixo.'
                : 'Preencha os dados do novo cliente para cadastro no sistema.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="name" style={{ color: '#8B20EE' }}>Nome/Razão Social *</Label>
              <Input
                id="name"
                placeholder="Digite o nome do cliente"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cnpj" style={{ color: '#8B20EE' }}>CNPJ *</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="phone" style={{ color: '#8B20EE' }}>Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 00000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="email" style={{ color: '#8B20EE' }}>Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="cliente@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Endereço Principal - Campos Separados */}
            <div className="col-span-2">
              <Label style={{ color: '#8B20EE' }}>Endereço Principal *</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Logradouro/Rua"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Número"
                    value={formData.address.number}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, number: e.target.value } })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <Input
                  placeholder="Complemento (opcional)"
                  value={formData.address.complement}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, complement: e.target.value } })}
                />
                <Input
                  placeholder="CEP"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: formatZipCode(e.target.value) } })}
                  maxLength={9}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <Input
                  placeholder="Setor/Bairro"
                  value={formData.address.neighborhood}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, neighborhood: e.target.value } })}
                />
                <Input
                  placeholder="Cidade"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                />
                <Input
                  placeholder="Estado (UF)"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value.toUpperCase() } })}
                  maxLength={2}
                />
              </div>
            </div>

            <div className="col-span-2">
              <Label style={{ color: '#8B20EE' }}>Área Geográfica Principal *</Label>
              <Select value={formData.area} onValueChange={(value: any) => setFormData({ ...formData, area: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a área" />
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

            <div className="col-span-2">
              <div className="flex items-center justify-between mb-2">
                <Label style={{ color: '#8B20EE' }}>Unidades/Localizações *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLocation}
                  style={{ borderColor: '#6400A4', color: '#6400A4' }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Unidade
                </Button>
              </div>
              
              <div className="space-y-3 border rounded-lg p-4" style={{ borderColor: 'rgba(100, 0, 164, 0.2)' }}>
                {locations.map((location, index) => (
                  <div key={location.id} className="space-y-2 p-3 border rounded" style={{ backgroundColor: location.isPrimary ? 'rgba(100, 0, 164, 0.05)' : 'transparent' }}>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm" style={{ color: '#6400A4' }}>
                        Unidade {index + 1} {location.isPrimary && '(Principal)'}
                      </Label>
                      {!location.isPrimary && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLocation(location.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    
                    <Input
                      placeholder="Nome da unidade (ex: Matriz, Filial Centro)"
                      value={location.name}
                      onChange={(e) => handleUpdateLocation(location.id, 'name', e.target.value)}
                      className="text-sm"
                    />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Logradouro"
                        value={location.address.street}
                        onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, street: e.target.value })}
                        className="col-span-2 text-sm"
                      />
                      <Input
                        placeholder="Número"
                        value={location.address.number}
                        onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, number: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Complemento"
                        value={location.address.complement}
                        onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, complement: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        placeholder="CEP"
                        value={location.address.zipCode}
                        onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, zipCode: formatZipCode(e.target.value) })}
                        maxLength={9}
                        className="text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Setor/Bairro"
                        value={location.address.neighborhood}
                        onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, neighborhood: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Cidade"
                        value={location.address.city}
                        onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, city: e.target.value })}
                        className="text-sm"
                      />
                      <Input
                        placeholder="UF"
                        value={location.address.state}
                        onChange={(e) => handleUpdateLocation(location.id, 'address', { ...location.address, state: e.target.value.toUpperCase() })}
                        maxLength={2}
                        className="text-sm"
                      />
                    </div>
                    
                    <Select 
                      value={location.area} 
                      onValueChange={(value: any) => handleUpdateLocation(location.id, 'area', value)}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Área Geográfica" />
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
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes" style={{ color: '#8B20EE' }}>Observações</Label>
              <Textarea
                id="notes"
                placeholder="Observações importantes sobre o cliente"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
              />
              <Label htmlFor="status" style={{ color: '#8B20EE' }}>Cliente Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              onClick={handleSaveClient}
              disabled={!hasClientChanges()}
            >
              {editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Client Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas do cliente e histórico de serviços
            </DialogDescription>
          </DialogHeader>

          {viewingClient && (
            <div className="space-y-6 py-4">
              {/* Client Header */}
              <div className="flex items-center space-x-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <Avatar className="h-16 w-16" style={{ backgroundColor: '#6400A4' }}>
                  <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                    {getInitials(viewingClient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl" style={{ color: '#6400A4' }}>{viewingClient.name}</h3>
                  <p className="text-sm text-gray-600">{viewingClient.cnpj}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      style={viewingClient.status === 'active' 
                        ? { backgroundColor: '#10B981', color: 'white' } 
                        : { backgroundColor: '#9CA3AF', color: 'white' }}
                    >
                      {viewingClient.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {viewingClient.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{viewingClient.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="mb-3" style={{ color: '#6400A4' }}>Informações de Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5" style={{ color: '#6400A4' }} />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm text-black">{viewingClient.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5" style={{ color: '#6400A4' }} />
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="text-sm text-black">{viewingClient.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg mt-4">
                  <MapPin className="h-5 w-5 mt-0.5" style={{ color: '#8B20EE' }} />
                  <div>
                    <p className="text-xs text-gray-500">Endereço Principal</p>
                    <p className="text-sm text-black">{formatAddress(viewingClient.address)}</p>
                    <p className="text-xs text-gray-500 mt-1">CEP: {viewingClient.address.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Services Statistics */}
              <div>
                <h4 className="mb-3" style={{ color: '#6400A4' }}>Estatísticas de Serviços</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg border-2" style={{ borderColor: '#6400A4' }}>
                    <p className="text-xs text-gray-600">Serviços Ativos</p>
                    <p className="text-2xl" style={{ color: '#6400A4' }}>{viewingClient.servicesActive}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-2 border-green-500">
                    <p className="text-xs text-gray-600">Concluídos</p>
                    <p className="text-2xl text-green-600">{viewingClient.servicesCompleted}</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg border-2" style={{ borderColor: '#FFFF20' }}>
                    <p className="text-xs text-gray-600">Último Serviço</p>
                    <p className="text-sm text-gray-800">{viewingClient.lastService}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border-2" style={{ borderColor: '#35BAE6' }}>
                    <p className="text-xs text-gray-600">Receita Total</p>
                    <p className="text-sm" style={{ color: '#35BAE6' }}>{viewingClient.totalValue}</p>
                  </div>
                </div>
              </div>

              {/* Locations/Units */}
              {viewingClient.locations && viewingClient.locations.length > 0 && (
                <div>
                  <h4 className="mb-3" style={{ color: '#6400A4' }}>Unidades/Localizações</h4>
                  <div className="space-y-3">
                    {viewingClient.locations.map((location, index) => (
                      <div key={location.id} className="p-3 bg-gray-50 rounded-lg border-l-4" style={{ borderLeftColor: location.isPrimary ? '#6400A4' : '#35BAE6' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span style={{ color: '#6400A4' }}>{location.name}</span>
                          <div className="flex gap-2">
                            {location.isPrimary && (
                              <Badge style={{ backgroundColor: '#6400A4', color: 'white' }}>Principal</Badge>
                            )}
                            <Badge variant="outline" style={{ borderColor: '#35BAE6', color: '#35BAE6' }}>
                              {location.area.charAt(0).toUpperCase() + location.area.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#8B20EE' }} />
                          <span>{formatAddress(location.address)}</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-6">CEP: {location.address.zipCode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {viewingClient.notes && (
                <div>
                  <h4 className="mb-3" style={{ color: '#6400A4' }}>Observações</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{viewingClient.notes}</p>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {viewingClient.createdAt && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" style={{ color: '#8B20EE' }} />
                  <span>Cliente desde {viewingClient.createdAt}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fechar
            </Button>
            {viewingClient && (
              <Button
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleOpenDialog(viewingClient);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Cliente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmClient} onOpenChange={(open) => !open && setDeleteConfirmClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="modal-title-purple">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{deleteConfirmClient?.name}</strong>? 
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClient}
              style={{ backgroundColor: '#EF4444', color: 'white' }}
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