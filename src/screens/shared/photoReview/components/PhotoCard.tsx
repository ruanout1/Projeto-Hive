import { MapPin, User, Calendar, ImageIcon, Eye, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';

interface PhotoCardProps {
  record: any;
  isAdmin: boolean;
  onViewDetail: (record: any) => void;
  onViewPhotos: (photos: string[], type: 'before' | 'after', index?: number) => void;
}

export function PhotoCard({ record, isAdmin, onViewDetail, onViewPhotos }: PhotoCardProps) {
  const getAreaColor = (area: string) => {
    const colors: Record<string, string> = {
      norte: '#3b82f6',
      sul: '#ef4444',
      leste: '#10b981',
      oeste: '#f59e0b',
      centro: '#8b5cf6'
    };
    return colors[area] || '#6b7280';
  };

  const isPending = record.status === 'pending';

  return (
    <Card key={record.id} className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Photo Preview */}
          <div className="flex gap-2 flex-shrink-0">
            {/* Before Photos Preview */}
            <div className="space-y-1">
              <p className="text-xs text-gray-600 mb-1">Antes</p>
              <div 
                className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onViewPhotos(record.beforePhotos, 'before')}
              >
                <img 
                  src={record.beforePhotos[0] || '/placeholder.jpg'} 
                  alt="Antes"
                  className="w-full h-full object-cover"
                />
                {record.beforePhotos.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    +{record.beforePhotos.length - 1}
                  </div>
                )}
              </div>
            </div>

            {/* After Photos Preview */}
            <div className="space-y-1">
              <p className="text-xs text-gray-600 mb-1">Depois</p>
              <div 
                className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onViewPhotos(record.afterPhotos, 'after')}
              >
                <img 
                  src={record.afterPhotos[0] || '/placeholder.jpg'} 
                  alt="Depois"
                  className="w-full h-full object-cover"
                />
                {record.afterPhotos.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    +{record.afterPhotos.length - 1}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle: Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-start gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-gray-600">ID: {record.id}</p>
                  <Badge 
                    style={{ 
                      backgroundColor: `${getAreaColor(record.clientArea)}15`,
                      color: getAreaColor(record.clientArea)
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {record.clientArea.toUpperCase()}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={isPending ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'}
                  >
                    {isPending ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enviado
                      </>
                    )}
                  </Badge>
                </div>
                <h3 className="font-medium">{record.clientName}</h3>
                <p className="text-sm text-gray-600">{record.serviceType}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>Colaborador: <span className="text-gray-900">{record.collaboratorName}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" style={{ color: '#6400A4' }} />
                <span>Gestor: <span className="text-gray-900">{record.managerName}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Data: <span className="text-gray-900">{record.uploadDate}</span></span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <ImageIcon className="h-4 w-4" />
                <span>Fotos: <span className="text-gray-900">{record.beforePhotos.length} antes, {record.afterPhotos.length} depois</span></span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant={isAdmin ? "outline" : isPending ? "default" : "outline"}
              onClick={() => onViewDetail(record)}
              className="whitespace-nowrap"
              style={!isAdmin && isPending ? { backgroundColor: '#6400A4' } : {}}
            >
              {isAdmin ? (
                <Eye className="h-3 w-3 mr-1" />
              ) : (
                <FileText className="h-3 w-3 mr-1" />
              )}
              {isAdmin ? 'Ver Detalhes' : (isPending ? 'Revisar' : 'Detalhes')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}