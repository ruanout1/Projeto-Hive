import { Clock, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { ScheduleDetailModalProps } from './types';
import { getStatusBadge, getInitials } from './utils';

export default function ScheduleDetailModal({ isOpen, onClose, selectedItem }: ScheduleDetailModalProps) {
  if (!selectedItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle style={{ color: '#6400A4' }}>
            {selectedItem.type === 'meeting' ? '📅 Reunião' : '💼 Serviço Agendado'}
          </DialogTitle>
          <DialogDescription>
            {selectedItem.date} às {selectedItem.time}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Título/Serviço */}
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {selectedItem.type === 'meeting' ? 'Reunião' : 'Serviço'}
            </p>
            <p className="text-black">{selectedItem.title}</p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <div>{getStatusBadge(selectedItem.status)}</div>
          </div>

          {/* Horário */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Horário</p>
            <div className="flex items-center space-x-2 text-gray-700">
              <Clock className="h-4 w-4" style={{ color: '#8B20EE' }} />
              <span>
                {selectedItem.time}{selectedItem.endTime && ` - ${selectedItem.endTime}`}
              </span>
            </div>
          </div>

          {/* Localização */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Localização</p>
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPin className="h-4 w-4" style={{ color: '#8B20EE' }} />
              <span>{selectedItem.location}</span>
            </div>
          </div>

          {/* Cliente (para serviços) */}
          {selectedItem.type === 'service' && selectedItem.client && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Cliente</p>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10" style={{ backgroundColor: '#6400A4' }}>
                  <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                    {getInitials(selectedItem.client)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-black">{selectedItem.client}</p>
                  {selectedItem.clientPhone && (
                    <p className="text-sm text-gray-600">{selectedItem.clientPhone}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Organizador (para reuniões) */}
          {selectedItem.type === 'meeting' && selectedItem.organizer && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Organizado por</p>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10" style={{ backgroundColor: '#8B20EE' }}>
                  <AvatarFallback style={{ backgroundColor: '#8B20EE', color: 'white' }}>
                    {getInitials(selectedItem.organizer)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-black">{selectedItem.organizer}</p>
                  <p className="text-sm text-gray-600">Gestor</p>
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          {selectedItem.notes && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Observações</p>
              <div className="p-3 rounded-lg bg-gray-50 text-gray-700">
                {selectedItem.notes}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}