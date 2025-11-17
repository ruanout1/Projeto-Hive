import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Checkbox } from '../../../components/ui/checkbox';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge';
import { AlertCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Allocation, Client, Collaborator } from './types';
import { workDaysOptions } from './utils';

interface AllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAllocation: Allocation | null;
  collaborators: Collaborator[];
  clients: Client[];
  onSave: (formData: Omit<Allocation, 'id' | 'createdAt' | 'status' | 'collaboratorName' | 'collaboratorPosition' | 'clientName' | 'clientArea'>) => void;
}

export function AllocationDialog({
  open,
  onOpenChange,
  editingAllocation,
  collaborators,
  clients,
  onSave
}: AllocationDialogProps) {
  
  // Estado interno do formulário
  const [selectedCollaborator, setSelectedCollaborator] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWorkDays, setSelectedWorkDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Popula o formulário quando 'editingAllocation' muda
  useEffect(() => {
    if (editingAllocation) {
      setSelectedCollaborator(editingAllocation.collaboratorId.toString());
      setSelectedClient(editingAllocation.clientId.toString());
      setStartDate(editingAllocation.startDate);
      setEndDate(editingAllocation.endDate);
      setSelectedWorkDays(editingAllocation.workDays);
      setStartTime(editingAllocation.startTime);
      setEndTime(editingAllocation.endTime);
    } else {
      // Reseta o formulário
      setSelectedCollaborator('');
      setSelectedClient('');
      setStartDate('');
      setEndDate('');
      setSelectedWorkDays([]);
      setStartTime('');
      setEndTime('');
    }
  }, [editingAllocation, open]);

  const handleToggleWorkDay = (dayId: string) => {
    setSelectedWorkDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSaveClick = () => {
    // Validação
    if (!selectedCollaborator || !selectedClient || !startDate || !endDate || selectedWorkDays.length === 0 || !startTime || !endTime) {
      toast.error('Campos obrigatórios', {
        description: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('Datas inválidas', {
        description: 'A data de término deve ser posterior à data de início.'
      });
      return;
    }

    // Envia os dados para o hook pai
    onSave({
      collaboratorId: parseInt(selectedCollaborator),
      clientId: parseInt(selectedClient),
      startDate,
      endDate,
      workDays: selectedWorkDays,
      startTime,
      endTime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle style={{ color: '#6400A4' }}>
            {editingAllocation ? 'Editar Alocação' : 'Nova Alocação'}
          </DialogTitle>
          <DialogDescription>
            Aloque um colaborador para trabalhar em um cliente por um período determinado. A agenda do colaborador será preenchida automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seleção de Colaborador */}
          <div>
            <Label htmlFor="collaborator">Colaborador *</Label>
            <Select value={selectedCollaborator} onValueChange={setSelectedCollaborator}>
              <SelectTrigger id="collaborator">
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent>
                {collaborators.map((collaborator) => (
                  <SelectItem 
                    key={collaborator.id} 
                    value={collaborator.id.toString()}
                    disabled={!collaborator.available && collaborator.id !== editingAllocation?.collaboratorId}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span>{collaborator.name}</span>
                        <span className="text-xs text-gray-500 ml-2">• {collaborator.position}</span>
                        <span className="text-xs text-gray-500 ml-2">• {collaborator.team}</span>
                      </div>
                      {!collaborator.available && collaborator.id !== editingAllocation?.collaboratorId && (
                        <Badge variant="secondary" className="ml-2">Indisponível</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Cliente */}
          <div>
            <Label htmlFor="client">Cliente *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2" style={{ color: '#6400A4' }} />
                      <span>{client.name}</span>
                      <span className="text-xs text-gray-500 ml-2">• Área {client.area}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Data de Início *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Data de Término *</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Dias da Semana */}
          <div>
            <Label className="mb-3 block">Dias de Trabalho *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {workDaysOptions.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dialog-${day.id}`}
                    checked={selectedWorkDays.includes(day.id)}
                    onCheckedChange={() => handleToggleWorkDay(day.id)}
                  />
                  <Label
                    htmlFor={`dialog-${day.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Horário */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Horário de Início *</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-time">Horário de Término *</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Aviso */}
          <div className="p-4 rounded-lg border-2" style={{ backgroundColor: 'rgba(53, 186, 230, 0.05)', borderColor: '#35BAE6' }}>
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#35BAE6' }} />
              <div className="flex-1">
                <p className="text-sm" style={{ color: '#35BAE6' }}>
                  <strong>Atenção:</strong> A agenda do colaborador será preenchida automaticamente nos dias e horários selecionados.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveClick}
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            {editingAllocation ? 'Salvar Alterações' : 'Criar Alocação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}