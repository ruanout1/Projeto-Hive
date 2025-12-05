import { useState, useEffect } from 'react';
import { Plus, Calendar, AlertTriangle, CheckCircle, Bot, Clock, Building2, Shield, TreePine, Droplets, Wrench, UserCheck, MapPin, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Calendar as CalendarComponent } from '../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { Toaster } from '../../components/ui/sonner'; 
import RequestsViewScreen from './RequestsViewScreen';
import ScreenHeader from '../public/ScreenHeader';
import api from '../../lib/api';

interface ServiceRequestScreenProps {
  onBack?: () => void;
  initialTab?: string;
}

interface PendingConfirmation {
  id: string;
  serviceType: string;
  description: string;
  requestedDate: string;
  proposedDate: string;
  proposedBy: string;
  scheduledDescription: string;
  assignedTeam?: string;
  assignedCollaborator?: string;
}

interface ServiceRequest {
  service_request_id?: string;  // Opcional para compatibilidade
  id?: string;                   // Opcional para dados mock
  request_number?: string;       // ✅ Número da requisição (REQ-YYYYMMDD-XXXXX)
  service: string;
  date: string;
  priority: string;
  status: string;
  requestedAt: string;
  description: string;
  location?: string;
  area?: string;
}

// Interfaces para dados da API
interface ServiceCategory {
  id: number;
  name: string;
  color: string;
}

interface ServiceOption {
  id: number;
  name: string;
  description: string;
  category: ServiceCategory;
  price?: number;
  duration_value?: number;
  duration_type?: string;
  status?: string;
  created_at?: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  area?: string;
}

// ✅ Função auxiliar para normalizar dados do backend (extraída para fora do componente)
const normalizeRequest = (r: any): ServiceRequest => {
  // Mapear status_key do backend para valores da UI
  const statusMap: Record<string, string> = {
    'pending': 'pendente',
    'in_progress': 'em-analise',
    'scheduled': 'agendado',
    'completed': 'aprovado',
    'cancelled': 'rejeitado',
    'rescheduled': 'agendado'
  };

  // Mapear priority_key do backend para valores da UI
  const priorityMap: Record<string, string> = {
    'urgent': 'urgente',
    'high': 'urgente',
    'medium': 'rotina',
    'low': 'rotina'
  };

  // Normalizar data (pode vir em ISO 2024-12-03 ou dd/mm/yyyy)
  const normalizeDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';

    // Se já está em formato dd/mm/yyyy, retorna direto
    if (dateStr.includes('/')) return dateStr;

    // Se está em ISO (yyyy-mm-dd), converte para dd/mm/yyyy
    try {
      const [year, month, day] = dateStr.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  // ✅ Extrair nome do serviço (prioridade: service_catalog.name > title > fallback)
  const serviceName = r.service_catalog?.name || r.title || r.service_type || 'Serviço';

  // ✅ Montar location com dados reais do backend
  const location = r.branch?.name ||
                   r.address_reference ||
                   r.unit_name ||
                   r.full_address ||
                   [r.city, r.state].filter(Boolean).join(' / ') ||
                   'Unidade não informada';

  // ✅ Extrair área do branch ou fallback
  const area = r.branch?.area || r.area_name || r.area || '';

  return {
    service_request_id: String(r.service_request_id ?? ''),
    request_number: r.request_number || '',  // ✅ Número da requisição
    service: serviceName,
    description: r.description || '',
    date: normalizeDate(r.desired_date || r.date) || 'Não informada',
    requestedAt: normalizeDate(r.created_at || r.requestedAt) || 'Não informada',
    status: statusMap[r.status] || statusMap[r.status_key] || 'pendente',
    priority: priorityMap[r.priority] || priorityMap[r.priority_key] || 'rotina',
    location,
    area,
  };
};

export default function ServiceRequestScreen({ onBack, initialTab }: ServiceRequestScreenProps) {
  // Estados do formulário
  const [selectedService, setSelectedService] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requestedDate, setRequestedDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'main' | 'requests'>('main');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedConfirmation, setSelectedConfirmation] = useState<PendingConfirmation | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'solicitar');

  // Estados dos dados da API
  const [allRequests, setAllRequests] = useState<ServiceRequest[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingConfirmations, setPendingConfirmations] = useState<PendingConfirmation[]>([]);
  // ✅ CORRIGIDO: useEffect com URL correta
useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar solicitações
        const [requestsRes, servicesRes, branchesRes] = await Promise.all([
          api.get('/service-requests'),
          api.get('/service-catalog'),
          api.get('/clients/my-branches')
        ]);

        // Normalizar requests antes de salvar no estado
        const normalizedRequests = Array.isArray(requestsRes.data)
          ? requestsRes.data.map(normalizeRequest)
          : [];

        setAllRequests(normalizedRequests);
        setServiceOptions(Array.isArray(servicesRes.data) ? servicesRes.data : []);
        setBranches(Array.isArray(branchesRes.data) ? branchesRes.data : []);

        console.log('✅ Dados carregados:', {
          requests: requestsRes.data.length,
          services: servicesRes.data.length,
          branches: branchesRes.data.length
        });

      } catch (error: any) {
        console.error("❌ Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados. Verifique sua conexão.");
        setAllRequests([]);
        setServiceOptions([]);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Limpeza': return '#35BAE6';
      case 'Segurança': return '#22C55E';
      case 'Manutenção': return '#FFFF20';
      case 'Sanitário': return '#8B20EE';
      default: return '#6400A4';
    }
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'Limpeza':
        return { backgroundColor: '#35BAE6', color: 'white' };
      case 'Segurança':
        return { backgroundColor: '#22C55E', color: 'white' };
      case 'Manutenção':
        return { backgroundColor: '#FFFF20', color: '#6400A4' };
      case 'Sanitário':
        return { backgroundColor: '#8B20EE', color: 'white' };
      default:
        return { backgroundColor: '#6400A4', color: 'white' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800 border-none">Aprovado</Badge>;
      case 'em-analise':
        return <Badge className="bg-yellow-100 text-yellow-800 border-none">Em Análise</Badge>;
      case 'agendado':
        return <Badge className="bg-blue-100 text-blue-800 border-none">Agendado</Badge>;
      case 'rejeitado':
        return <Badge className="bg-red-100 text-red-800 border-none">Rejeitado</Badge>;
      case 'pendente':
        return <Badge className="bg-orange-100 text-orange-800 border-none">Pendente</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-none">Pendente</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    return priority === 'urgente' ? (
      <Badge className="bg-red-100 text-red-800 border-none flex items-center">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Urgente
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-none flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        Rotina
      </Badge>
    );
  };

  // ✅ CORRIGIDO: handleSubmitRequest com URL correta
  const handleSubmitRequest = async () => {
    if (!selectedService || !selectedLocation || !description.trim() || !requestedDate || !priority) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    // selectedService agora é um ID numérico
    const service = serviceOptions.find(s => s.id === Number(selectedService));
    const branch = branches.find(b => b.id === Number(selectedLocation));

    if (!service || !branch) {
      toast.error('Serviço ou filial inválidos');
      return;
    }

    // ✅ Converter data de Date para formato ISO (YYYY-MM-DD)
    const formatDateToISO = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // ✅ Payload correto para o backend
    const payload = {
      service_catalog_id: service.id,           // ✅ ID do serviço (não o nome)
      description: description.trim(),
      preferred_date: formatDateToISO(requestedDate),  // ✅ Data em ISO (YYYY-MM-DD)
      priority,                                 // ✅ 'urgente' ou 'rotina'
      branch_id: branch.id                      // ✅ ID da filial
    };

    try {
      const response = await api.post('/service-requests', payload);
      const normalized = normalizeRequest(response.data);
      setAllRequests(prev => [normalized, ...prev]);

      toast.success('Solicitação enviada com sucesso!', {
        description: priority === 'urgente'
          ? 'Solicitação marcada como URGENTE!'
          : 'Sua solicitação está em análise.',
        style: {
          background: '#6400A4',
          color: 'white',
          border: '2px solid #8B20EE'
        }
      });

      // Limpar formulário
      setSelectedService('');
      setSelectedLocation('');
      setDescription('');
      setRequestedDate(undefined);
      setPriority('');
      setIsRequestModalOpen(false);
      setActiveTab('minhas-solicitacoes');

    } catch (error: any) {
      console.error("❌ Erro ao enviar solicitação:", error);
      const message = error.response?.data?.message || "Falha ao enviar solicitação";
      toast.error(message);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setIsRequestModalOpen(true);
  };

  const handleViewRequests = (category: string) => {
    let filteredRequests = [];
    
    switch (category) {
      case 'total':
        filteredRequests = allRequests;
        break;
      case 'aprovadas':
        filteredRequests = allRequests.filter(r => r.status === 'aprovado');
        break;
      case 'urgentes':
        filteredRequests = allRequests.filter(r => r.priority === 'urgente');
        break;
      case 'em-analise':
        filteredRequests = allRequests.filter(r => r.status === 'em-analise');
        break;
      default:
        filteredRequests = allRequests;
    }
    
    setSelectedCategory(category);
    setViewMode('requests');
  };

  const handleOpenConfirmation = (confirmation: PendingConfirmation) => {
    setSelectedConfirmation(confirmation);
    setIsConfirmationDialogOpen(true);
    setRejectionReason('');
  };

  const handleAcceptDate = () => {
    if (selectedConfirmation) {
      toast.success('Data confirmada com sucesso!', {
        description: `O serviço "${selectedConfirmation.serviceType}" foi confirmado para ${selectedConfirmation.proposedDate}.`
      });
      
      setPendingConfirmations(prevConfirmations =>
        prevConfirmations.filter(conf => conf.id !== selectedConfirmation.id)
      );
      
      setIsConfirmationDialogOpen(false);
      setSelectedConfirmation(null);
    }
  };

  const handleRejectDate = () => {
    if (selectedConfirmation && rejectionReason.trim()) {
      toast.info('Data recusada', {
        description: `Sua recusa foi enviada ao gestor. Em breve você receberá uma nova proposta de data.`
      });
      
     
      
      setIsConfirmationDialogOpen(false);
      setSelectedConfirmation(null);
      setRejectionReason('');
    } else {
      toast.error('Por favor, informe o motivo da recusa');
    }
  };

  const selectedServiceInfo = serviceOptions.find(s => s.id === Number(selectedService));

  if (viewMode === 'requests') {
    let filteredRequests = [];
    
    switch (selectedCategory) {
      case 'total':
        filteredRequests = allRequests;
        break;
      case 'aprovadas':
        filteredRequests = allRequests.filter(r => r.status === 'aprovado');
        break;
      case 'urgentes':
        filteredRequests = allRequests.filter(r => r.priority === 'urgente');
        break;
      case 'em-analise':
        filteredRequests = allRequests.filter(r => r.status === 'em-analise');
        break;
      default:
        filteredRequests = allRequests;
    }

    return (
      <RequestsViewScreen
        category={selectedCategory}
        requests={filteredRequests}
        onBack={() => setViewMode('main')}
      />
    );
  }
  
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Clock className="h-6 w-6 mx-auto mb-2 animate-spin" />
        Carregando solicitações do backend...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <ScreenHeader 
            title="Solicitação de Serviços"
            description="Solicite novos serviços e acompanhe o status das suas solicitações."
            onBack={() => onBack?.()}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center space-x-2"
                style={{ backgroundColor: '#6400A4', color: 'white' }}
              >
                <Plus className="h-4 w-4" />
                <span>Nova Solicitação</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] scrollbar-hide">
              <DialogHeader>
                <DialogTitle>Solicitar Novo Serviço</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para solicitar um novo serviço. Nossa equipe entrará em contato em até 2 horas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                <div>
                  <Label htmlFor="service-select">Tipo de Serviço</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger id="service-select">
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">Nenhum serviço disponível</div>
                      ) : (
                        serviceOptions.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name} - {service.category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedServiceInfo && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3 mb-2">
                      <Building2
                        className="h-6 w-6"
                        style={{ color: selectedServiceInfo.category.color }}
                      />
                      <div>
                        <h4 className="text-black">{selectedServiceInfo.name}</h4>
                        <Badge className="text-xs border-none" style={getCategoryStyle(selectedServiceInfo.category.name)}>
                          {selectedServiceInfo.category.name}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{selectedServiceInfo.description}</p>

                    {selectedServiceInfo.duration_value && selectedServiceInfo.duration_type && (
                      <p className="text-xs text-gray-500">
                        ⏱️ {selectedServiceInfo.duration_value} {selectedServiceInfo.duration_type}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="location">Localização/Unidade *</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Selecione a unidade para o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">Nenhuma filial disponível</div>
                      ) : (
                        branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id.toString()}>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{branch.name}</div>
                                <div className="text-xs text-gray-500">{branch.address}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descrição Detalhada</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva em detalhes o serviço que você precisa, incluindo especificidades, áreas de foco, materiais necessários, etc."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="requested-date">Data Desejada</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                        id="requested-date"
                      >
                        <Calendar className="mr-2 h-4 w-4" style={{ color: '#8B20EE' }} />
                        {requestedDate ? requestedDate.toLocaleDateString('pt-BR') : 'Selecione uma data'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={requestedDate}
                        onSelect={setRequestedDate}
                        disabled={(date: Date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Prioridade</Label>
                  <RadioGroup value={priority} onValueChange={setPriority} className="mt-2 space-y-3">
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                        priority === 'urgente' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setPriority('urgente')}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="urgente" id="urgente" />
                        <Label htmlFor="urgente" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <div>
                            <div className="text-black">Urgente</div>
                            <div className="text-sm text-gray-600">Precisa ser realizado o mais rápido possível</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                    <div 
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                        priority === 'rotina' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => setPriority('rotina')}
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="rotina" id="rotina" />
                        <Label htmlFor="rotina" className="flex items-center space-x-2 cursor-pointer flex-1">
                          <Clock className="h-5 w-5" style={{ color: '#8B20EE' }} />
                          <div>
                            <div className="text-black">Serviço de Rotina</div>
                            <div className="text-sm text-gray-600">Pode ser agendado conforme disponibilidade</div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmitRequest}
                  disabled={!selectedService || !selectedLocation || !description.trim() || !requestedDate || !priority}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                  Enviar Solicitação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            className="flex items-center space-x-2"
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            <Bot className="h-4 w-4" />
            <span>IA</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="solicitar" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            Solicitar Serviço
          </TabsTrigger>
          <TabsTrigger value="minhas-solicitacoes" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white relative">
            Minhas Solicitações
            {pendingConfirmations.length > 0 && (
              <Badge 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                style={{ backgroundColor: '#FFFF20', color: '#6400A4' }}
              >
                {pendingConfirmations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solicitar" className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Importante:</strong> Acompanhe o status da sua solicitação aqui no painel, em até 2 horas será atualizado sobre a disponibilidade dos serviços!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 flex-shrink-0">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 cursor-pointer hover:shadow-lg transition-shadow" 
                  style={{ borderColor: '#6400A4' }}
                  onClick={() => handleViewRequests('total')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Solicitações</p>
                  <p className="text-2xl" style={{ color: '#6400A4' }}>{allRequests.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
                </div>
                <Plus className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500 cursor-pointer hover:shadow-lg transition-shadow" 
                  onClick={() => handleViewRequests('aprovadas')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aprovadas</p>
                  <p className="text-2xl text-green-600">
                    {allRequests.filter(r => r.status === 'aprovado').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-500 cursor-pointer hover:shadow-lg transition-shadow" 
                  onClick={() => handleViewRequests('urgentes')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgentes</p>
                  <p className="text-2xl text-red-600">
                    {allRequests.filter(r => r.priority === 'urgente').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 cursor-pointer hover:shadow-lg transition-shadow" 
                  style={{ borderColor: '#FFFF20' }}
                  onClick={() => handleViewRequests('em-analise')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Em Análise</p>
                  <p className="text-2xl text-gray-800">
                    {allRequests.filter(r => r.status === 'em-analise').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Clique para visualizar</p>
                </div>
                <Clock className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Catálogo de Serviços Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {serviceOptions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum serviço disponível
                  </div>
                ) : (
                  serviceOptions.map((service) => (
                    <div
                      key={service.id}
                      className="border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all bg-white hover:scale-105"
                      style={{
                        borderColor: service.category.color,
                        borderTopWidth: '4px'
                      }}
                      onClick={() => handleServiceSelect(service.id.toString())}
                    >
                      <div className="w-full text-left">
                        <div className="flex items-start space-x-3 mb-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: service.category.color + '20' }}
                          >
                            <Building2
                              className="h-6 w-6"
                              style={{ color: service.category.color }}
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-black mb-1">{service.name}</h4>
                            <Badge
                              className="text-xs border-none"
                              style={getCategoryStyle(service.category.name)}
                            >
                              {service.category.name}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        {service.duration_value && service.duration_type && (
                          <p className="text-xs text-gray-500">
                            ⏱️ {service.duration_value} {service.duration_type}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="minhas-solicitacoes" className="space-y-6">
          {pendingConfirmations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-black">Confirmações de Data Pendentes</h3>
              {pendingConfirmations.map((confirmation) => (
                <Card key={confirmation.id} className="border-2 bg-white" style={{ borderColor: '#FFFF20' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <AlertTriangle className="h-6 w-6" style={{ color: '#DAA520' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <p className="font-semibold" style={{ color: '#6400A4' }}>
                              Confirmação de Data Necessária - {confirmation.id}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              O gestor propôs uma data diferente da solicitada para o serviço de <span className="font-medium">{confirmation.serviceType}</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 p-3 bg-gray-50 rounded-lg border">
                          <div>
                            <p className="text-xs text-gray-600">Data Solicitada por Você</p>
                            <p className="font-medium text-gray-900">{confirmation.requestedDate}</p>
                          </div>
                          <div>
                            <p className="text-xs" style={{ color: '#6400A4' }}>Nova Data Proposta pelo Gestor</p>
                            <p className="font-medium" style={{ color: '#6400A4' }}>{confirmation.proposedDate}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleOpenConfirmation(confirmation)}
                            style={{ backgroundColor: '#6400A4', color: 'white' }}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Visualizar e Responder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-black flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" style={{ color: '#8B20EE' }} />
                  Todas as Solicitações
                </div>
                {allRequests.length > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 border-none">
                    {allRequests.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allRequests.length > 0 ? (
                <div className="space-y-4">
                  {allRequests.map((request) => (
                    <div key={request.service_request_id || request.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-black text-sm">{request.service}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      {request.description && (
                        <p className="text-xs text-gray-600 mb-2 bg-gray-50 p-2 rounded">
                          {request.description}
                        </p>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">ID: {request.service_request_id || request.id}</span>
                          {getPriorityBadge(request.priority)}
                        </div>

                        <div className="text-xs text-gray-600">
                          <p>Data solicitada: {request.date}</p>
                          <p>Solicitado em: {request.requestedAt}</p>
                          {request.location && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{request.location}</span>
                            </div>
                          )}

                          {request.area && (
                            <div className="mt-1 text-xs text-gray-500">
                              Área: {request.area}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-black mb-1">Nenhuma solicitação ainda</p>
                  <p className="text-sm text-gray-600">Suas solicitações de serviços aparecerão aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Confirmação de Data de Serviço
            </DialogTitle>
            <DialogDescription>
              {selectedConfirmation?.id} - {selectedConfirmation?.serviceType}
            </DialogDescription>
          </DialogHeader>

          {selectedConfirmation && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Descrição do Serviço</Label>
                  <p className="text-sm text-gray-900">{selectedConfirmation.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-600">Data Solicitada por Você</Label>
                    <p className="font-medium text-gray-900">{selectedConfirmation.requestedDate}</p>
                  </div>
                  <div>
                    <Label className="text-xs" style={{ color: '#6400A4' }}>Nova Data Proposta</Label>
                    <p className="font-medium" style={{ color: '#6400A4' }}>{selectedConfirmation.proposedDate}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Proposto por</Label>
                  <p className="text-sm text-gray-900">{selectedConfirmation.proposedBy}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border-2" style={{ borderColor: '#6400A4', backgroundColor: 'rgba(100, 0, 164, 0.02)' }}>
                <Label className="flex items-center gap-2 mb-2" style={{ color: '#6400A4' }}>
                  <Calendar className="h-4 w-4" />
                  Detalhes do Agendamento
                </Label>
                <p className="text-sm text-gray-700">{selectedConfirmation.scheduledDescription}</p>
                
                {selectedConfirmation.assignedTeam && (
                  <div className="mt-3 pt-3 border-t">
                    <Label className="text-xs text-gray-600">Equipe Alocada</Label>
                    <p className="text-sm font-medium" style={{ color: '#6400A4' }}>{selectedConfirmation.assignedTeam}</p>
                  </div>
                )}
                
                {selectedConfirmation.assignedCollaborator && (
                  <div className="mt-3 pt-3 border-t">
                    <Label className="text-xs text-gray-600">Colaborador Alocado</Label>
                    <p className="text-sm font-medium" style={{ color: '#6400A4' }}>{selectedConfirmation.assignedCollaborator}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Motivo da Recusa (opcional)</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Se você não aceitar a data proposta, informe o motivo ou sugira uma nova data..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Se você recusar, o gestor será notificado e tentará uma nova proposta de data.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-center w-full">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRejectDate}
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Recusar Data
              </Button>
              <Button
                onClick={handleAcceptDate}
                style={{ backgroundColor: '#10B981', color: 'white' }}
                className="hover:opacity-90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aceitar Data Proposta
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Toaster position="top-right" /> 
    </div>
  );
}