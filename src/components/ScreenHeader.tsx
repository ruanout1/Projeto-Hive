import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  onBack?: () => void;
}

export default function ScreenHeader({ title, subtitle, description, onBack }: ScreenHeaderProps) {
  return (
    <div className="mb-6">
      {onBack && (
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          ← Voltar
        </button>
      )}

      <h1 className="text-2xl font-bold text-[#6400A4]">{title}</h1>

      {subtitle && (
        <p className="text-gray-600 text-sm mt-1">
          {subtitle}
        </p>
      )}

      {description && (
        <p className="text-gray-500 text-sm mt-1">
          {description}
        </p>
      )}
    </div>
  );
}