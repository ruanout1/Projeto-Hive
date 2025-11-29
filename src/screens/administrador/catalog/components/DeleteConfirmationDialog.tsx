import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../../components/ui/alert-dialog';
import { Service } from '../types';

interface DeleteConfirmationDialogProps {
  deleteConfirmService: Service | null;
  onOpenChange: (service: Service | null) => void;
  onConfirm: () => void;
  loading: boolean;
}

export default function DeleteConfirmationDialog({
  deleteConfirmService,
  onOpenChange,
  onConfirm,
  loading
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={!!deleteConfirmService} onOpenChange={() => onOpenChange(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: '#8B20EE' }}>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription style={{ color: '#000000' }}>
            Tem certeza que deseja excluir o serviço <strong>{deleteConfirmService?.name}</strong>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            style={{ backgroundColor: '#EF4444', color: 'white' }}
            className="hover:opacity-90"
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
