import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface ScreenHeaderProps {
  title: string;
  description?: string;
  onBack?: () => void;
}

export default function ScreenHeader({ title, description, onBack }: ScreenHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onBack}
          style={{ color: '#6400A4' }}
          className="hover:bg-purple-50 -ml-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="hive-screen-title m-0">{title}</h1>
      </div>
      {description && (
        <p className="text-black ml-11">
          {description}
        </p>
      )}
    </div>
  );
}
