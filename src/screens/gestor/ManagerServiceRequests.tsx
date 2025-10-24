import { useState } from 'react';
import { FileText, CheckCircle, Clock, XCircle, Users, MessageSquare, Filter, Search, Eye, Calendar, UserCog, AlertTriangle, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar as CalendarComponent } from '../../components/ui/calendar';
import { toast } from 'sonner';

type RequestStatus = 'pending' | 'urgent' | 'delegated' | 'refused-by-manager' | 'approved' | 'awaiting-client-confirmation' | 'in-progress' | 'completed' | 'rejected';

interface StatusConfig {
  label: string;
  color: string;
  style?: React.CSSProperties; // opcional
  icon: React.ElementType; // o componente do ícone (Clock, CheckCircle, etc)
}



interface PhotoDocumentation {
  beforePhotos: string[];
  afterPhotos: string[];
  uploadDate: string;
  uploadedBy: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface ServiceRequest {
  id: string;
  clientName: string;
  clientArea: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  clientLocation?: string;
  serviceType: string;
  description: string;
  requestDate: string;
  requestTime?: string;
  preferredDate: string;
  status: RequestStatus;
  urgentReason?: string; // Motivo da urgência sinalizada pelo admin
  assignedManager?: string;
  assignedManagerArea?: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  assignedTeam?: string;
  assignedTeamMembers?: string[]; // IDs dos membros selecionados da equipe
  assignedCollaborator?: string;
  observations?: string;
  availableDates?: string[]; // Datas de disponibilidade adicionadas por admin/gestor
  managerRefusalReason?: string;
  scheduledDate?: string;
  scheduledDescription?: string;
  photoDocumentation?: PhotoDocumentation;
}

export default function ManagerServiceRequests() {
  // Simulando o gestor logado - em produção viria do contexto/auth
  const currentManager = {
    name: 'Ana Paula Rodrigues',
    areas: ['norte', 'centro'] as ('norte' | 'sul' | 'leste' | 'oeste' | 'centro')[]
  };

  // Mock de equipes e seus membros
  const teams: Record<string, TeamMember[]> = {
    'Equipe Alpha': [
      { id: 'mem-1', name: 'Carlos Silva', role: 'Faxineiro' },
      { id: 'mem-2', name: 'Maria Santos', role: 'Serviços Gerais' },
      { id: 'mem-3', name: 'João Pedro', role: 'Limpeza Especializada' },
      { id: 'mem-4', name: 'Ana Costa', role: 'Auxiliar de Limpeza' },
    ],
    'Equipe Beta': [
      { id: 'mem-5', name: 'Pedro Oliveira', role: 'Jardineiro' },
      { id: 'mem-6', name: 'Julia Mendes', role: 'Paisagista' },
      { id: 'mem-7', name: 'Roberto Lima', role: 'Auxiliar de Jardinagem' },
    ],
    'Equipe Gamma': [
      { id: 'mem-8', name: 'João Santos', role: 'Jardineiro' },
      { id: 'mem-9', name: 'Fernanda Costa', role: 'Limpeza Comercial' },
      { id: 'mem-10', name: 'Lucas Andrade', role: 'Auxiliar' },
      { id: 'mem-11', name: 'Patricia Rocha', role: 'Serviços Gerais' },
    ],
    'Equipe Delta': [
      { id: 'mem-12', name: 'Maria Silva', role: 'Limpeza Hospitalar' },
      { id: 'mem-13', name: 'Andre Souza', role: 'Desinfecção' },
      { id: 'mem-14', name: 'Carla Dias', role: 'Auxiliar' },
    ],
    'Equipe Epsilon': [
      { id: 'mem-15', name: 'Ricardo Fernandes', role: 'Manutenção' },
      { id: 'mem-16', name: 'Beatriz Alves', role: 'Eletricista' },
      { id: 'mem-17', name: 'Diego Martins', role: 'Encanador' },
      { id: 'mem-18', name: 'Simone Barros', role: 'Auxiliar de Manutenção' },
    ]
  };

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  
  const [originalRequest, setOriginalRequest] = useState<ServiceRequest | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoDocumentation | null>(null);
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isEscalateDialogOpen, setIsEscalateDialogOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>(undefined);

  // Todas as solicitações do sistema
  const allRequests: ServiceRequest[] = [
    {
      id: 'REQ-2024-001',
      clientName: 'Shopping Center Norte',
      clientArea: 'norte',
      clientLocation: 'Unidade Principal',
      serviceType: 'Limpeza Profunda',
      description: 'Limpeza completa de todos os andares, incluindo áreas comuns e banheiros',
      requestDate: '10/10/2024',
      requestTime: '14:30',
      preferredDate: '20/10/2024',
      status: 'delegated',
      assignedManager: 'Ana Paula Rodrigues',
      assignedManagerArea: 'norte'
    },
    {
      id: 'REQ-2024-002',
      clientName: 'Escritório Corporate',
      clientArea: 'oeste',
      serviceType: 'Limpeza de Vidros',
      description: 'Limpeza externa e interna de vidros de fachada',
      requestDate: '11/10/2024',
      preferredDate: '22/10/2024',
      status: 'approved',
      assignedTeam: 'Equipe Alpha',
      observations: 'Cliente solicitou horário específico: 08:00'
    },
    {
      id: 'REQ-2024-003',
      clientName: 'Condomínio Residencial',
      clientArea: 'oeste',
      serviceType: 'Jardinagem',
      description: 'Manutenção de jardins e poda de árvores',
      requestDate: '12/10/2024',
      preferredDate: '18/10/2024',
      status: 'in-progress',
      assignedTeam: 'Equipe Gamma',
      assignedCollaborator: 'João Santos',
      observations: 'Serviço em andamento conforme cronograma'
    },
    {
      id: 'REQ-2024-004',
      clientName: 'Hospital Santa Maria',
      clientArea: 'sul',
      serviceType: 'Limpeza Hospitalar',
      description: 'Limpeza especializada em ambiente hospitalar',
      requestDate: '08/10/2024',
      preferredDate: '15/10/2024',
      status: 'completed',
      assignedTeam: 'Equipe Delta',
      assignedCollaborator: 'Maria Silva',
      observations: 'Serviço concluído com excelência',
      photoDocumentation: {
        beforePhotos: [
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
          'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400'
        ],
        afterPhotos: [
          'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400',
          'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=400',
          'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400',
          'https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=400'
        ],
        uploadDate: '15/10/2024 - 09:45',
        uploadedBy: 'Maria Silva'
      }
    },
    {
      id: 'REQ-2024-005',
      clientName: 'Prédio Comercial',
      clientArea: 'centro',
      clientLocation: 'Matriz - Paulista',
      serviceType: 'Manutenção Elétrica',
      description: 'Troca de lâmpadas e manutenção preventiva',
      requestDate: '09/10/2024',
      preferredDate: '16/10/2024',
      status: 'rejected',
      observations: 'Cliente cancelou a solicitação'
    },
    {
      id: 'REQ-2024-006',
      clientName: 'Clínica Médica Central',
      clientArea: 'centro',
      serviceType: 'Limpeza Especializada',
      description: 'Limpeza e desinfecção de consultórios médicos',
      requestDate: '13/10/2024',
      preferredDate: '25/10/2024',
      status: 'pending'
    },
    {
      id: 'REQ-2024-007',
      clientName: 'Escritório Zona Leste',
      clientArea: 'leste',
      serviceType: 'Limpeza Geral',
      description: 'Limpeza completa do escritório',
      requestDate: '14/10/2024',
      preferredDate: '21/10/2024',
      status: 'pending'
    },
    {
      id: 'REQ-2024-008',
      clientName: 'Academia Fitness Norte',
      clientArea: 'norte',
      serviceType: 'Limpeza Profunda',
      description: 'Limpeza profunda de vestiários e áreas de treino',
      requestDate: '15/10/2024',
      preferredDate: '23/10/2024',
      status: 'awaiting-client-confirmation',
      scheduledDate: '25/10/2024',
      assignedTeam: 'Equipe Alpha',
      scheduledDescription: 'Agendado para 25/10 às 06:00. Equipe completa para realizar limpeza profunda.',
      observations: 'Data alterada devido à disponibilidade da equipe'
    },
    {
      id: 'REQ-2024-009',
      clientName: 'Restaurante Gourmet Centro',
      clientArea: 'centro',
      serviceType: 'Dedetização Urgente',
      description: 'Problema de pragas identificado na cozinha, precisa de atenção imediata antes da fiscalização sanitária',
      requestDate: '20/10/2024',
      requestTime: '16:45',
      preferredDate: '21/10/2024',
      status: 'urgent',
      urgentReason: 'Fiscalização sanitária agendada para 22/10. O cliente precisa do serviço realizado até 21/10 às 18h para evitar multas e possível interdição. Solicitação marcada como urgente pelo administrador.',
      assignedManager: 'Ana Paula Rodrigues',
      assignedManagerArea: 'centro'
    }
  ];

  // Filtrar solicitações apenas das áreas de responsabilidade do gestor
  // E incluir solicitações delegadas especificamente para este gestor
  const [requests, setRequests] = useState<ServiceRequest[]>(
    allRequests.filter(req => 
      currentManager.areas.includes(req.clientArea) || 
      (req.status === 'delegated' && req.assignedManager === currentManager.name)
    )
  );

  const getStatusConfig = (status: RequestStatus): StatusConfig => {
    const configs: Record<RequestStatus, StatusConfig> = {
      pending: { 
        label: 'Pendente', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      },
      urgent: {
        label: 'Urgente',
        color: 'bg-red-100 text-red-800',
        icon: AlertTriangle
      },
      delegated: {
        label: 'Aguardando Resposta',
        color: '',
        style: { backgroundColor: 'rgba(139, 32, 238, 0.1)', color: '#8B20EE' },
        icon: UserCog
      },
      'refused-by-manager': {
        label: 'Recusada',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      },
      approved: { 
        label: 'Aprovado', 
        color: '', 
        style: { backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' },
        icon: CheckCircle 
      },
      'awaiting-client-confirmation': {
        label: 'Aguardando Confirmação do Cliente',
        color: '',
        style: { backgroundColor: 'rgba(255, 255, 32, 0.1)', color: '#DAA520' },
        icon: Clock
      },
      'in-progress': { 
        label: 'Em Andamento', 
        color: '', 
        style: { backgroundColor: 'rgba(139, 32, 238, 0.1)', color: '#8B20EE' },
        icon: Users 
      },
      completed: { 
        label: 'Concluído', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      rejected: { 
        label: 'Rejeitado', 
        color: 'bg-red-100 text-red-800', 
        icon: XCircle 
      }
    };
    return configs[status];
  };

  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setOriginalRequest(JSON.parse(JSON.stringify(request))); // Deep copy
    setSelectedTeamMembers(request.assignedTeamMembers || []); // Inicializa membros selecionados
    // Inicializar data do calendário se já existe uma data agendada
    if (request.scheduledDate) {
      setSelectedCalendarDate(new Date(request.scheduledDate));
    } else {
      setSelectedCalendarDate(undefined);
    }
    setIsCalendarOpen(false);
    setIsDetailsOpen(true);
  };

  const hasRequestChanges = () => {
    if (!selectedRequest || !originalRequest) return false;
    return JSON.stringify(selectedRequest) !== JSON.stringify(originalRequest);
  };

  const handleViewPhotos = (documentation: PhotoDocumentation, type: 'before' | 'after', index: number = 0) => {
    setSelectedPhotos(documentation);
    setPhotoType(type);
    setSelectedPhotoIndex(index);
    setIsPhotoDialogOpen(true);
  };

  const handleSaveRequest = () => {
    if (selectedRequest) {
      setRequests(requests.map(req => 
        req.id === selectedRequest.id ? selectedRequest : req
      ));
      setIsDetailsOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleAcceptRequest = () => {
    if (!selectedRequest || !selectedRequest.scheduledDate) {
      toast.error('Selecione uma data para o reagendamento');
      return;
    }

    // Comparar data agendada com data preferida do cliente
    const scheduledDateFormatted = new Date(selectedRequest.scheduledDate).toLocaleDateString('pt-BR');
    const isDateDifferent = scheduledDateFormatted !== selectedRequest.preferredDate;

    const updatedRequest = {
      ...selectedRequest,
      status: isDateDifferent ? 'awaiting-client-confirmation' as RequestStatus : 'approved' as RequestStatus,
      assignedTeamMembers: selectedTeamMembers.length > 0 ? selectedTeamMembers : undefined,
    };

    setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
    setIsDetailsOpen(false);
    setSelectedRequest(null);
    setSelectedTeamMembers([]);
    
    if (isDateDifferent) {
      toast.success('Solicitação aceita! Data diferente da solicitada - aguardando confirmação do cliente.');
    } else {
      toast.success('Solicitação aceita e agendamento confirmado!');
    }
  };



  const handleEscalateToAdmin = () => {
    if (selectedRequest && escalationReason) {
      const updatedRequest = {
        ...selectedRequest,
        status: 'refused-by-manager' as RequestStatus,
        managerRefusalReason: escalationReason
      };
      setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
      setIsEscalateDialogOpen(false);
      setIsDetailsOpen(false);
      setEscalationReason('');
      toast.success('Solicitação encaminhada ao administrador para reavaliação.');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch = req.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    delegated: requests.filter(r => r.status === 'delegated').length,
    urgent: requests.filter(r => r.status === 'urgent').length,
    approved: requests.filter(r => r.status === 'approved').length,
    awaitingClient: requests.filter(r => r.status === 'awaiting-client-confirmation').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="p-6 overflow-hidden">
      <div className="mb-6">
        <h1 className="hive-screen-title">Solicitações de Serviço</h1>
        <p className="text-black">
          Gerencie solicitações e coordene a distribuição de equipes.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-600">Suas áreas de responsabilidade:</span>
          {currentManager.areas.map(area => (
            <Badge key={area} style={{ backgroundColor: '#6400A4', color: 'white' }}>
              {area.charAt(0).toUpperCase() + area.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
          <p className="text-sm text-gray-600 mb-2">Total</p>
          <p className="text-2xl" style={{ color: '#6400A4' }}>
            {statusCounts.total}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <UserCog className="h-3 w-3" />
            Delegadas
          </p>
          <p className="text-2xl" style={{ color: '#8B20EE' }}>
            {statusCounts.delegated}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFAA00' }}>
          <p className="text-sm text-gray-600 mb-2">Pendentes</p>
          <p className="text-2xl" style={{ color: '#FFAA00' }}>
            {statusCounts.pending}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
          <p className="text-sm text-gray-600 mb-2">Aprovados</p>
          <p className="text-2xl" style={{ color: '#35BAE6' }}>
            {statusCounts.approved}
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#DAA520' }}>
          <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Aguard. Cliente
          </p>
          <p className="text-2xl" style={{ color: '#DAA520' }}>
            {statusCounts.awaitingClient}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
          <p className="text-sm text-gray-600 mb-2">Em Andamento</p>
          <p className="text-2xl" style={{ color: '#8B20EE' }}>
            {statusCounts.inProgress}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2" style={{ borderColor: '#16a34a' }}>
          <p className="text-sm text-gray-600 mb-2">Concluídos</p>
          <p className="text-2xl" style={{ color: '#16a34a' }}>
            {statusCounts.completed}
          </p>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, serviço ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="delegated">Delegadas para Mim</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="urgent">Urgentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="awaiting-client-confirmation">Aguardando Cliente</SelectItem>
                  <SelectItem value="in-progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                  <SelectItem value="refused-by-manager">Recusadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Cards de Solicitações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredRequests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="bg-white rounded-2xl p-12">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhuma solicitação encontrada</p>
            </div>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const statusConfig = getStatusConfig(request.status);
            const StatusIcon = statusConfig.icon;
            
            const getAreaColor = (area: string) => {
              const colors = {
                norte: '#8B20EE',
                sul: '#35BAE6',
                leste: '#FFFF20',
                oeste: '#6400A4',
                centro: '#000000'
              };
              return colors[area as keyof typeof colors] || '#6400A4';
            };
            
            return (
              <Card 
                key={request.id} 
                className="hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleViewRequest(request)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{request.clientName}</CardTitle>
                      {request.clientLocation && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{request.clientLocation}</p>
                      )}
                    </div>
                    <Badge 
                      className={`${statusConfig.color} border-none flex items-center gap-1 flex-shrink-0`}
                      style={statusConfig.style}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* ID da Solicitação */}
                  <div>
                    <p className="text-xs text-gray-500">ID da Solicitação</p>
                    <p className="text-sm font-mono" style={{ color: '#6400A4' }}>
                      {request.id}
                    </p>
                  </div>
                  
                  {/* Tipo de Serviço */}
                  <div>
                    <p className="text-xs text-gray-500">Tipo de Serviço</p>
                    <p className="text-sm">{request.serviceType}</p>
                  </div>

                  {/* Descrição */}
                  <div>
                    <p className="text-xs text-gray-500">Descrição</p>
                    <p className="text-sm line-clamp-2">{request.description}</p>
                  </div>

                  {/* Área e Data */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Área</p>
                      <Badge 
                        style={{ 
                          backgroundColor: `${getAreaColor(request.clientArea)}15`,
                          color: getAreaColor(request.clientArea),
                          border: `1px solid ${getAreaColor(request.clientArea)}40`
                        }}
                      >
                        {request.clientArea.charAt(0).toUpperCase() + request.clientArea.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Data Preferencial</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <p className="text-sm">{request.preferredDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Equipe Designada */}
                  {request.assignedTeam && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-1">Equipe Designada</p>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" style={{ color: '#8B20EE' }} />
                        <p className="text-sm" style={{ color: '#8B20EE' }}>
                          {request.assignedTeam}
                          {request.assignedCollaborator && ` • ${request.assignedCollaborator}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Alerta para solicitações delegadas */}
                  {request.status === 'delegated' && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'rgba(139, 32, 238, 0.05)' }}>
                        <UserCog className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold" style={{ color: '#8B20EE' }}>Delegada para você</p>
                          <p className="text-xs text-gray-600">Aguardando sua resposta</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Alerta para solicitações urgentes */}
                  {request.status === 'urgent' && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-red-600">Urgência Sinalizada</p>
                          <p className="text-xs text-gray-600">Requer atenção imediata</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botão Ver Detalhes */}
                  <Button 
                    className="w-full mt-2" 
                    variant="outline"
                    style={{ borderColor: '#6400A4', color: '#6400A4' }}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      handleViewRequest(request);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog de Detalhes/Edição */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col items-center">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {selectedRequest?.status === 'urgent' ? 'Visualização - Urgência Sinalizada' : 'Gerenciar Solicitação'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.id} - {selectedRequest?.status === 'urgent' ? 'Solicitação urgente requer atenção imediata' : 'Atribuir equipes e coordenar a execução'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 w-full max-w-3xl">
              {/* Alerta para solicitações urgentes */}
              {selectedRequest.status === 'urgent' && selectedRequest.urgentReason && (
                <div className="p-4 rounded-lg border-2 border-red-500 bg-red-50 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-700">Urgência Sinalizada pelo Administrador</p>
                      <p className="text-sm text-red-600 mt-1">
                        {selectedRequest.urgentReason}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Esta solicitação requer atenção imediata. Por favor, responda o mais breve possível.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-2">
                    {/* Linha com botão e campo de data */}
                    <div className="flex gap-3 items-center">
                      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            size="sm"
                            style={{ backgroundColor: '#6400A4', color: 'white' }}
                            className="hover:opacity-90"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Propor Nova Data
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={selectedCalendarDate}
                            onSelect={(date: Date) => {
                              if (date && selectedRequest) {
                                setSelectedCalendarDate(date);
                                // Formatar a data para o formato do input
                                const formattedDate = date.toISOString().split('T')[0];
                                setSelectedRequest({
                                  ...selectedRequest,
                                  scheduledDate: formattedDate
                                });
                                toast.success(`Data proposta: ${date.toLocaleDateString('pt-BR')}`);
                                setIsCalendarOpen(false);
                                // Focar no campo de data após selecionar
                                setTimeout(() => {
                                  document.querySelector('input[type="date"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }, 100);
                              }
                            }}
                            disabled={(date: Date) => date < new Date()} // Desabilita datas passadas
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      
                      {/* Campo de visualização da data proposta */}
                      {selectedRequest.scheduledDate && (
                        <div className="flex-1 p-2 rounded-lg border bg-white">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-700">Nova Data Proposta para Reagendamento:</p>
                              <p className="text-sm text-gray-700">
                                {new Date(selectedRequest.scheduledDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Botão de encaminhar para admin */}
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setIsDetailsOpen(false);
                          setIsEscalateDialogOpen(true);
                        }}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Encaminhar para Admin
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Informações do Cliente e Serviço */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Cliente</Label>
                  <Input value={selectedRequest.clientName} disabled />
                </div>
                <div>
                  <Label>Tipo de Serviço</Label>
                  <Input value={selectedRequest.serviceType} disabled />
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Textarea value={selectedRequest.description} disabled rows={2} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Data de Solicitação</Label>
                  <Input value={selectedRequest.requestDate} disabled />
                </div>
                <div>
                  <Label>Data Preferencial do Cliente</Label>
                  <Input value={selectedRequest.preferredDate} disabled />
                </div>
              </div>

              {/* Data de Agendamento - apenas para pending/delegated */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'delegated') && (
                <div className="p-4 rounded-lg border-2" style={{ borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                  <Label className="flex items-center gap-2 mb-3" style={{ color: '#10B981' }}>
                    <Calendar className="h-4 w-4" />
                    Data do Agendamento*
                  </Label>
                  <Input
                    type="date"
                    value={selectedRequest.scheduledDate || ''}
                    onChange={(e) => setSelectedRequest({
                      ...selectedRequest,
                      scheduledDate: e.target.value
                    })}
                  />
                  {selectedRequest.scheduledDate && new Date(selectedRequest.scheduledDate).toLocaleDateString('pt-BR') !== selectedRequest.preferredDate && (
                    <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm flex items-center gap-2" style={{ color: '#DAA520' }}>
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Data diferente da solicitada</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        O cliente receberá uma notificação para confirmar a nova data proposta
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Alocação de Equipe ou Colaborador */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'delegated') && (
                <div className="space-y-4 p-4 rounded-lg border-2" style={{ borderColor: '#6400A4', backgroundColor: 'rgba(100, 0, 164, 0.02)' }}>
                  <div>
                    <p className="font-semibold mb-1" style={{ color: '#6400A4' }}>Alocação de Recursos*</p>
                    <p className="text-sm text-gray-600">Escolha uma equipe (completa ou parcial) OU um colaborador específico</p>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Equipe</Label>
                    <Select
                      value={selectedRequest.assignedTeam || ''}
                      onValueChange={(value: string) => {
                        setSelectedRequest({
                          ...selectedRequest,
                          assignedTeam: value,
                          assignedCollaborator: '', // Limpa colaborador ao selecionar equipe
                          assignedTeamMembers: [] // Reseta membros selecionados
                        });
                        setSelectedTeamMembers([]); // Reseta seleção local
                      }}
                      disabled={!!selectedRequest.assignedCollaborator}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Equipe Alpha">Equipe Alpha</SelectItem>
                        <SelectItem value="Equipe Beta">Equipe Beta</SelectItem>
                        <SelectItem value="Equipe Gamma">Equipe Gamma</SelectItem>
                        <SelectItem value="Equipe Delta">Equipe Delta</SelectItem>
                        <SelectItem value="Equipe Epsilon">Equipe Epsilon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Colaborador Único</Label>
                    <Select
                      value={selectedRequest.assignedCollaborator || ''}
                      onValueChange={(value: string) => {
                        setSelectedRequest({
                          ...selectedRequest,
                          assignedCollaborator: value,
                          assignedTeam: '', // Limpa equipe ao selecionar colaborador
                          assignedTeamMembers: [] // Limpa membros
                        });
                        setSelectedTeamMembers([]); // Reseta seleção local
                      }}
                      disabled={!!selectedRequest.assignedTeam}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o colaborador" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Carlos Silva">Carlos Silva</SelectItem>
                        <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                        <SelectItem value="João Santos">João Santos</SelectItem>
                        <SelectItem value="Ana Oliveira">Ana Oliveira</SelectItem>
                        <SelectItem value="Pedro Costa">Pedro Costa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Seleção de Membros da Equipe */}
                {selectedRequest.assignedTeam && teams[selectedRequest.assignedTeam] && (
                  <div className="p-4 rounded-lg border bg-white">
                    <Label className="mb-3 block">Selecione os membros da {selectedRequest.assignedTeam}</Label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {teams[selectedRequest.assignedTeam].map((member) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                          <Checkbox
                            id={member.id}
                            checked={selectedTeamMembers.includes(member.id)}
                            onCheckedChange={(checked: string) => {
                              if (checked) {
                                const newMembers = [...selectedTeamMembers, member.id];
                                setSelectedTeamMembers(newMembers);
                                setSelectedRequest({
                                  ...selectedRequest,
                                  assignedTeamMembers: newMembers
                                });
                              } else {
                                const newMembers = selectedTeamMembers.filter(id => id !== member.id);
                                setSelectedTeamMembers(newMembers);
                                setSelectedRequest({
                                  ...selectedRequest,
                                  assignedTeamMembers: newMembers
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={member.id}
                            className="flex-1 cursor-pointer min-w-0"
                          >
                            <p className="text-sm font-medium truncate">{member.name}</p>
                            <p className="text-xs text-gray-500 truncate">{member.role}</p>
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedTeamMembers.length > 0 && (
                      <p className="text-xs text-gray-600 mt-3">
                        {selectedTeamMembers.length} de {teams[selectedRequest.assignedTeam].length} membros selecionados
                      </p>
                    )}
                    {selectedTeamMembers.length === 0 && (
                      <p className="text-xs text-gray-500 mt-3 italic">
                        Selecione ao menos um membro ou deixe em branco para incluir toda a equipe
                      </p>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* Descrição do Agendamento - apenas para pending/delegated */}
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'delegated') && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Descrição do Agendamento*
                  </Label>
                  <Textarea
                    placeholder="Descreva os detalhes do agendamento: horário, observações especiais, instruções para a equipe..."
                    value={selectedRequest.scheduledDescription || ''}
                    onChange={(e) => setSelectedRequest({
                      ...selectedRequest,
                      scheduledDescription: e.target.value
                    })}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              )}

              {/* Observações Gerais */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Observações Gerais
                </Label>
                <Textarea
                  placeholder="Adicione observações sobre a coordenação da equipe..."
                  value={selectedRequest.observations || ''}
                  onChange={(e) => setSelectedRequest({
                    ...selectedRequest,
                    observations: e.target.value
                  })}
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Documentação Fotográfica */}
              {selectedRequest.photoDocumentation && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4" style={{ color: '#6400A4' }} />
                    <p className="font-semibold" style={{ color: '#6400A4' }}>Documentação Fotográfica</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fotos "Antes" */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Fotos "Antes" ({selectedRequest.photoDocumentation.beforePhotos.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedRequest.photoDocumentation.beforePhotos.slice(0, 3).map((photo, idx) => (
                          <div 
                            key={idx}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => handleViewPhotos(selectedRequest.photoDocumentation!, 'before', idx)}
                          >
                            <img 
                              src={photo} 
                              alt={`Antes ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fotos "Depois" */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Fotos "Depois" ({selectedRequest.photoDocumentation.afterPhotos.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedRequest.photoDocumentation.afterPhotos.slice(0, 3).map((photo, idx) => (
                          <div 
                            key={idx}
                            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => handleViewPhotos(selectedRequest.photoDocumentation!, 'after', idx)}
                          >
                            <img 
                              src={photo} 
                              alt={`Depois ${idx + 1}`}
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Enviado em {selectedRequest.photoDocumentation.uploadDate} por {selectedRequest.photoDocumentation.uploadedBy}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="w-full max-w-3xl">
            {(selectedRequest?.status === 'delegated' || selectedRequest?.status === 'pending' || selectedRequest?.status === 'urgent') && (
              <div className="flex w-full justify-center">
                <Button
                  style={{ backgroundColor: '#10B981', color: 'white' }}
                  className="hover:opacity-90"
                  onClick={handleAcceptRequest}
                  disabled={!selectedRequest.scheduledDate}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Reagendamento
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Dialog de Encaminhar para Admin */}
      <Dialog open={isEscalateDialogOpen} onOpenChange={setIsEscalateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Encaminhar Solicitação para Administrador
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.id} - {selectedRequest?.clientName}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {/* Informações da Solicitação */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div>
                  <Label className="text-xs text-gray-500">Serviço</Label>
                  <p className="text-sm">{selectedRequest.serviceType}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Data Preferencial</Label>
                  <p className="text-sm">{selectedRequest.preferredDate}</p>
                </div>
                {selectedRequest.urgentReason && (
                  <div>
                    <Label className="text-xs text-gray-500">Motivo da Urgência</Label>
                    <p className="text-sm text-red-600">{selectedRequest.urgentReason}</p>
                  </div>
                )}
              </div>

              {/* Motivo do Encaminhamento */}
              <div>
                <Label>Motivo do Encaminhamento*</Label>
                <Textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Explique por que está encaminhando para o administrador (ex: impossibilidade de atender no prazo solicitado, necessidade de recursos adicionais, conflito de agenda, etc.)"
                  rows={4}
                  style={{ borderColor: '#6400A4' }}
                  className="focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O administrador receberá esta solicitação e poderá tomar providências alternativas.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-center w-full">
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => {
                setIsEscalateDialogOpen(false);
                setEscalationReason('');
              }}>
                Cancelar
              </Button>
              <Button
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                className="hover:opacity-90"
                onClick={handleEscalateToAdmin}
                disabled={!escalationReason}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Encaminhar para Admin
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Visualização de Fotos */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Documentação Fotográfica - {photoType === 'before' ? 'Antes' : 'Depois'}
            </DialogTitle>
          </DialogHeader>

          {selectedPhotos && (
            <div className="space-y-4">
              {/* Foto Principal */}
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img 
                  src={photoType === 'before' 
                    ? selectedPhotos.beforePhotos[selectedPhotoIndex]
                    : selectedPhotos.afterPhotos[selectedPhotoIndex]
                  }
                  alt={`${photoType === 'before' ? 'Antes' : 'Depois'} ${selectedPhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Miniaturas */}
              <div className="grid grid-cols-6 gap-2">
                {(photoType === 'before' ? selectedPhotos.beforePhotos : selectedPhotos.afterPhotos).map((photo, idx) => (
                  <div 
                    key={idx}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      idx === selectedPhotoIndex 
                        ? 'border-purple-600 ring-2 ring-purple-300' 
                        : 'border-gray-200 hover:border-purple-400'
                    }`}
                    onClick={() => setSelectedPhotoIndex(idx)}
                  >
                    <img 
                      src={photo} 
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Botões de Navegação */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhotoType(photoType === 'before' ? 'after' : 'before');
                    setSelectedPhotoIndex(0);
                  }}
                  style={{ borderColor: '#6400A4', color: '#6400A4' }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Ver Fotos "{photoType === 'before' ? 'Depois' : 'Antes'}"
                </Button>

                <div className="text-sm text-gray-600">
                  {selectedPhotoIndex + 1} / {(photoType === 'before' ? selectedPhotos.beforePhotos : selectedPhotos.afterPhotos).length}
                </div>

                <Button
                  onClick={() => setIsPhotoDialogOpen(false)}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
