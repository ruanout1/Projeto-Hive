import { Building2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Input } from '../../../components/ui/input';
import { Checkbox } from '../../../components/ui/checkbox';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Badge } from '../../../components/ui/badge';
import { Collaborator, Client, workDaysOptions } from './types';

interface AllocationDialogProps {
  open: boolean;
  editingAllocation: any; 
  onClose: () => void;
  onSave: () => void;
  formState: any;
  mockData: {
    collaborators: Collaborator[];
    clients: Client[];
  };
}

export default function AllocationDialog({ open, editingAllocation, onClose, onSave, formState, mockData }: AllocationDialogProps) {
  const {
    selectedCollaborator, setSelectedCollaborator,
    selectedClient, setSelectedClient,
    startDate, setStartDate,
    endDate, setEndDate,
    selectedWorkDays, handleToggleWorkDay,
    startTime, setStartTime,
    endTime, setEndTime
  } = formState;

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
          <div>
            <Label htmlFor="collaborator">Colaborador *</Label>
            <Select value={selectedCollaborator} onValueChange={setSelectedCollaborator}>
              <SelectTrigger id="collaborator">
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent>
                {mockData.collaborators.map((collaborator) => (
                  <SelectItem 
                    key={collaborator.id} 
                    value={collaborator.id.toString()}
                    disabled={!collaborator.available}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span>{collaborator.name}</span>
                        <span className="text-xs text-gray-500 ml-2">• {collaborator.position}</span>
                        <span className="text-xs text-gray-500 ml-2">• {collaborator.team}</span>
                      </div>
                      {!collaborator.available && (
                        <Badge variant="secondary" className="ml-2">Indisponível</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="client">Cliente *</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger id="client">
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {mockData.clients.map((client) => (
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

          <div>
            <Label className="mb-3 block">Dias de Trabalho *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {workDaysOptions.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={selectedWorkDays.includes(day.id)}
                    onCheckedChange={() => handleToggleWorkDay(day.id)}
                  />
                  <Label htmlFor={day.id} className="text-sm cursor-pointer">{day.label}</Label>
                </div>
              ))}
            </div>
          </div>

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

          <div className="p-4 rounded-lg border-2" style={{ backgroundColor: 'rgba(53, 186, 230, 0.05)', borderColor: '#35BAE6' }}>
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#35BAE6' }} />
              <div className="flex-1">
                <p className="text-sm" style={{ color: '#35BAE6' }}>
                  <strong>Atenção:</strong> A agenda do colaborador será preenchida automaticamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={onSave} style={{ backgroundColor: '#6400A4', color: 'white' }}>
            {editingAllocation ? 'Salvar Alterações' : 'Criar Alocação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
