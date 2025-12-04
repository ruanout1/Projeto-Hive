import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-red-50/50 p-8 rounded-lg border-2 border-dashed border-red-200">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-red-700 mb-2">Ocorreu um Erro</h2>
      <p className="text-red-600 text-center mb-6 max-w-md">
        {message}
      </p>
      <Button onClick={onRetry} variant="destructive">
        Tentar Novamente
      </Button>
    </div>
  );
};