import { useState } from 'react';
import ScreenHeader from '../public/ScreenHeader';
import { FileText, CheckCircle, Clock, XCircle, Users, Filter, Search, Eye, Calendar, AlertTriangle, UserCog, MapPin, Camera } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

// Tipos e interfaces (compartilhados)
type RequestStatus = 'pending' | 'urgent' | 'delegated' | 'refused-by-manager' | 'approved' | 'in-progress' | 'completed' | 'rejected';

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
  photoDocumentation?: any;
}

interface ManagerServiceRequestsProps {
  onBack?: () => void;
  managerArea?: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  managerName?: string;
}

export default function ManagerServiceRequests({ 
  onBack, 
  managerArea = 'oeste', 
  managerName = 'Ana Paula Silva' 
}: ManagerServiceRequestsProps) {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refusalReason, setRefusalReason] = useState('');

  // Estado das solicitações filtradas por área do gestor
  const [requests, setRequests] = useState<ServiceRequest[]>([
    // Apenas solicitações da área do gestor e delegadas para ele
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
      status: 'delegated',
      assignedManager: managerName,
      assignedManagerArea: managerArea
    },
    {
      id: 'REQ-2024-002',
      clientName: 'Escritório Corporate',
      clientArea: managerArea,
      serviceType: 'Limpeza de Vidros',
      description: 'Limpeza externa e interna de vidros de fachada',
      requestDate: '14/10/2024',
      requestTime: '08:15',
      preferredDate: '22/10/2024',
      status: 'delegated'
    }
  ]);

  // Funções específicas do GESTOR
  const handleAcceptRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleRefuseRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setRefusalReason('');
    setIsDetailsOpen(true);
  };

  const confirmAccept = () => {
    if (selectedRequest) {
      const updatedRequest = {
        ...selectedRequest,
        status: 'approved' as RequestStatus,
        observations: `Aceito por ${managerName} em ${new Date().toLocaleDateString()}`
      };
      
      setRequests(requests.map(r => 
        r.id === selectedRequest.id ? updatedRequest : r
      ));
      
      setIsDetailsOpen(false);
      toast.success('Solicitação aceita com sucesso!');
    }
  };

  const confirmRefusal = () => {
    if (selectedRequest && refusalReason.trim()) {
      const updatedRequest = {
        ...selectedRequest,
        status: 'refused-by-manager' as RequestStatus,
        refusalReason: refusalReason,
        refusalDate: new Date().toLocaleDateString()
      };
      
      setRequests(requests.map(r => 
        r.id === selectedRequest.id ? updatedRequest : r
      ));
      
      setIsDetailsOpen(false);
      setRefusalReason('');
      toast.error('Solicitação recusada');
    }
  };

  // Filtros para o gestor (apenas sua área)
  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = request.clientArea === managerArea || 
                      request.assignedManagerArea === managerArea;
    
    return matchesStatus && matchesSearch && matchesArea;
  });

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
        label: 'Delegada para Mim', 
        color: 'bg-purple-100 text-purple-800',
        style: { backgroundColor: 'rgba(139, 32, 238, 0.1)', color: '#8B20EE' },
        icon: UserCog
      },
      'refused-by-manager': { 
        label: 'Recusada por Mim', 
        color: 'bg-orange-100 text-orange-800',
        style: { backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#ea580c' },
        icon: XCircle
      },
      'approved': { 
        label: 'Aprovada por Mim', 
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const statusCounts = {
    delegated: requests.filter(r => r.status === 'delegated').length,
    approved: requests.filter(r => r.status === 'approved').length,
    refused: requests.filter(r => r.status === 'refused-by-manager').length,
    total: requests.length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header do Gestor */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ScreenHeader 
                title={`Solicitações - Gestor ${managerArea.charAt(0).toUpperCase() + managerArea.slice(1)}`}
                description={`${managerName} - Gerencie as solicitações delegadas para sua área`}
                onBack={() => onBack?.()}
              />
            </div>
          </div>

          {/* Stats Cards do Gestor */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delegadas</p>
                  <p className="text-2xl" style={{ color: '#8B20EE' }}>{statusCounts.delegated}</p>
                </div>
                <UserCog className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aceitas</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{statusCounts.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recusadas</p>
                  <p className="text-2xl text-orange-600">{statusCounts.refused}</p>
                </div>
                <XCircle className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl text-gray-600">{statusCounts.total}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters do Gestor */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar solicitações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
              <TabsList>
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="delegated">Delegadas</TabsTrigger>
                <TabsTrigger value="approved">Aceitas</TabsTrigger>
                <TabsTrigger value="refused-by-manager">Recusadas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Lista de Solicitações do Gestor */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhuma solicitação encontrada para sua área</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const statusConfig = getStatusConfig(request.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl p-5 hover:shadow-md transition-all border-2 border-transparent hover:border-gray-100"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Request Info */}
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <Avatar 
                        className="h-12 w-12 flex-shrink-0" 
                        style={{ backgroundColor: '#8B20EE' }}
                      >
                        <AvatarFallback style={{ backgroundColor: '#8B20EE', color: 'white' }}>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-2 min-w-0">
                            <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
                            <span className="truncate">{request.serviceType}</span>
                          </div>
                          <div className="flex items-center space-x-2 min-w-0">
                            <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: '#35BAE6' }} />
                            <span className="truncate">Preferência: {request.preferredDate}</span>
                          </div>
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          <p className="line-clamp-2">{request.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions do Gestor */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {request.status === 'delegated' && (
                        <>
                          <Button
                            size="sm"
                            style={{ backgroundColor: '#10B981', color: 'white' }}
                            onClick={() => handleAcceptRequest(request)}
                            className="whitespace-nowrap"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aceitar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRefuseRequest(request)}
                            className="whitespace-nowrap text-red-600 border-red-600"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Recusar
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAcceptRequest(request)}
                        className="whitespace-nowrap"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Dialog de Detalhes/Ação do Gestor */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {selectedRequest?.status === 'delegated' ? 'Avaliar Solicitação' : 'Detalhes da Solicitação'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.id} - {selectedRequest?.clientName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-2">
              {/* Informações da solicitação */}
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

              {/* Campo de motivo para recusa */}
              {selectedRequest.status === 'delegated' && (
                <div>
                  <Label htmlFor="refusalReason">Motivo da Recusa (se aplicável)</Label>
                  <Textarea
                    id="refusalReason"
                    value={refusalReason}
                    onChange={(e) => setRefusalReason(e.target.value)}
                    placeholder="Descreva o motivo da recusa desta solicitação..."
                    rows={3}
                  />
                </div>
              )}

              {/* Informações de recusa anteriores */}
              {selectedRequest.status === 'refused-by-manager' && selectedRequest.refusalReason && (
                <div className="border-2 border-red-500 rounded-lg p-4 bg-red-50">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-600">Motivo da Recusa Anterior</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedRequest.refusalReason}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Recusado em: {selectedRequest.refusalDate}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Fechar
            </Button>
            
            {selectedRequest?.status === 'delegated' && (
              <>
                <Button
                  variant="outline"
                  onClick={confirmRefusal}
                  disabled={!refusalReason.trim()}
                  className="text-red-600 border-red-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Recusar
                </Button>
                <Button
                  style={{ backgroundColor: '#10B981', color: 'white' }}
                  onClick={confirmAccept}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aceitar Solicitação
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
