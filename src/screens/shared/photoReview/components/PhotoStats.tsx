import { Camera, CheckCircle, User } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import { PhotoSubmission } from '../types';

interface PhotoStatsProps {
  stats: {
    total: number;
    pending: number;
    sent: number;
  };
  submissions: PhotoSubmission[];
}

export function PhotoStats({ stats, submissions }: PhotoStatsProps) {
  const totalPhotos = submissions.reduce(
    (acc, record) => acc + record.beforePhotos.length + record.afterPhotos.length, 
    0
  );

  const uniqueClients = new Set(submissions.map(r => r.clientName)).size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Envios</p>
              <p className="text-2xl mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
              <CheckCircle style={{ color: '#6400A4' }} className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Fotos</p>
              <p className="text-2xl mt-1">{totalPhotos}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
              <Camera style={{ color: '#35BAE6' }} className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clientes Atendidos</p>
              <p className="text-2xl mt-1">{uniqueClients}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
              <User style={{ color: '#8B20EE' }} className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}