import { useState, useEffect } from 'react';
import ScreenHeader from '../../components/ScreenHeader';
import { 
  Camera, 
  CheckCircle,
  Eye, 
  User,
  MapPin,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import api from '../../lib/api';

interface PhotoRecord {
  id: string;
  serviceRequestId: string;
  clientName: string;
  clientArea: string;
  serviceType: string;
  serviceDescription: string;
  collaboratorName: string;
  managerName: string;
  uploadDate: string;
  sentDate: string;
  beforePhotos: string[];
  afterPhotos: string[];
  collaboratorNotes?: string;
  managerNotes?: string;
}

interface Stats {
  totalRecords: number;
  totalPhotos: number;
  uniqueClients: number;
}

interface AdminPhotoHistoryScreenProps {
  onBack?: () => void;
}

export default function AdminPhotoHistoryScreen({ onBack }: AdminPhotoHistoryScreenProps) {
  const [selectedRecord, setSelectedRecord] = useState<PhotoRecord | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<{ photos: string[], type: 'before' | 'after', index: number } | null>(null);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterManager, setFilterManager] = useState<string>('all');
  
  const [photoRecords, setPhotoRecords] = useState<PhotoRecord[]>([]);
  const [stats, setStats] = useState<Stats>({ totalRecords: 0, totalPhotos: 0, uniqueClients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [searchTerm, filterArea, filterManager]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const statsResponse = await api.get('/photo-history/stats');
      setStats(statsResponse.data.data);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterArea !== 'all') params.append('area', filterArea);
      if (filterManager !== 'all') params.append('manager', filterManager);

      const recordsResponse = await api.get(`/photo-history?${params.toString()}`);
      setPhotoRecords(recordsResponse.data.data);

    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      alert(error.response?.data?.message || 'Erro ao carregar histórico de fotos');
    } finally {
      setLoading(false);
    }
  };

  const uniqueManagers = Array.from(new Set(photoRecords.map(r => r.managerName)));

  const handleOpenDetail = (record: PhotoRecord) => {
    setSelectedRecord(record);
    setIsDetailDialogOpen(true);
  };

  const handleViewPhotos = (photos: string[], type: 'before' | 'after', index: number = 0) => {
    setSelectedPhotos({ photos, type, index });
    setIsPhotoViewerOpen(true);
  };

  const handleNextPhoto = () => {
    if (selectedPhotos && selectedPhotos.index < selectedPhotos.photos.length - 1) {
      setSelectedPhotos({
        ...selectedPhotos,
        index: selectedPhotos.index + 1
      });
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotos && selectedPhotos.index > 0) {
      setSelectedPhotos({
        ...selectedPhotos,
        index: selectedPhotos.index - 1
      });
    }
  };

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <ScreenHeader 
        title="Histórico de Fotos" 
        onBack={onBack}
      />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Envios</p>
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-1 text-gray-400" />
                  ) : (
                    <p className="text-2xl mt-1">{stats.totalRecords}</p>
                  )}
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
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-1 text-gray-400" />
                  ) : (
                    <p className="text-2xl mt-1">{stats.totalPhotos}</p>
                  )}
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
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-1 text-gray-400" />
                  ) : (
                    <p className="text-2xl mt-1">{stats.uniqueClients}</p>
                  )}
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                  <User style={{ color: '#8B20EE' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  placeholder="Buscar por cliente, gestor, colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Select value={filterArea} onValueChange={setFilterArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as áreas</SelectItem>
                    <SelectItem value="norte">Norte</SelectItem>
                    <SelectItem value="sul">Sul</SelectItem>
                    <SelectItem value="leste">Leste</SelectItem>
                    <SelectItem value="oeste">Oeste</SelectItem>
                    <SelectItem value="centro">Centro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterManager} onValueChange={setFilterManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por gestor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os gestores</SelectItem>
                    {uniqueManagers.map(manager => (
                      <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-gray-600">Carregando...</p>
                </div>
              </CardContent>
            </Card>
          ) : photoRecords.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhum registro encontrado</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            photoRecords.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex gap-2 flex-shrink-0">
                      {record.beforePhotos.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 mb-1">Antes</p>
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                               onClick={() => handleViewPhotos(record.beforePhotos, 'before')}>
                            <img 
                              src={record.beforePhotos[0]} 
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
                      )}

                      {record.afterPhotos.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-600 mb-1">Depois</p>
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                               onClick={() => handleViewPhotos(record.afterPhotos, 'after')}>
                            <img 
                              src={record.afterPhotos[0]} 
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
                      )}
                    </div>

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
                          <span>Enviado: <span className="text-gray-900">{record.sentDate}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <ImageIcon className="h-4 w-4" />
                          <span>Fotos: <span className="text-gray-900">{record.beforePhotos.length} antes, {record.afterPhotos.length} depois</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(record)}
                        className="whitespace-nowrap"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Envio de Fotos</DialogTitle>
            <DialogDescription>
              Visualize todas as informações e fotos enviadas ao cliente
            </DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedRecord.clientName}</p>
                    <p className="text-sm text-gray-600">{selectedRecord.serviceType}</p>
                  </div>
                  <Badge 
                    style={{ 
                      backgroundColor: `${getAreaColor(selectedRecord.clientArea)}15`,
                      color: getAreaColor(selectedRecord.clientArea)
                    }}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedRecord.clientArea.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{selectedRecord.serviceDescription}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 pt-2">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Colaborador: <span className="text-gray-900">{selectedRecord.collaboratorName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" style={{ color: '#6400A4' }} />
                    Gestor: <span className="text-gray-900">{selectedRecord.managerName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Upload: <span className="text-gray-900">{selectedRecord.uploadDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" style={{ color: '#16a34a' }} />
                    Enviado: <span className="text-gray-900">{selectedRecord.sentDate}</span>
                  </div>
                </div>
              </div>

              {selectedRecord.beforePhotos.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Fotos Antes ({selectedRecord.beforePhotos.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRecord.beforePhotos.map((photo, index) => (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewPhotos(selectedRecord.beforePhotos, 'before', index)}
                      >
                        <img 
                          src={photo} 
                          alt={`Antes ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRecord.afterPhotos.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Fotos Depois ({selectedRecord.afterPhotos.length})</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRecord.afterPhotos.map((photo, index) => (
                      <div 
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleViewPhotos(selectedRecord.afterPhotos, 'after', index)}
                      >
                        <img 
                          src={photo} 
                          alt={`Depois ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {selectedRecord.collaboratorNotes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Observações do Colaborador</p>
                    <p className="text-sm text-blue-800">{selectedRecord.collaboratorNotes}</p>
                  </div>
                )}
                {selectedRecord.managerNotes && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 mb-1">Observações do Gestor</p>
                    <p className="text-sm text-purple-800">{selectedRecord.managerNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Dialog */}
      <Dialog open={isPhotoViewerOpen} onOpenChange={setIsPhotoViewerOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {selectedPhotos?.type === 'before' ? 'Fotos Antes' : 'Fotos Depois'} 
              {' - '} 
              {selectedPhotos && `${selectedPhotos.index + 1} de ${selectedPhotos.photos.length}`}
            </DialogTitle>
            <DialogDescription>
              Use as setas para navegar entre as fotos
            </DialogDescription>
          </DialogHeader>
          
          {selectedPhotos && (
            <div className="relative">
              <img 
                src={selectedPhotos.photos[selectedPhotos.index]} 
                alt={`${selectedPhotos.type} ${selectedPhotos.index + 1}`}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              
              {selectedPhotos.photos.length > 1 && (
                <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handlePrevPhoto}
                    disabled={selectedPhotos.index === 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleNextPhoto}
                    disabled={selectedPhotos.index === selectedPhotos.photos.length - 1}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}