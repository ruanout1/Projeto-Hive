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
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { ServiceRequest } from '../types';
import { UserCog } from 'lucide-react';

interface EscalateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequest;
  onEscalate: (reason: string) => Promise<void>;
}

export const EscalateDialog: React.FC<EscalateDialogProps> = ({
  isOpen,
  onClose,
  request,
  onEscalate
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEscalate = async () => {
    if (!reason.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onEscalate(reason);
      setReason('');
    } catch (error) {
      console.error('Erro ao encaminhar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle style={{ color: '#6400A4' }}>
            Encaminhar Solicitação para Administrador
          </DialogTitle>
          <DialogDescription>
            {request.request_number} - {request.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div>
              <Label className="text-xs text-gray-500">Serviço</Label>
              <p className="text-sm">{request.serviceType}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Data Preferencial</Label>
              <p className="text-sm">{request.preferredDate}</p>
            </div>
          </div>

          <div>
            <Label>Motivo do Encaminhamento*</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique por que está encaminhando para o administrador..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            style={{ backgroundColor: '#6400A4', color: 'white' }}
            onClick={handleEscalate}
            disabled={!reason.trim() || isSubmitting}
          >
            <UserCog className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Encaminhando...' : 'Encaminhar para Admin'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};