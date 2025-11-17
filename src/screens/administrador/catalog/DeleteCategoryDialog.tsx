import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { DeleteCategoryDialogProps } from './types';

export default function DeleteCategoryDialog({
  deleteConfirmCategory,
  onOpenChange,
  onConfirm,
  loading
}: DeleteCategoryDialogProps) {
  return (
    <AlertDialog open={!!deleteConfirmCategory} onOpenChange={() => onOpenChange(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: '#8B20EE' }}>Confirmar Exclusão de Categoria</AlertDialogTitle>
          <AlertDialogDescription style={{ color: '#000000' }}>
            Tem certeza que deseja excluir a categoria <strong>{deleteConfirmCategory?.name}</strong>?
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
            {loading ? 'Excluindo...' : 'Excluir Categoria'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
