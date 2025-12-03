import React, { useState } from 'react';
import { FileText, Filter, Search } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { useServiceRequests } from './hooks/useServiceRequests';
import { useTeams } from './hooks/useTeams';
import { RequestCard } from './components/RequestCard';
import { StatsCards } from './components/StatsCards';
import { RequestDetailsDialog } from './components/RequestDetailsDialog';
import { EscalateDialog } from './components/EscalateDialog';
import { PhotoDialog } from './components/PhotoDialog';
import { ServiceRequest } from './types';

interface ManagerServiceRequestsProps {
  manager: {
    id: string;
    name: string;
    areas: string[];
  };
  userType: 'administrador' | 'gestor';
}

export const ManagerServiceRequests: React.FC<ManagerServiceRequestsProps> = ({ 
  manager, 
  userType 
}) => {
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEscalateDialogOpen, setIsEscalateDialogOpen] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<any>(null);
  const [photoType, setPhotoType] = useState<'before' | 'after'>('before');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const {
    requests,
    loading,
    error,
    filters,
    setFilters,
    statusCounts,
    acceptRequest,
    escalateToAdmin,
    refreshRequests
  } = useServiceRequests(manager.id, manager.areas);

  const { teams } = useTeams(manager.areas);

  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setIsDetailsOpen(true);
  };

  const handleViewPhotos = (documentation: any, type: 'before' | 'after', index: number = 0) => {
    setSelectedPhotos(documentation);
    setPhotoType(type);
    setSelectedPhotoIndex(index);
    setIsPhotoDialogOpen(true);
  };

  const handleAcceptRequest = async (requestData: any) => {
    try {
      await acceptRequest(
        requestData.id,
        requestData.scheduledDate,
        {
          assignedTeam: requestData.assignedTeam,
          assignedTeamMembers: requestData.assignedTeamMembers,
          assignedCollaborator: requestData.assignedCollaborator
        },
        requestData.scheduledDescription
      );
      setIsDetailsOpen(false);
      setSelectedRequest(null);
      // Toast de sucesso será mostrado pelo hook
    } catch (error) {
      // Toast de erro será mostrado pelo hook
    }
  };

  const handleEscalateToAdmin = async (reason: string) => {
    if (!selectedRequest) return;
    
    try {
      await escalateToAdmin(selectedRequest.id, reason);
      setIsEscalateDialogOpen(false);
      setIsDetailsOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      // Toast de erro será mostrado pelo hook
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-7 gap-4 mb-6">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Erro ao carregar solicitações: {error}</p>
          <button 
            onClick={refreshRequests}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#6400A4' }}>Solicitações de Serviço</h1>
        <p className="text-gray-600">
          Gerencie solicitações e coordene a distribuição de equipes.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-600">Suas áreas de responsabilidade:</span>
          {manager.areas.map(area => (
            <Badge key={area} style={{ backgroundColor: '#6400A4', color: 'white' }}>
              {area.charAt(0).toUpperCase() + area.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      <StatsCards counts={statusCounts} />

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, serviço ou ID..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
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
        {requests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="bg-white rounded-2xl p-12">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhuma solicitação encontrada</p>
            </div>
          </div>
        ) : (
          requests.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onView={handleViewRequest}
            />
          ))
        )}
      </div>

      {/* Dialogs */}
      {selectedRequest && (
        <>
          <RequestDetailsDialog
            request={selectedRequest}
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedRequest(null);
            }}
            teams={teams}
            onAccept={handleAcceptRequest}
            onEscalate={() => setIsEscalateDialogOpen(true)}
            onViewPhotos={handleViewPhotos}
            userType={userType}
          />

          <EscalateDialog
            isOpen={isEscalateDialogOpen}
            onClose={() => setIsEscalateDialogOpen(false)}
            request={selectedRequest}
            onEscalate={handleEscalateToAdmin}
          />

          <PhotoDialog
            isOpen={isPhotoDialogOpen}
            onClose={() => setIsPhotoDialogOpen(false)}
            documentation={selectedPhotos}
            photoType={photoType}
            selectedIndex={selectedPhotoIndex}
            onIndexChange={setSelectedPhotoIndex}
            onTypeChange={setPhotoType}
          />
        </>
      )}
    </div>
  );
};

export default ManagerServiceRequests;