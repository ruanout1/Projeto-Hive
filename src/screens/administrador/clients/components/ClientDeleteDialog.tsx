import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

interface DeleteClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName?: string;
}

export function DeleteClientDialog({ isOpen, onClose, onConfirm, clientName }: DeleteClientDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Excluir Cliente?</AlertDialogTitle>
          <AlertDialogDescription>
            Você tem certeza que deseja excluir o cliente <b>{clientName}</b>? 
            <br /> <br />
            Isso removerá também:
            <ul className="list-disc list-inside mt-2 text-sm text-gray-500">
              <li>Todos os endereços/filiais</li>
              <li>Todos os usuários vinculados</li>
            </ul>
            <br />
            Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-red-600 hover:bg-red-700 text-white border-0"
          >
            Sim, Excluir Definitivamente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}