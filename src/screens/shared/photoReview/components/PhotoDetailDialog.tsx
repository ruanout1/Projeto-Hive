import { CheckCircle, User, Calendar, MapPin, Lock, Edit, X } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { PhotoSubmission } from '../types';

interface PhotoDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  submission: PhotoSubmission;
  isAdmin: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  reviewNotes: string;
  onReviewNotesChange: (notes: string) => void;
  onSaveOrSend: () => Promise<void>; // Função única para salvar/enviar
  onViewPhotos: (photos: string[], type: 'before' | 'after', index: number) => void;
  onDeletePhoto?: (type: 'before' | 'after', photoUrl: string) => void;
}

export function PhotoDetailDialog({
  isOpen,
  onOpenChange,
  submission,
  isAdmin,
  isEditing,
  setIsEditing,
  reviewNotes,
  onReviewNotesChange,
  onSaveOrSend,
  onViewPhotos,
  onDeletePhoto
}: PhotoDetailDialogProps) {
  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      norte: '#3b82f6',
      sul: '#ef4444',
      leste: '#10b981',
      oeste: '#f59e0b',
      centro: '#8b5cf6'
    };
    return colors[area.toLowerCase()] || '#6b7280';
  };

  const isPending = submission.status === 'pending';
  const dialogTitle = isAdmin ? 'Detalhes do Envio de Fotos' : 
    (isPending ? 'Revisar e Enviar' : (isEditing ? 'Editar Revisão' : 'Detalhes do Envio'));

  // Função para cancelar edição e resetar as notas
  const handleCancelEdit = () => {
    setIsEditing(false);
    onReviewNotesChange(submission.managerNotes || '');
  };

  // Determina o texto do botão principal
  const getMainButtonText = () => {
    if (isAdmin) return '';
    if (isPending) return 'Enviar e Aprovar';
    if (isEditing) return 'Salvar Alterações';
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {isAdmin ? 'Visualize todas as informações e fotos enviadas ao cliente' : 
             isPending ? 'Revise as fotos antes de enviar ao cliente' :
             isEditing ? 'Edite as observações e fotos já enviadas' :
             'Detalhes do envio realizado'}
          </DialogDescription>
        </DialogHeader>

        {/* Alerta de modo leitura para Admin */}
        {isAdmin && (
          <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg flex items-center gap-2 text-sm text-gray-600">
            <Lock className="h-4 w-4"/> Visualize todas as informações e fotos enviadas ao cliente
          </div>
        )}

        {/* Botão de editar para gestor em envios já realizados */}
        {!isAdmin && !isPending && !isEditing && (
          <div className="flex justify-end">
            <Button
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              size="sm"
              onClick={() => setIsEditing(true)}
              className="hover:opacity-90 transition-opacity"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Revisão
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {/* Service Info */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{submission.clientName}</p>
                <p className="text-sm text-gray-600">{submission.serviceType}</p>
              </div>
              <Badge 
                style={{ 
                  backgroundColor: `${getAreaColor(submission.clientArea)}15`,
                  color: getAreaColor(submission.clientArea)
                }}
              >
                <MapPin className="h-3 w-3 mr-1" />
                {submission.clientArea.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{submission.serviceDescription}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 pt-2">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                Colaborador: <span className="text-gray-900">{submission.collaboratorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" style={{ color: '#6400A4' }} />
                Gestor: <span className="text-gray-900">{submission.sentBy || 'Não informado'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Upload: <span className="text-gray-900">{submission.uploadDate} {submission.uploadTime ? `às ${submission.uploadTime}` : ''}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" style={{ color: isPending ? '#ca8a04' : '#16a34a' }} />
                Status: <span className="text-gray-900">{isPending ? 'Pendente' : 'Enviado'}</span>
              </div>
            </div>
          </div>

          {/* Before Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Fotos Antes ({submission.beforePhotos.length})</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {submission.beforePhotos.map((photo, index) => (
                <div 
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity group"
                  onClick={() => onViewPhotos(submission.beforePhotos, 'before', index)}
                >
                  <img 
                    src={photo} 
                    alt={`Antes ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Permite deletar em modo edição OU se for pendente */}
                  {(!isAdmin && (isEditing || isPending)) && onDeletePhoto && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePhoto('before', photo);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* After Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">Fotos Depois ({submission.afterPhotos.length})</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {submission.afterPhotos.map((photo, index) => (
                <div 
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity group"
                  onClick={() => onViewPhotos(submission.afterPhotos, 'after', index)}
                >
                  <img 
                    src={photo} 
                    alt={`Depois ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Permite deletar em modo edição OU se for pendente */}
                  {(!isAdmin && (isEditing || isPending)) && onDeletePhoto && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePhoto('after', photo);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            {submission.collaboratorNotes && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Observações do Colaborador</p>
                <p className="text-sm text-blue-800">{submission.collaboratorNotes}</p>
              </div>
            )}
            
            {/* Input para gestor adicionar/editar observações */}
            {(!isAdmin && (isPending || isEditing)) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {isPending ? 'Observações para o Cliente' : 'Editar Observações'}
                </Label>
                <Textarea 
                  value={reviewNotes}
                  onChange={(e) => onReviewNotesChange(e.target.value)}
                  placeholder={isPending ? "Tudo certo com o serviço..." : "Edite as observações..."}
                  className="min-h-[100px]"
                />
              </div>
            )}
            
            {/* Mostra observações existentes em modo visualização (não edição) */}
            {submission.managerNotes && !isPending && !isEditing && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-purple-900 mb-1">Observações do Gestor</p>
                <p className="text-sm text-purple-800">{submission.managerNotes}</p>
              </div>
            )}
          </div>
          
          {/* Botões de ação */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {isEditing && (
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancelar Edição
              </Button>
            )}
            
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {isAdmin || !isPending ? 'Fechar' : 'Cancelar'}
              </Button>
            )}
            
            {/* Botão principal: Enviar e Aprovar OU Salvar Alterações */}
            {!isAdmin && (isPending || isEditing) && (
              <Button
                style={{ backgroundColor: '#6400A4' }}
                onClick={onSaveOrSend}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {getMainButtonText()}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}