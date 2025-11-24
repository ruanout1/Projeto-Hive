import { useState } from 'react';
import { Camera, Upload, X, Check, Calendar, MapPin } from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

interface AssignedService {
  id: string;
  serviceType: string;
  clientName: string;
  location?: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface PhotoUploadSectionProps {
  onBack?: () => void;
}

export default function PhotoUploadSection({ onBack }: PhotoUploadSectionProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (type: 'before' | 'after', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      if (type === 'before') {
        setBeforePhotos(prev => [...prev, ...newPhotos]);
      } else {
        setAfterPhotos(prev => [...prev, ...newPhotos]);
      }
    }
  };

  const removePhoto = (type: 'before' | 'after', index: number) => {
    if (type === 'before') {
      setBeforePhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Serviços atribuídos ao colaborador logado
  const assignedServices: AssignedService[] = [
    {
      id: 'REQ-2024-001',
      serviceType: 'Limpeza Profunda',
      clientName: 'Shopping Center Norte',
      location: 'Unidade Principal - 3º Andar',
      scheduledDate: '2024-10-20',
      scheduledTime: '08:00',
      status: 'in-progress'
    },
    {
      id: 'REQ-2024-003',
      serviceType: 'Jardinagem',
      clientName: 'Condomínio Residencial',
      location: 'Área Verde Principal',
      scheduledDate: '2024-10-18',
      scheduledTime: '07:00',
      status: 'in-progress'
    },
    {
      id: 'REQ-2024-008',
      serviceType: 'Limpeza de Vidros',
      clientName: 'Edifício Corporate Tower',
      location: '15º Andar - Fachada Externa',
      scheduledDate: '2024-10-21',
      scheduledTime: '09:00',
      status: 'pending'
    }
  ];

  const recentUploads = [
    { 
      id: 'REQ-2024-005',
      service: "Limpeza Hospitalar - Clínica Saúde Total", 
      date: "15/10/2024", 
      beforeCount: 3, 
      afterCount: 4, 
      status: "completed" 
    },
    { 
      id: 'REQ-2024-004',
      service: "Limpeza de Vidros - Prédio Comercial", 
      date: "14/10/2024", 
      beforeCount: 2, 
      afterCount: 3, 
      status: "completed" 
    },
    { 
      id: 'REQ-2024-002',
      service: "Enceramento - Escritório Corporate", 
      date: "12/10/2024", 
      beforeCount: 4, 
      afterCount: 4, 
      status: "completed" 
    }
  ];

  const handleSubmitPhotos = () => {
    if (!selectedService) {
      toast.error('Selecione um serviço antes de enviar as fotos');
      return;
    }
    
    if (beforePhotos.length === 0 && afterPhotos.length === 0) {
      toast.error('Adicione pelo menos uma foto');
      return;
    }

    const service = assignedServices.find(s => s.id === selectedService);
    
    // Aqui você salvaria as fotos no backend
    toast.success(`Documentação enviada com sucesso!`, {
      description: `${beforePhotos.length} foto(s) "antes" e ${afterPhotos.length} foto(s) "depois" para ${service?.serviceType}`
    });

    // Limpar formulário
    setSelectedService('');
    setBeforePhotos([]);
    setAfterPhotos([]);
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      <div className="mb-6">
        <ScreenHeader 
          title="Documentação Fotográfica"
          description="Registre o antes e depois dos serviços para controle de qualidade e satisfação do cliente."
          onBack={() => onBack?.()}
        />
      </div>

      {/* Seleção de Serviço */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">Selecionar Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Serviço *</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o serviço para anexar as fotos" />
                </SelectTrigger>
                <SelectContent>
                  {assignedServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex flex-col">
                        <span>{service.serviceType} - {service.clientName}</span>
                        <span className="text-xs text-gray-500">
                          {service.scheduledDate} às {service.scheduledTime} 
                          {service.location && ` - ${service.location}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedService && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 mt-0.5" style={{ color: '#6400A4' }} />
                  <div className="flex-1">
                    {(() => {
                      const service = assignedServices.find(s => s.id === selectedService);
                      return (
                        <>
                          <p className="text-sm" style={{ color: '#6400A4' }}>
                            <strong>{service?.serviceType}</strong>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {service?.clientName}
                          </p>
                          {service?.location && (
                            <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {service.location}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <Badge 
                    className="border-none"
                    style={{ 
                      backgroundColor: assignedServices.find(s => s.id === selectedService)?.status === 'in-progress' 
                        ? 'rgba(139, 32, 238, 0.1)' 
                        : 'rgba(53, 186, 230, 0.1)',
                      color: assignedServices.find(s => s.id === selectedService)?.status === 'in-progress'
                        ? '#8B20EE'
                        : '#35BAE6'
                    }}
                  >
                    {assignedServices.find(s => s.id === selectedService)?.status === 'in-progress' ? 'Em Andamento' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload de Fotos "Antes" */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Camera className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Fotos "Antes"
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="before-photos"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload('before', e)}
                  className="hidden"
                />
                <label htmlFor="before-photos" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-black">Clique para adicionar fotos</p>
                  <p className="text-xs text-gray-500">PNG, JPG até 10MB cada</p>
                </label>
              </div>

              {beforePhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {beforePhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Antes ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removePhoto('before', index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upload de Fotos "Depois" */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <Camera className="h-5 w-5 mr-2" style={{ color: '#8B20EE' }} />
              Fotos "Depois"
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto scrollbar-hide min-h-0">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="after-photos"
                  multiple
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload('after', e)}
                  className="hidden"
                />
                <label htmlFor="after-photos" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-black">Clique para adicionar fotos</p>
                  <p className="text-xs text-gray-500">PNG, JPG até 10MB cada</p>
                </label>
              </div>

              {afterPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {afterPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Depois ${index + 1}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removePhoto('after', index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Enviar */}
      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <div className="flex justify-center">
          <Button 
            className="px-8 py-2"
            style={{ backgroundColor: '#6400A4', color: 'white' }}
            onClick={handleSubmitPhotos}
            disabled={!selectedService}
          >
            <Check className="h-4 w-4 mr-2" />
            Enviar Documentação
          </Button>
        </div>
      )}

      {/* Histórico de Uploads */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle className="text-black">Uploads Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentUploads.map((upload, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-black">{upload.service}</p>
                  <p className="text-sm text-gray-600">{upload.date}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-black">
                    {upload.beforeCount} antes, {upload.afterCount} depois
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-none">
                    Enviado
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}