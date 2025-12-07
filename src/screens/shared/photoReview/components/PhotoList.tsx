import { Camera } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { PhotoCard } from './PhotoCard';

interface PhotoListProps {
  loading: boolean;
  records: any[];
  isAdmin: boolean;
  onViewDetail: (record: any) => void;
  onViewPhotos: (photos: string[], type: 'before' | 'after', index?: number) => void;
}

export function PhotoList({ 
  loading, 
  records, 
  isAdmin, 
  onViewDetail, 
  onViewPhotos 
}: PhotoListProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Carregando registros...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhum registro encontrado</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <PhotoCard
          key={record.id}
          record={record.originalSubmission || record}
          isAdmin={isAdmin}
          onViewDetail={onViewDetail}
          onViewPhotos={onViewPhotos}
        />
      ))}
    </div>
  );
}