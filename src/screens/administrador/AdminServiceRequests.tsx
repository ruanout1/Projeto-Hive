import { useState } from 'react';
import ScreenHeader from '../public/ScreenHeader';
import { FileText, CheckCircle, Clock, XCircle, Users, Upload, MessageSquare, Filter, Search, Eye, Calendar, DollarSign, AlertTriangle, UserCog, Edit, Trash, FileCheck, Trash2, MapPin, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

// Tipos e interfaces (mantidos do código original)
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

interface AdminServiceRequestsProps {
  onBack?: () => void;
}

export default function AdminServiceRequests({ onBack }: AdminServiceRequestsProps) {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({ number: '', amount: '', issueDate: '' });
  const [isManageInvoiceDialogOpen, setIsManageInvoiceDialogOpen] = useState(false);
  const [isAvailabilityDialogOpen, setIsAvailabilityDialogOpen] = useState(false);
  const [newAvailableDate, setNewAvailableDate] = useState('');
  const [originalRequest, setOriginalRequest] = useState<ServiceRequest | null>(null);
  const [originalInvoiceData, setOriginalInvoiceData] = useState({ number: '', amount: '', issueDate: '' });
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<PhotoDocumentation | null>(null);
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Funções auxiliares (mantidas do código original)
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

  // Estado das solicitações (será substituído por chamadas de API)
  const [requests, setRequests] = useState<ServiceRequest[]>([
    // ... (mantenha os dados mock do código original)
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
  
  // Garante que sempre retorna um valor válido
  return configs[status] || configs.pending;

  };

  // Funções específicas do ADMIN
  const handleApprove = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setOriginalRequest(JSON.parse(JSON.stringify(request)));
    setIsDetailsOpen(true);
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

  const handleViewPhotos = (documentation: PhotoDocumentation, type: 'before' | 'after', index: number = 0) => {
    setSelectedPhotos(documentation);
    setPhotoType(type);
    setSelectedPhotoIndex(index);
    setIsPhotoDialogOpen(true);
  };

  // Filtros e estatísticas
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
                title="Solicitações de Serviço - Administração"
                description="Visualize, gerencie e acompanhe todas as solicitações de serviço do sistema."
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
            {/* ... (mantenha os cards de estatísticas do código original) */}
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
                      {/* ... (mantenha a estrutura de informações da solicitação) */}
                    </div>

                    {/* Actions - Ações específicas do ADMIN */}
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
                      {/* Ações adicionais do ADMIN */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenAvailabilityDialog(request)}
                        className="whitespace-nowrap"
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        Datas
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dialogs específicos do ADMIN */}
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
            {/* ... (mantenha o formulário de NF) */}
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
              disabled={!invoiceData.number || !invoiceData.amount || !invoiceData.issueDate}
            >
              <FileCheck className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Outros dialogs do ADMIN */}
      {/* ... (mantenha os outros dialogs do código original) */}
    </div>
  );
}