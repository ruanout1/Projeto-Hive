import { useState } from 'react';
import ScreenHeader from './ScreenHeader';
import { FileText, CheckCircle, Clock, XCircle, Users, Upload, MessageSquare, Filter, Search, Eye, Calendar, DollarSign, AlertTriangle, UserCog, Edit, Trash, FileCheck, Trash2, MapPin, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';

type RequestStatus = 'pending' | 'urgent' | 'delegated' | 'refused-by-manager' | 'approved' | 'in-progress' | 'completed' | 'rejected';

interface PhotoDocumentation {
  beforePhotos: string[];
  afterPhotos: string[];
  uploadDate: string;
  uploadedBy: string;
}

interface ServiceRequest {
  id: string;
  clientName: string;
  clientArea: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  clientLocation?: string;
  serviceType: string;
  description: string;
  requestDate: string;
  requestTime: string;
  preferredDate: string;
  status: RequestStatus;
  assignedTeam?: string;
  assignedCollaborator?: string;
  assignedManager?: string;
  assignedManagerArea?: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  observations?: string;
  availableDates?: string[];
  urgentReason?: string;
  refusalReason?: string;
  refusalDate?: string;
  invoice?: {
    number: string;
    amount: number;
    issueDate: string;
    availableToClient?: boolean;
  };
  photoDocumentation?: PhotoDocumentation;
}

interface ServiceRequestsManagementProps {
  onBack?: () => void;
}

export default function ServiceRequestsManagement({ onBack }: ServiceRequestsManagementProps) {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({ number: '', amount: '', issueDate: '' });
  const [isDelegatingToManager, setIsDelegatingToManager] = useState(false);
  const [isMarkingUrgent, setIsMarkingUrgent] = useState(false);
  const [hasChosenProcessingMode, setHasChosenProcessingMode] = useState(false);
  const [isManageInvoiceDialogOpen, setIsManageInvoiceDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [newAvailableDate, setNewAvailableDate] = useState('');
  const [originalRequest, setOriginalRequest] = useState<ServiceRequest | null>(null);
  const [originalInvoiceData, setOriginalInvoiceData] = useState({ number: '', amount: '', issueDate: '' });
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoDocumentation | null>(null);
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const getElapsedTime = (requestDate: string, requestTime: string) => {
    const [day, month, year] = requestDate.split('/');
    const [hours, minutes] = requestTime.split(':');
    const requestDateTime = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    const now = new Date();
    const diffMs = now.getTime() - requestDateTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      totalHours: diffHours,
      hours: Math.floor(diffHours),
      minutes: diffMinutes,
      isUrgent: diffHours >= 1.5 && diffHours < 2,
      isCritical: diffHours >= 2
    };
  };

  const [requests, setRequests] = useState<ServiceRequest[]>([
    {
      id: 'REQ-2024-001',
      clientName: 'Shopping Center Norte',
      clientArea: 'norte',
      clientLocation: 'Unidade Principal - 3º Andar',
      serviceType: 'Limpeza Profunda',
      description: 'Limpeza completa de todos os andares, incluindo áreas comuns e banheiros',
      requestDate: '10/10/2024',
      requestTime: '14:30',
      preferredDate: '20/10/2024',
      status: 'urgent',
      urgentReason: 'Solicitação sem resposta há mais de 1.5 horas',
      assignedManager: 'Ana Paula Rodrigues',
      assignedManagerArea: 'norte'
    },
    {
      id: 'REQ-2024-002',
      clientName: 'Escritório Corporate',
      clientArea: 'oeste',
      serviceType: 'Limpeza de Vidros',
      description: 'Limpeza externa e interna de vidros de fachada',
      requestDate: '14/10/2024',
      requestTime: '08:15',
      preferredDate: '22/10/2024',
      status: 'pending'
    },
    {
      id: 'REQ-2024-003',
      clientName: 'Condomínio Residencial',
      clientArea: 'oeste',
      serviceType: 'Jardinagem',
      description: 'Manutenção de jardins e poda de árvores',
      requestDate: '13/10/2024',
      requestTime: '10:00',
      preferredDate: '18/10/2024',
      status: 'approved',
      assignedTeam: 'Equipe Gamma',
      assignedManager: 'Ana Paula Silva',
      observations: 'Aprovado pelo gestor Ana Paula'
    },
    {
      id: 'REQ-2024-004',
      clientName: 'Hospital Santa Maria',
      clientArea: 'sul',
      serviceType: 'Limpeza Hospitalar',
      description: 'Limpeza especializada em ambiente hospitalar',
      requestDate: '12/10/2024',
      requestTime: '16:20',
      preferredDate: '15/10/2024',
      status: 'in-progress',
      assignedTeam: 'Equipe Delta',
      assignedCollaborator: 'Maria Silva',
      assignedManager: 'Roberto Costa',
      observations: 'Serviço em andamento conforme cronograma'
    },
    {
      id: 'REQ-2024-005',
      clientName: 'Hospital Central',
      clientArea: 'centro',
      serviceType: 'Limpeza Hospitalar',
      description: 'Limpeza especializada em ambiente hospitalar',
      requestDate: '08/10/2024',
      requestTime: '09:45',
      preferredDate: '15/10/2024',
      status: 'completed',
      assignedTeam: 'Equipe Delta',
      assignedCollaborator: 'Maria Silva',
      assignedManager: 'Roberto Costa',
      observations: 'Serviço concluído com excelência',
      invoice: {
        number: 'NF-2024-089',
        amount: 8500,
        issueDate: '15/10/2024'
      },
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
      id: 'REQ-2024-006',
      clientName: 'Edifício Comercial Paulista',
      clientArea: 'oeste',
      clientLocation: 'Torre A - Andares 5 a 10',
      serviceType: 'Manutenção de Ar Condicionado',
      description: 'Manutenção preventiva completa do sistema de ar condicionado central',
      requestDate: '14/10/2024',
      requestTime: '16:45',
      preferredDate: '25/10/2024',
      status: 'refused-by-manager',
      assignedManager: 'Roberto Lima',
      assignedManagerArea: 'oeste',
      refusalReason: 'Equipe técnica sem disponibilidade nesta data devido a outras manutenções agendadas. Próxima data disponível: 28/10/2024',
      refusalDate: '15/10/2024'
    }
  ]);

  const getStatusConfig = (status: RequestStatus) => {
    const configs = {
      'pending': { 
        label: 'Pendente', 
        color: 'bg-yellow-100 text-yellow-800',
        style: { backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' },
        icon: Clock
      },
      'urgent': { 
        label: 'Urgência Sinalizada', 
        color: 'bg-red-100 text-red-800',
        style: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' },
        icon: AlertTriangle
      },
      'delegated': { 
        label: 'Delegado', 
        color: 'bg-purple-100 text-purple-800',
        style: { backgroundColor: 'rgba(139, 32, 238, 0.1)', color: '#8B20EE' },
        icon: UserCog
      },
      'refused-by-manager': { 
        label: 'Recusado por Gestor', 
        color: 'bg-orange-100 text-orange-800',
        style: { backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#ea580c' },
        icon: XCircle
      },
      'approved': { 
        label: 'Aprovado', 
        color: 'bg-blue-100 text-blue-800',
        style: { backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' },
        icon: CheckCircle
      },
      'in-progress': { 
        label: 'Em Andamento', 
        color: 'bg-purple-100 text-purple-800',
        style: { backgroundColor: 'rgba(139, 32, 238, 0.1)', color: '#8B20EE' },
        icon: Users
      },
      'completed': { 
        label: 'Concluído', 
        color: 'bg-green-100 text-green-800',
        style: { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' },
        icon: CheckCircle
      },
      'rejected': { 
        label: 'Rejeitado', 
        color: 'bg-red-100 text-red-800',
        style: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' },
        icon: XCircle
      }
    };
    return configs[status];
  };

  const handleApprove = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setOriginalRequest(JSON.parse(JSON.stringify(request))); // Deep copy
    setIsDelegatingToManager(false);
    setHasChosenProcessingMode(false);
    setIsDetailsOpen(true);
  };

  const handleViewPhotos = (documentation: PhotoDocumentation, type: 'before' | 'after', index: number = 0) => {
    setSelectedPhotos(documentation);
    setPhotoType(type);
    setSelectedPhotoIndex(index);
    setIsPhotoDialogOpen(true);
  };

  const hasRequestChanges = () => {
    if (!selectedRequest || !originalRequest) return false;
    return JSON.stringify(selectedRequest) !== JSON.stringify(originalRequest);
  };

  const handleSaveRequest = () => {
    if (selectedRequest) {
      setRequests(requests.map(r => 
        r.id === selectedRequest.id ? selectedRequest : r
      ));
      setIsDetailsOpen(false);
      setHasChosenProcessingMode(false);
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      setRequests(requests.map(r => 
        r.id === selectedRequest.id ? { ...r, status: 'rejected' as RequestStatus } : r
      ));
      setIsDetailsOpen(false);
      setHasChosenProcessingMode(false);
    }
  };

  const handleManageInvoice = (request: ServiceRequest) => {
    setSelectedRequest(request);
    const initialInvoiceData = request.invoice ? {
      number: request.invoice.number,
      amount: request.invoice.amount.toString(),
      issueDate: request.invoice.issueDate
    } : { number: '', amount: '', issueDate: '' };
    
    setInvoiceData(initialInvoiceData);
    setOriginalInvoiceData(initialInvoiceData);
    setIsManageInvoiceDialogOpen(true);
  };

  const hasInvoiceChanges = () => {
    return JSON.stringify(invoiceData) !== JSON.stringify(originalInvoiceData);
  };

  const handleSaveInvoice = () => {
    if (selectedRequest) {
      const updatedRequest = {
        ...selectedRequest,
        invoice: {
          number: invoiceData.number,
          amount: parseFloat(invoiceData.amount),
          issueDate: invoiceData.issueDate,
          availableToClient: selectedRequest.invoice?.availableToClient || false
        }
      };
      setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
      setIsManageInvoiceDialogOpen(false);
      setInvoiceData({ number: '', amount: '', issueDate: '' });
    }
  };

  const handleToggleInvoiceVisibility = () => {
    if (selectedRequest?.invoice) {
      const updatedRequest = {
        ...selectedRequest,
        invoice: {
          ...selectedRequest.invoice,
          availableToClient: !selectedRequest.invoice.availableToClient
        }
      };
      setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
      setSelectedRequest(updatedRequest);
    }
  };

  const handleDeleteInvoice = () => {
    if (selectedRequest) {
      const updatedRequest = { ...selectedRequest };
      delete updatedRequest.invoice;
      setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
      setIsManageInvoiceDialogOpen(false);
      setInvoiceData({ number: '', amount: '', issueDate: '' });
    }
  };

  const handleOpenAvailabilityDialog = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setNewAvailableDate('');
    setIsAvailabilityDialogOpen(true);
  };

  const handleAddAvailableDate = () => {
    if (selectedRequest && newAvailableDate) {
      const updatedRequest = {
        ...selectedRequest,
        availableDates: [...(selectedRequest.availableDates || []), newAvailableDate]
      };
      setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
      setSelectedRequest(updatedRequest);
      setNewAvailableDate('');
    }
  };

  const handleRemoveAvailableDate = (dateToRemove: string) => {
    if (selectedRequest) {
      const updatedRequest = {
        ...selectedRequest,
        availableDates: (selectedRequest.availableDates || []).filter(date => date !== dateToRemove)
      };
      setRequests(requests.map(r => r.id === selectedRequest.id ? updatedRequest : r));
      setSelectedRequest(updatedRequest);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    urgent: requests.filter(r => {
      if (r.status !== 'pending') return false;
      const elapsed = getElapsedTime(r.requestDate, r.requestTime);
      return elapsed.isUrgent || elapsed.isCritical;
    }).length,
    approved: requests.filter(r => r.status === 'approved').length,
    inProgress: requests.filter(r => r.status === 'in-progress').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getAreaBadgeColor = (area: string) => {
    const colors = {
      norte: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
      sul: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e' },
      leste: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316' },
      oeste: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7' },
      centro: { bg: 'rgba(100, 0, 164, 0.1)', text: '#6400A4' }
    };
    return colors[area as keyof typeof colors] || colors.centro;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ScreenHeader 
                title="Solicitações de Serviço"
                description="Visualize, aprove e gerencie todas as solicitações de serviço dos clientes."
                onBack={() => onBack?.()}
              />
            </div>
          </div>

          {/* Alerta de Solicitações Críticas */}
          {statusCounts.urgent > 0 && (
            <div className="mb-6 border-2 border-red-500 bg-red-50 rounded-xl p-4">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-red-600">
                    Atenção: {statusCounts.urgent} solicitação(ões) com mais de 1.5 horas sem resposta
                  </h3>
                  <p className="text-sm text-gray-700 mt-1">
                    Solicitações pendentes há mais de 2 horas devem ser designadas para um gestor.
                  </p>
                </div>
                <Button
                  size="sm"
                  style={{ backgroundColor: '#ef4444', color: 'white' }}
                  onClick={() => setStatusFilter('pending')}
                >
                  Ver Pendentes
                </Button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl" style={{ color: '#6400A4' }}>{statusCounts.total}</p>
                </div>
                <FileText className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-2xl text-yellow-600">{statusCounts.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Urgentes
                  </p>
                  <p className="text-2xl text-red-600">{statusCounts.urgent}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">&gt; 1.5h sem resposta</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aprovados</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{statusCounts.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Em Andamento</p>
                  <p className="text-2xl" style={{ color: '#8B20EE' }}>{statusCounts.inProgress}</p>
                </div>
                <Users className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concluídos</p>
                  <p className="text-2xl text-green-600">{statusCounts.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
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
                placeholder="Buscar por cliente, serviço ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="approved">Aprovados</TabsTrigger>
                <TabsTrigger value="in-progress">Em Andamento</TabsTrigger>
                <TabsTrigger value="completed">Concluídos</TabsTrigger>
                <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;
              const elapsed = request.status === 'pending' ? getElapsedTime(request.requestDate, request.requestTime) : null;
              const areaColor = getAreaBadgeColor(request.clientArea);
              
              return (
                <div
                  key={request.id}
                  className={`bg-white rounded-2xl p-5 hover:shadow-md transition-all border-2 ${
                    elapsed?.isCritical ? 'border-red-500 bg-red-50' : 
                    elapsed?.isUrgent ? 'border-orange-500 bg-orange-50' : 
                    'border-transparent hover:border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <Avatar 
                        className="h-12 w-12 flex-shrink-0" 
                        style={{ 
                          backgroundColor: elapsed?.isCritical ? '#ef4444' : 
                                          elapsed?.isUrgent ? '#f97316' : '#6400A4' 
                        }}
                      >
                        <AvatarFallback 
                          style={{ 
                            backgroundColor: elapsed?.isCritical ? '#ef4444' : 
                                            elapsed?.isUrgent ? '#f97316' : '#6400A4',
                            color: 'white' 
                          }}
                        >
                          {getInitials(request.clientName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <h3 style={{ color: '#6400A4' }}>
                            {request.id} - {request.clientName}
                          </h3>
                          <Badge
                            className={`${statusConfig.color} border-none flex items-center gap-1`}
                            style={statusConfig.style}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                          <Badge
                            style={{ backgroundColor: areaColor.bg, color: areaColor.text }}
                            className="border-none flex items-center gap-1"
                          >
                            <MapPin className="h-3 w-3" />
                            {request.clientArea.charAt(0).toUpperCase() + request.clientArea.slice(1)}
                          </Badge>
                          {request.status === 'pending' && request.assignedManager && (
                            <Badge 
                              className="border-none flex items-center gap-1"
                              style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)', color: '#6400A4' }}
                            >
                              <UserCog className="h-3 w-3" />
                              Designado
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                            <span className="truncate">{request.serviceType}</span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: '#35BAE6' }} />
                            <span className="truncate">
                              Solicitado: {request.requestDate} {request.requestTime}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                            <span className="truncate">
                              Preferência: {request.preferredDate}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          <p className="line-clamp-1">{request.description}</p>
                        </div>

                        <div className="flex items-center flex-wrap gap-3 mt-3 text-xs text-gray-500">
                          {elapsed && (
                            <div className="flex items-center space-x-1">
                              <Clock className={`h-3 w-3 ${
                                elapsed.isCritical ? 'text-red-600' : 
                                elapsed.isUrgent ? 'text-orange-600' : 
                                'text-gray-600'
                              }`} />
                              <span className={
                                elapsed.isCritical ? 'text-red-600 font-semibold' : 
                                elapsed.isUrgent ? 'text-orange-600 font-semibold' : 
                                'text-gray-600'
                              }>
                                Tempo decorrido: {elapsed.hours}h {elapsed.minutes}m
                              </span>
                              {elapsed.isCritical && (
                                <Badge className="bg-red-600 text-white border-none text-xs ml-1">
                                  CRÍTICO +2h
                                </Badge>
                              )}
                              {elapsed.isUrgent && !elapsed.isCritical && (
                                <Badge className="bg-orange-500 text-white border-none text-xs ml-1">
                                  URGENTE
                                </Badge>
                              )}
                            </div>
                          )}
                          {request.invoice && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <FileText className="h-3 w-3" />
                              <span>NF: {request.invoice.number}</span>
                            </div>
                          )}
                          {request.availableDates && request.availableDates.length > 0 && (
                            <div className="flex items-center space-x-1" style={{ color: '#35BAE6' }}>
                              <Calendar className="h-3 w-3" style={{ color: '#35BAE6' }} />
                              <span>{request.availableDates.length} data(s) disponível(is)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(request)}
                        className="whitespace-nowrap"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                      {request.status === 'completed' && !request.invoice && (
                        <Button
                          size="sm"
                          style={{ backgroundColor: '#FFFF20', color: '#000' }}
                          onClick={() => handleManageInvoice(request)}
                          className="whitespace-nowrap"
                        >
                          <Upload className="h-3 w-3 mr-1" />
                          Adicionar NF
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dialog de Detalhes/Edição */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Detalhes da Solicitação
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.id} - Gerencie a solicitação do cliente
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-2">
              {/* Para solicitações pendentes: mostrar primeiro apenas tempo + opção de escolha */}
              {selectedRequest.status === 'pending' && !hasChosenProcessingMode ? (
                <>
                  {/* Alerta de Tempo Decorrido */}
                  {(() => {
                    const elapsed = getElapsedTime(selectedRequest.requestDate, selectedRequest.requestTime);
                    return (
                      <div 
                        className="p-4 rounded-lg border-2 flex items-start gap-2"
                        style={{ 
                          backgroundColor: elapsed.isCritical ? 'rgba(239, 68, 68, 0.1)' : elapsed.isUrgent ? 'rgba(249, 115, 22, 0.1)' : 'rgba(53, 186, 230, 0.1)',
                          borderColor: elapsed.isCritical ? '#ef4444' : elapsed.isUrgent ? '#f97316' : '#35BAE6'
                        }}
                      >
                        <Clock className={`h-5 w-5 flex-shrink-0 ${elapsed.isCritical ? 'text-red-600' : elapsed.isUrgent ? 'text-orange-600' : 'text-blue-600'}`} />
                        <div className="flex-1">
                          <p className={`font-semibold ${elapsed.isCritical ? 'text-red-600' : elapsed.isUrgent ? 'text-orange-600' : 'text-blue-600'}`}>
                            {elapsed.isCritical ? '⚠️ Crítica - Mais de 2h!' : 
                             elapsed.isUrgent ? '⏰ Próxima do limite de 2h' :
                             '🕐 Tempo decorrido'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Aberta há: <strong>{elapsed.hours}h {elapsed.minutes}m</strong>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedRequest.requestDate} às {selectedRequest.requestTime}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Opção de Delegação ou Gestão Direta */}
                  <div className="border-2 rounded-lg p-4" style={{ borderColor: '#6400A4', backgroundColor: 'rgba(100, 0, 164, 0.02)' }}>
                    <div className="flex items-start gap-2 mb-3">
                      <UserCog className="h-5 w-5 mt-0.5" style={{ color: '#6400A4' }} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-black">Como processar?</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Delegar para um gestor ou sinalizar como urgente
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setIsDelegatingToManager(true);
                          setIsMarkingUrgent(false);
                          setHasChosenProcessingMode(true);
                        }}
                      >
                        <UserCog className="h-4 w-4 mr-2" />
                        Delegar para Gestor
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setIsDelegatingToManager(false);
                          setIsMarkingUrgent(true);
                          setHasChosenProcessingMode(true);
                        }}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Sinalizar Urgência
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Mostrar informações completas */}
                  <div className="grid grid-cols-2 gap-4">
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
                    <Textarea value={selectedRequest.description} disabled rows={3} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data de Solicitação</Label>
                      <Input value={`${selectedRequest.requestDate} ${selectedRequest.requestTime}`} disabled />
                    </div>
                    <div>
                      <Label>Data Preferencial</Label>
                      <Input value={selectedRequest.preferredDate} disabled />
                    </div>
                  </div>

                  {/* Datas Disponíveis */}
                  {selectedRequest.availableDates && selectedRequest.availableDates.length > 0 && (
                    <div className="space-y-2">
                      <Label style={{ color: '#35BAE6' }}>Datas Disponíveis para Agendamento</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedRequest.availableDates.map((date, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            {date}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Alerta de Tempo para pendentes que já escolheram o modo */}
                  {selectedRequest.status === 'pending' && hasChosenProcessingMode && (() => {
                    const elapsed = getElapsedTime(selectedRequest.requestDate, selectedRequest.requestTime);
                    if (elapsed.isUrgent || elapsed.isCritical) {
                      return (
                        <div 
                          className="p-3 rounded-lg border flex items-start gap-2"
                          style={{ 
                            backgroundColor: elapsed.isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                            borderColor: elapsed.isCritical ? '#ef4444' : '#f97316'
                          }}
                        >
                          <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${elapsed.isCritical ? 'text-red-600' : 'text-orange-600'}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${elapsed.isCritical ? 'text-red-600' : 'text-orange-600'}`}>
                              {elapsed.isCritical ? 'Crítica - Mais de 2h!' : 'Urgente - Próxima do limite'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {elapsed.hours}h {elapsed.minutes}m
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Campos de acordo com o modo escolhido */}
                  {selectedRequest.status === 'pending' && hasChosenProcessingMode && (
                    <div className="border-t pt-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setHasChosenProcessingMode(false);
                          setIsDelegatingToManager(false);
                          setIsMarkingUrgent(false);
                        }}
                        className="text-gray-600 mb-4"
                      >
                        ← Voltar
                      </Button>

                      {isDelegatingToManager ? (
                        <>
                          <Label>Designar Gestor</Label>
                          <Select 
                            value={selectedRequest.assignedManager || ''} 
                            onValueChange={(value) => {
                              const managerArea = value === 'Ana Paula Silva - Oeste' ? 'oeste' :
                                                 value === 'Roberto Costa - Sul' ? 'sul' :
                                                 value === 'Carlos Mendes - Norte' ? 'norte' : 'centro';
                              setSelectedRequest({
                                ...selectedRequest, 
                                assignedManager: value,
                                assignedManagerArea: managerArea as 'norte' | 'sul' | 'leste' | 'oeste' | 'centro'
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um gestor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ana Paula Silva - Oeste">Ana Paula Silva - Oeste</SelectItem>
                              <SelectItem value="Roberto Costa - Sul">Roberto Costa - Sul</SelectItem>
                              <SelectItem value="Carlos Mendes - Norte">Carlos Mendes - Norte</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-2">
                            O gestor receberá esta solicitação e poderá aceitá-la ou recusá-la.
                          </p>
                        </>
                      ) : isMarkingUrgent ? (
                        <>
                          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="font-semibold text-red-600">Sinalizar como Urgente</h4>
                                <p className="text-sm text-red-700 mt-1">
                                  Esta solicitação será marcada como urgente e terá prioridade no sistema.
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Label>Motivo da Urgência</Label>
                            <Textarea
                              value={selectedRequest.observations || ''}
                              onChange={(e) => setSelectedRequest({...selectedRequest, observations: e.target.value})}
                              placeholder="Descreva o motivo da urgência..."
                              rows={3}
                            />
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}

                  {/* Mostrar recusa do gestor */}
                  {selectedRequest.status === 'refused-by-manager' && selectedRequest.managerRefusalReason && (
                    <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start gap-2 mb-2">
                        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-red-600">Recusada pelo Gestor</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Gestor: {selectedRequest.assignedManager}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-red-700">Motivo da Recusa</Label>
                        <Textarea 
                          value={selectedRequest.managerRefusalReason} 
                          disabled 
                          rows={3}
                          className="bg-white border-red-300"
                        />
                      </div>
                      <div className="mt-3">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest({
                              ...selectedRequest,
                              status: 'pending',
                              assignedManager: undefined,
                              assignedManagerArea: undefined,
                              managerRefusalReason: undefined
                            });
                            setHasChosenProcessingMode(false);
                          }}
                          style={{ backgroundColor: '#6400A4', color: 'white' }}
                          className="w-full"
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Designar Outro Gestor
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Para solicitações delegadas */}
                  {selectedRequest.status === 'delegated' && (
                    <div className="border-2 rounded-lg p-4" style={{ borderColor: '#8B20EE', backgroundColor: 'rgba(139, 32, 238, 0.05)' }}>
                      <div className="flex items-start gap-2">
                        <UserCog className="h-5 w-5 flex-shrink-0" style={{ color: '#8B20EE' }} />
                        <div>
                          <h4 className="font-semibold" style={{ color: '#8B20EE' }}>Aguardando Resposta do Gestor</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Gestor designado: <strong>{selectedRequest.assignedManager}</strong>
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            O gestor receberá esta solicitação e decidirá se aceita ou recusa.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Para outros status, mostrar informações */}
                  {!['pending', 'delegated', 'refused-by-manager'].includes(selectedRequest.status) && (
                    <div className="space-y-3 border-t pt-4">
                      {selectedRequest.assignedManager && (
                        <div>
                          <Label>Gestor</Label>
                          <Input value={selectedRequest.assignedManager} disabled />
                        </div>
                      )}
                      {selectedRequest.assignedTeam && (
                        <div>
                          <Label>Equipe</Label>
                          <Input value={selectedRequest.assignedTeam} disabled />
                        </div>
                      )}
                      {selectedRequest.assignedCollaborator && (
                        <div>
                          <Label>Colaborador</Label>
                          <Input value={selectedRequest.assignedCollaborator} disabled />
                        </div>
                      )}
                      {selectedRequest.scheduledDate && (
                        <div>
                          <Label>Data Agendada</Label>
                          <Input value={selectedRequest.scheduledDate} disabled />
                        </div>
                      )}
                      {selectedRequest.scheduledDescription && (
                        <div>
                          <Label>Descrição do Agendamento</Label>
                          <Textarea value={selectedRequest.scheduledDescription} disabled rows={3} />
                        </div>
                      )}
                      {selectedRequest.observations && (
                        <div>
                          <Label>Observações</Label>
                          <Textarea value={selectedRequest.observations} disabled rows={3} />
                        </div>
                      )}
                      
                      {/* Documentação Fotográfica */}
                      {selectedRequest.photoDocumentation && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2 mb-3">
                            <Camera className="h-4 w-4" style={{ color: '#6400A4' }} />
                            <p className="font-semibold" style={{ color: '#6400A4' }}>Documentação Fotográfica</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Fotos "Antes" */}
                            <div>
                              <p className="text-xs text-gray-600 mb-2">Fotos "Antes" ({selectedRequest.photoDocumentation.beforePhotos.length})</p>
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
                            <div>
                              <p className="text-xs text-gray-600 mb-2">Fotos "Depois" ({selectedRequest.photoDocumentation.afterPhotos.length})</p>
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

                          <div className="mt-2 text-xs text-gray-500">
                            Enviado em {selectedRequest.photoDocumentation.uploadDate} por {selectedRequest.photoDocumentation.uploadedBy}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDetailsOpen(false);
              setHasChosenProcessingMode(false);
              setIsDelegatingToManager(false);
              setIsMarkingUrgent(false);
            }}>
              Fechar
            </Button>
            {selectedRequest?.status === 'pending' && hasChosenProcessingMode && (
              <Button
                style={{ backgroundColor: '#10B981', color: 'white' }}
                disabled={isDelegatingToManager && !selectedRequest.assignedManager}
                onClick={() => {
                  if (selectedRequest) {
                    if (isDelegatingToManager) {
                      // Delegar para gestor
                      setSelectedRequest({...selectedRequest, status: 'delegated'});
                      handleSaveRequest();
                      toast.success(`Solicitação delegada para ${selectedRequest.assignedManager}`);
                    } else if (isMarkingUrgent) {
                      // Marcar como urgente
                      setSelectedRequest({...selectedRequest, status: 'urgent'});
                      handleSaveRequest();
                      toast.success('Solicitação marcada como urgente!');
                    }
                    setIsDetailsOpen(false);
                    setHasChosenProcessingMode(false);
                    setIsDelegatingToManager(false);
                    setIsMarkingUrgent(false);
                  }
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isDelegatingToManager ? 'Delegar ao Gestor' : 'Marcar como Urgente'}
              </Button>
            )}
            {selectedRequest?.status === 'refused-by-manager' && (
              <Button
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                onClick={() => {
                  setSelectedRequest({
                    ...selectedRequest,
                    status: 'pending',
                    assignedManager: undefined,
                    assignedManagerArea: undefined,
                    managerRefusalReason: undefined
                  });
                  setHasChosenProcessingMode(false);
                  handleSaveRequest();
                  toast.success('Solicitação reaberta para redesignação');
                }}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Redesignar para Outro Gestor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Gerenciar Nota Fiscal */}
      <Dialog open={isManageInvoiceDialogOpen} onOpenChange={setIsManageInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {selectedRequest?.invoice ? 'Gerenciar Nota Fiscal' : 'Adicionar Nota Fiscal'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.id} - {selectedRequest?.clientName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Número da NF</Label>
              <Input
                value={invoiceData.number}
                onChange={(e) => setInvoiceData({...invoiceData, number: e.target.value})}
                placeholder="NF-2024-XXX"
              />
            </div>

            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                value={invoiceData.amount}
                onChange={(e) => setInvoiceData({...invoiceData, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Data de Emissão</Label>
              <Input
                type="date"
                value={invoiceData.issueDate}
                onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
              />
            </div>

            {selectedRequest?.invoice && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <Label className="mb-0">Disponível para o cliente</Label>
                </div>
                <Button
                  size="sm"
                  variant={selectedRequest.invoice.availableToClient ? "default" : "outline"}
                  onClick={handleToggleInvoiceVisibility}
                  style={selectedRequest.invoice.availableToClient ? { backgroundColor: '#10B981', color: 'white' } : {}}
                >
                  {selectedRequest.invoice.availableToClient ? 'Visível' : 'Oculto'}
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            {selectedRequest?.invoice && (
              <Button variant="outline" onClick={handleDeleteInvoice} className="text-red-600 border-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir NF
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsManageInvoiceDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveInvoice} 
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              disabled={!invoiceData.number || !invoiceData.amount || !invoiceData.issueDate || !hasInvoiceChanges()}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Disponibilidades */}
      <Dialog open={isAvailabilityDialogOpen} onOpenChange={setIsAvailabilityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#35BAE6' }}>
              Gerenciar Datas Disponíveis
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.id} - {selectedRequest?.clientName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Adicionar Nova Data</Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={newAvailableDate}
                  onChange={(e) => setNewAvailableDate(e.target.value)}
                />
                <Button 
                  onClick={handleAddAvailableDate}
                  style={{ backgroundColor: '#35BAE6', color: 'white' }}
                  disabled={!newAvailableDate}
                >
                  <Calendar className="h-4 w-4 mr-2" style={{ color: 'white' }} />
                  Adicionar
                </Button>
              </div>
            </div>

            {selectedRequest?.availableDates && selectedRequest.availableDates.length > 0 && (
              <div>
                <Label>Datas Cadastradas</Label>
                <div className="space-y-2 mt-2">
                  {selectedRequest.availableDates.map((date, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{date}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveAvailableDate(date)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAvailabilityDialogOpen(false)}>
              Fechar
            </Button>
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
            <DialogDescription>
              Navegue pelas fotos enviadas pelo colaborador
            </DialogDescription>
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
