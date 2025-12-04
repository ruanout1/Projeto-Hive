import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Calendar, MessageSquare, Users, AlertTriangle, Camera } from 'lucide-react';
import { ServiceRequest, ServiceTeam } from '../types';
import { toast } from 'sonner';

interface RequestDetailsDialogProps {
  request: ServiceRequest;
  isOpen: boolean;
  onClose: () => void;
  teams: Record<string, ServiceTeam>;
  onAccept: (requestData: any) => Promise<void>;
  onEscalate: () => void;
  onViewPhotos: (documentation: any, type: 'before' | 'after', index: number) => void;
  userType: 'administrador' | 'gestor';
}

export const RequestDetailsDialog: React.FC<RequestDetailsDialogProps> = ({
  request,
  isOpen,
  onClose,
  teams,
  onAccept,
  onEscalate,
  onViewPhotos,
  userType
}) => {
  const [scheduledDate, setScheduledDate] = useState(request.scheduledDate || '');
  const [selectedTeam, setSelectedTeam] = useState(request.assignedTeam || '');
  const [selectedCollaborator, setSelectedCollaborator] = useState(request.assignedCollaborator || '');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(request.assignedTeamMembers || []);
  const [scheduledDescription, setScheduledDescription] = useState(request.scheduledDescription || '');
  const [observations, setObservations] = useState(request.observations || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!scheduledDate) {
      toast.error('Selecione uma data para o reagendamento');
      return;
    }

    if (!scheduledDescription.trim()) {
      toast.error('Digite uma descrição para o agendamento');
      return;
    }

    if (!selectedTeam && !selectedCollaborator) {
      toast.error('Selecione uma equipe ou colaborador');
      return;
    }

    setIsSubmitting(true);
    try {
      const teamData = {
        assignedTeam: selectedTeam,
        assignedTeamId: selectedTeam ? teams[selectedTeam]?.team_id : undefined,
        assignedTeamMembers: selectedTeamMembers,
        assignedCollaborator: selectedCollaborator,
        assignedCollaboratorId: selectedCollaborator ? 1 : undefined // TODO: Pegar ID real
      };

      await onAccept({
        id: request.service_request_id.toString(),
        scheduledDate,
        scheduledDescription,
        ...teamData
      });

      onClose();
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTeamMembers = () => {
    if (!selectedTeam || !teams[selectedTeam]) return [];
    return teams[selectedTeam].members;
  };

  const handleTeamMemberToggle = (memberId: string) => {
    if (selectedTeamMembers.includes(memberId)) {
      setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== memberId));
    } else {
      setSelectedTeamMembers([...selectedTeamMembers, memberId]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: '#6400A4' }}>
            {request.status === 'urgent' ? 'Visualização - Urgência Sinalizada' : 'Gerenciar Solicitação'}
          </DialogTitle>
          <DialogDescription>
            {request.request_number} - {request.status === 'urgent' ? 'Solicitação urgente requer atenção imediata' : 'Atribuir equipes e coordenar a execução'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alerta para urgências */}
          {request.status === 'urgent' && request.urgentReason && (
            <div className="p-4 rounded-lg border-2 border-red-500 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-red-700">Urgência Sinalizada pelo Administrador</p>
                  <p className="text-sm text-red-600 mt-1">{request.urgentReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Cliente</Label>
              <Input value={request.clientName} disabled />
            </div>
            <div>
              <Label>Tipo de Serviço</Label>
              <Input value={request.serviceType} disabled />
            </div>
          </div>

          <div>
            <Label>Descrição</Label>
            <Textarea value={request.description} disabled rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Data de Solicitação</Label>
              <Input value={request.requestDate} disabled />
            </div>
            <div>
              <Label>Data Preferencial do Cliente</Label>
              <Input value={request.preferredDate} disabled />
            </div>
          </div>

          {/* Data de Agendamento */}
          {(request.status === 'pending' || request.status === 'delegated' || request.status === 'urgent') && (
            <div className="p-4 rounded-lg border-2" style={{ borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
              <Label className="flex items-center gap-2 mb-3" style={{ color: '#10B981' }}>
                <Calendar className="h-4 w-4" />
                Data do Agendamento*
              </Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              {scheduledDate && scheduledDate !== request.preferredDate && (
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

          {/* Alocação de Recursos */}
          {(request.status === 'pending' || request.status === 'delegated' || request.status === 'urgent') && (
            <div className="space-y-4 p-4 rounded-lg border-2" style={{ borderColor: '#6400A4', backgroundColor: 'rgba(100, 0, 164, 0.02)' }}>
              <div>
                <p className="font-semibold mb-1" style={{ color: '#6400A4' }}>Alocação de Recursos*</p>
                <p className="text-sm text-gray-600">Escolha uma equipe (completa ou parcial) OU um colaborador específico</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Equipe</Label>
                  <Select
                    value={selectedTeam}
                    onValueChange={(value) => {
                      setSelectedTeam(value);
                      setSelectedCollaborator('');
                      setSelectedTeamMembers([]);
                    }}
                    disabled={!!selectedCollaborator}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(teams).map(teamName => (
                        <SelectItem key={teamName} value={teamName}>
                          {teamName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Colaborador Único</Label>
                  <Select
                    value={selectedCollaborator}
                    onValueChange={(value) => {
                      setSelectedCollaborator(value);
                      setSelectedTeam('');
                      setSelectedTeamMembers([]);
                    }}
                    disabled={!!selectedTeam}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o colaborador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Carlos Silva">Carlos Silva</SelectItem>
                      <SelectItem value="Maria Santos">Maria Santos</SelectItem>
                      <SelectItem value="João Santos">João Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Seleção de Membros da Equipe */}
              {selectedTeam && teams[selectedTeam] && (
                <div className="p-4 rounded-lg border bg-white mt-4">
                  <Label className="mb-3 block">Selecione os membros da {selectedTeam}</Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getTeamMembers().map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={member.id}
                          checked={selectedTeamMembers.includes(member.id)}
                          onChange={() => handleTeamMemberToggle(member.id)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label htmlFor={member.id} className="flex-1 cursor-pointer">
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Descrição do Agendamento */}
          {(request.status === 'pending' || request.status === 'delegated' || request.status === 'urgent') && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Descrição do Agendamento*
              </Label>
              <Textarea
                placeholder="Descreva os detalhes do agendamento..."
                value={scheduledDescription}
                onChange={(e) => setScheduledDescription(e.target.value)}
                rows={3}
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
              placeholder="Adicione observações sobre a coordenação..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
            />
          </div>

          {/* Documentação Fotográfica */}
          {request.photoDocumentation && (
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4" style={{ color: '#6400A4' }} />
                <p className="font-semibold" style={{ color: '#6400A4' }}>Documentação Fotográfica</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fotos "Antes" */}
                {request.photoDocumentation.beforePhotos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Fotos "Antes" ({request.photoDocumentation.beforePhotos.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {request.photoDocumentation.beforePhotos.slice(0, 3).map((photo, idx) => (
                        <div 
                          key={idx}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => onViewPhotos(request.photoDocumentation!, 'before', idx)}
                        >
                          <img 
                            src={photo} 
                            alt={`Antes ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fotos "Depois" */}
                {request.photoDocumentation.afterPhotos.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">Fotos "Depois" ({request.photoDocumentation.afterPhotos.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {request.photoDocumentation.afterPhotos.slice(0, 3).map((photo, idx) => (
                        <div 
                          key={idx}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => onViewPhotos(request.photoDocumentation!, 'after', idx)}
                        >
                          <img 
                            src={photo} 
                            alt={`Depois ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          {userType === 'gestor' && (request.status === 'delegated' || request.status === 'pending' || request.status === 'urgent') && (
            <>
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
                onClick={onEscalate}
              >
                Encaminhar para Admin
              </Button>
              <Button
                style={{ backgroundColor: '#10B981', color: 'white' }}
                onClick={handleAccept}
                disabled={isSubmitting || !scheduledDate || !scheduledDescription.trim() || (!selectedTeam && !selectedCollaborator)}
              >
                {isSubmitting ? 'Processando...' : 'Confirmar Reagendamento'}
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};