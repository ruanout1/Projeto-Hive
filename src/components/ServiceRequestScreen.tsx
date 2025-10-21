import { useState } from 'react';
import { Plus, Calendar, AlertTriangle, CheckCircle, Bot, Clock, Building2, Shield, TreePine, Droplets, Wrench, UserCheck, MapPin, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from './ui/dialog';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './ui/sonner';
import RequestsViewScreen from './RequestsViewScreen';
import ScreenHeader from './ScreenHeader';

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

export default function ServiceRequestScreen({ onBack, initialTab }: ServiceRequestScreenProps) {
  // Simulando cliente logado - em produção viria do contexto/auth
  const currentClient = {
    name: 'Prédio Comercial São Paulo',
    locations: [
      {
        id: 'loc-2',
        name: 'Matriz - Paulista',
        address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
        area: 'centro' as const
      },
      {
        id: 'loc-2b',
        name: 'Filial - Zona Sul',
        address: 'Av. Santo Amaro, 2000 - Brooklin, São Paulo - SP',
        area: 'sul' as const
      }
    ]
  };

  const [selectedService, setSelectedService] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requestedDate, setRequestedDate] = useState<Date | undefined>(undefined);
  const [priority, setPriority] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'main' | 'requests'>('main');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedConfirmation, setSelectedConfirmation] = useState<PendingConfirmation | null>(null);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<string>(initialTab || 'solicitar');

  const serviceOptions = [
    {
      id: 'limpeza-geral',
      name: 'Limpeza Geral',
      icon: Building2,
      description: 'Limpeza completa de ambientes internos e externos',
      estimatedTime: '4-8 horas',
      category: 'Limpeza'
    },
    {
      id: 'limpeza-pesada',
      name: 'Limpeza Pesada',
      icon: Building2,
      description: 'Limpeza profunda pós-obra ou situações especiais',
      estimatedTime: '6-12 horas',
      category: 'Limpeza'
    },
    {
      id: 'limpeza-piscina',
      name: 'Limpeza de Piscina',
      icon: Droplets,
      description: 'Limpeza e tratamento químico de piscinas',
      estimatedTime: '2-4 horas',
      category: 'Limpeza'
    },
    {
      id: 'limpeza-vidros',
      name: 'Limpeza de Vidros',
      icon: Building2,
      description: 'Limpeza especializada de vidros e fachadas',
      estimatedTime: '2-5 horas',
      category: 'Limpeza'
    },
    {
      id: 'portaria',
      name: 'Portaria',
      icon: UserCheck,
      description: 'Serviços de portaria e recepção predial',
      estimatedTime: 'Período contratado',
      category: 'Segurança'
    },
    {
      id: 'seguranca-armada',
      name: 'Segurança Armada',
      icon: Shield,
      description: 'Segurança patrimonial com vigilantes armados',
      estimatedTime: 'Período contratado',
      category: 'Segurança'
    },
    {
      id: 'rondas-noturnas',
      name: 'Rondas Noturnas',
      icon: Shield,
      description: 'Serviço de rondas de segurança no período noturno',
      estimatedTime: 'Período contratado',
      category: 'Segurança'
    },
    {
      id: 'jardinagem',
      name: 'Jardinagem',
      icon: TreePine,
      description: 'Manutenção de jardins, podas e paisagismo',
      estimatedTime: '2-6 horas',
      category: 'Manutenção'
    },
    {
      id: 'manutencao-predial',
      name: 'Manutenção Predial',
      icon: Wrench,
      description: 'Reparos e manutenções gerais do edifício',
      estimatedTime: 'Conforme demanda',
      category: 'Manutenção'
    },
    {
      id: 'zeladoria',
      name: 'Zeladoria',
      icon: Building2,
      description: 'Serviços de zeladoria e manutenção cotidiana',
      estimatedTime: 'Período contratado',
      category: 'Manutenção'
    },
    {
      id: 'manutencao-eletrica',
      name: 'Manutenção Elétrica',
      icon: Wrench,
      description: 'Serviços elétricos e instalações prediais',
      estimatedTime: '2-8 horas',
      category: 'Manutenção'
    },
    {
      id: 'controle-pragas',
      name: 'Controle de Pragas',
      icon: Shield,
      description: 'Dedetização e controle de insetos e roedores',
      estimatedTime: '1-3 horas',
      category: 'Sanitário'
    }
  ];

  // Mock de solicitações aguardando confirmação de data
  const pendingConfirmations: PendingConfirmation[] = [
    {
      id: 'REQ-2024-156',
      serviceType: 'Limpeza Geral',
      description: 'Limpeza completa do escritório incluindo todas as salas, banheiros e área comum',
      requestedDate: '28/10/2024',
      proposedDate: '30/10/2024',
      proposedBy: 'Ana Paula Rodrigues (Gestora)',
      scheduledDescription: 'Agendamento para quarta-feira, 30/10, às 8h. A equipe Alpha completa estará disponível (4 profissionais). Previsão de duração: 6 horas.',
      assignedTeam: 'Equipe Alpha'
    },
    {
      id: 'REQ-2024-142',
      serviceType: 'Jardinagem',
      description: 'Poda de árvores e manutenção do jardim frontal',
      requestedDate: '25/10/2024',
      proposedDate: '27/10/2024',
      proposedBy: 'Ana Paula Rodrigues (Gestora)',
      scheduledDescription: 'Devido à previsão de chuva no dia 25/10, propomos reagendar para domingo 27/10 às 7h, com melhor condição climática. Equipe especializada em jardinagem.',
      assignedCollaborator: 'Pedro Oliveira'
    }
  ];

  const initialRequests = [
    {
      id: 'REQ-2024-045',
      service: 'Limpeza Geral',
      date: '25/09/2024',
      priority: 'rotina',
      status: 'aprovado',
      requestedAt: '23/09/2024 14:30',
      description: 'Limpeza completa do escritório, incluindo todas as salas e áreas comuns.'
    },
    {
      id: 'REQ-2024-044',
      service: 'Limpeza de Piscina',
      date: '24/09/2024',
      priority: 'urgente',
      status: 'em-analise',
      requestedAt: '23/09/2024 10:15',
      description: 'Limpeza urgente da piscina devido ao acúmulo de algas.'
    },
    {
      id: 'REQ-2024-043',
      service: 'Jardinagem',
      date: '26/09/2024',
      priority: 'rotina',
      status: 'agendado',
      requestedAt: '22/09/2024 16:20',
      description: 'Poda das árvores e manutenção dos canteiros do jardim.'
    }
  ];

  const allRequests = [...initialRequests, ...myRequests];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Limpeza': return '#35BAE6'; // Azul
      case 'Segurança': return '#22C55E'; // Verde
      case 'Manutenção': return '#FFFF20'; // Amarelo
      case 'Sanitário': return '#8B20EE'; // Roxo
      default: return '#6400A4';
    }
  };

  const getCategoryStyle = (category: string) => {
    const baseColor = getCategoryColor(category);
    
    switch (category) {
      case 'Limpeza':
        return {
          backgroundColor: '#35BAE6',
          color: 'white'
        };
      case 'Segurança':
        return {
          backgroundColor: '#22C55E',
          color: 'white'
        };
      case 'Manutenção':
        return {
          backgroundColor: '#FFFF20',
          color: '#6400A4'
        };
      case 'Sanitário':
        return {
          backgroundColor: '#8B20EE',
          color: 'white'
        };
      default:
        return {
          backgroundColor: '#6400A4',
          color: 'white'
        };
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

  const handleSubmitRequest = () => {
    if (selectedService && selectedLocation && description.trim() && requestedDate && priority) {
      const newRequestId = `REQ-2024-${String(Date.now()).slice(-3)}`;
      const serviceName = serviceOptions.find(s => s.id === selectedService)?.name || selectedService;
      const location = currentClient.locations.find(l => l.id === selectedLocation);
      
      const newRequest = {
        id: newRequestId,
        service: serviceName,
        location: location?.name,
        area: location?.area,
        description: description.trim(),
        date: requestedDate.toLocaleDateString('pt-BR'),
        priority,
        status: 'em-analise', // Mudança: agora vai direto para em-analise
        requestedAt: new Date().toLocaleString('pt-BR')
      };

      setMyRequests(prev => [newRequest, ...prev]);

      // Toast mais chamativo com cores da marca
      toast.success('🎉 Solicitação enviada com sucesso!', {
        description: priority === 'urgente' 
          ? '⚡ Solicitação marcada como URGENTE - Nossa equipe será notificada imediatamente!' 
          : '📋 Sua solicitação está em análise. Retornaremos em até 2 horas.',
        style: {
          background: '#6400A4',
          color: 'white',
          border: '2px solid #8B20EE',
          fontSize: '16px'
        }
      });

      // Reset do formulário
      setSelectedService('');
      setSelectedLocation('');
      setDescription('');
      setRequestedDate(undefined);
      setPriority('');
      setIsRequestModalOpen(false);
    } else {
      toast.error('Preencha todos os campos obrigatórios!');
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

  const selectedServiceInfo = serviceOptions.find(s => s.id === selectedService);

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
                      {serviceOptions.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedServiceInfo && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3 mb-2">
                      <selectedServiceInfo.icon 
                        className="h-6 w-6" 
                        style={{ color: getCategoryColor(selectedServiceInfo.category) }} 
                      />
                      <div>
                        <h4 className="text-black">{selectedServiceInfo.name}</h4>
                        <Badge 
                          className="text-xs border-none"
                          style={getCategoryStyle(selectedServiceInfo.category)}
                        >
                          {selectedServiceInfo.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{selectedServiceInfo.description}</p>
                    <p className="text-xs text-gray-500">Tempo estimado: {selectedServiceInfo.estimatedTime}</p>
                  </div>
                )}

                <div>
                  <Label htmlFor="location">Localização/Unidade *</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Selecione a unidade para o serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentClient.locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{location.name}</div>
                              <div className="text-xs text-gray-500">{location.address}</div>
                              <Badge 
                                className="text-xs mt-1" 
                                style={{ 
                                  backgroundColor: `rgba(100, 0, 164, 0.1)`,
                                  color: '#6400A4'
                                }}
                              >
                                Área: {location.area.charAt(0).toUpperCase() + location.area.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
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
                        disabled={(date) => date < new Date()}
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

          {/* Estatísticas */}
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
        {/* Catálogo de Serviços Expandido */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Catálogo de Serviços Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceOptions.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.id}
                    className="border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all bg-white hover:scale-105"
                    style={{ 
                      borderColor: getCategoryColor(service.category),
                      borderTopWidth: '4px'
                    }}
                    onClick={() => handleServiceSelect(service.id)}
                  >
                    <div className="w-full text-left">
                      <div className="flex items-start space-x-3 mb-3">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: getCategoryColor(service.category) + '20' }}
                        >
                          <IconComponent 
                            className="h-6 w-6" 
                            style={{ color: getCategoryColor(service.category) }} 
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-black mb-1">{service.name}</h4>
                          <Badge 
                            className="text-xs border-none"
                            style={getCategoryStyle(service.category)}
                          >
                            {service.category}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <p className="text-xs text-gray-500">⏱️ {service.estimatedTime}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Minhas Solicitações */}

      </div>
        </TabsContent>

        <TabsContent value="minhas-solicitacoes" className="space-y-6">
          {/* Alertas de Confirmação Pendente */}
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

          {/* Lista de Todas as Solicitações */}
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
                    <div key={request.id} className="border rounded-lg p-3 hover:shadow-sm transition-shadow">
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
                          <span className="text-gray-600">ID: {request.id}</span>
                          {getPriorityBadge(request.priority)}
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          <p>Data solicitada: {request.date}</p>
                          <p>Solicitado em: {request.requestedAt}</p>
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

      {/* Dialog de Confirmação de Data */}
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
              {/* Informações do Serviço */}
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

              {/* Detalhes do Agendamento */}
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

              {/* Motivo da Recusa (se for recusar) */}
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