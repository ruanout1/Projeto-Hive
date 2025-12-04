import { useState, useEffect } from 'react';
import { Camera, Upload, X, Check, Calendar, MapPin, Loader2 } from 'lucide-react';
import ScreenHeader from '../public/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { getMySchedule, uploadServicePhotos } from '../../lib/api'; // API real

// Tipagem do serviço vindo do backend
interface ScheduledService {
  id: string;
  serviceRequest: {
    serviceType: string;
    client: {
      name: string;
    };
    location?: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'in-progress' | 'completed' | 'scheduled';
}

interface PhotoUploadSectionProps {
  onBack?: () => void;
}

// NOVO: Tipagem para o estado do arquivo, armazenando o objeto File e a URL de preview
interface PhotoFile {
  file: File;
  preview: string;
}

export default function PhotoUploadSection({ onBack }: PhotoUploadSectionProps) {
  // ESTADOS
  const [assignedServices, setAssignedServices] = useState<ScheduledService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedService, setSelectedService] = useState<string>('');
  const [beforePhotos, setBeforePhotos] = useState<PhotoFile[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<PhotoFile[]>([]);

  // EFEITO PARA BUSCAR SERVIÇOS
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const data = await getMySchedule();
        // Filtramos para mostrar apenas serviços que requerem ação do colaborador
        const filteredServices = data.filter((s: ScheduledService) => 
          ['scheduled', 'in-progress'].includes(s.status)
        );
        setAssignedServices(filteredServices);
      } catch (error) {
        console.error("Erro ao buscar serviços agendados:", error);
        toast.error('Falha ao carregar serviços.', {
          description: 'Tente recarregar a página.'
        });
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  // FUNÇÕES DE MANIPULAÇÃO DE FOTOS
  const handlePhotoUpload = (type: 'before' | 'after', event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotoFiles = Array.from(files).map(file => ({
        file: file,
        preview: URL.createObjectURL(file)
      }));
      
      if (type === 'before') {
        setBeforePhotos(prev => [...prev, ...newPhotoFiles]);
      } else {
        setAfterPhotos(prev => [...prev, ...newPhotoFiles]);
      }
    }
  };

  const removePhoto = (type: 'before' | 'after', index: number) => {
    const photoToRemove = type === 'before' ? beforePhotos[index] : afterPhotos[index];
    URL.revokeObjectURL(photoToRemove.preview); // Limpa memória

    if (type === 'before') {
      setBeforePhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setAfterPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };

  // FUNÇÃO DE SUBMISSÃO (LÓGICA PRINCIPAL)
  const handleSubmitPhotos = async () => {
    if (!selectedService) {
      toast.error('Selecione um serviço antes de enviar as fotos');
      return;
    }
    
    if (beforePhotos.length === 0 && afterPhotos.length === 0) {
      toast.error('Adicione pelo menos uma foto de \'antes\' ou \'depois\'.');
      return;
    }

    setIsSubmitting(true);
    const promise = async () => {
      // Upload das fotos "antes"
      if (beforePhotos.length > 0) {
        await uploadServicePhotos(selectedService, 'before', beforePhotos.map(p => p.file));
      }
      // Upload das fotos "depois"
      if (afterPhotos.length > 0) {
        await uploadServicePhotos(selectedService, 'after', afterPhotos.map(p => p.file));
      }
    };

    toast.promise(promise(), {
      loading: 'Enviando fotos, por favor aguarde...',
      success: () => {
        // Limpar formulário após sucesso
        setSelectedService('');
        setBeforePhotos([]);
        setAfterPhotos([]);
        setIsSubmitting(false);
        return `Documentação enviada com sucesso!`;
      },
      error: (err) => {
        setIsSubmitting(false);
        console.error("Erro no upload:", err);
        return 'Falha ao enviar fotos. Verifique sua conexão ou tente novamente.';
      },
    });
  };

  const currentService = assignedServices.find(s => s.id === selectedService);

  // RENDERIZAÇÃO DO COMPONENTE
  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
        <ScreenHeader 
          title="Documentação Fotográfica"
          description="Registre o antes e depois dos serviços para controle de qualidade."
          onBack={onBack}
        />
      
      {/* Card de Seleção de Serviço */}
      <Card>
        <CardHeader><CardTitle>1. Selecionar Serviço</CardTitle></CardHeader>
        <CardContent>
            <Label htmlFor="service-select">Serviço Atribuído *</Label>
            <Select value={selectedService} onValueChange={setSelectedService} disabled={isSubmitting}>
              <SelectTrigger id="service-select" className="mt-1">
                <SelectValue placeholder={isLoadingServices ? 'Carregando serviços...' : 'Selecione um serviço ativo'} />
              </SelectTrigger>
              <SelectContent>
                {!isLoadingServices && assignedServices.length === 0 && (
                    <div className="text-center text-gray-500 p-4">Nenhum serviço ativo encontrado.</div>
                )}
                {assignedServices.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex flex-col">
                      <span>{service.serviceRequest.serviceType} - {service.serviceRequest.client.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(service.scheduledDate).toLocaleDateString()} às {service.scheduledTime}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentService && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 mt-4">
                  <p className="text-sm" style={{ color: '#6400A4' }}><strong>{currentService.serviceRequest.serviceType}</strong></p>
                  <p className="text-xs text-gray-600 mt-1">{currentService.serviceRequest.client.name}</p>
                  {currentService.serviceRequest.location && <p className="text-xs text-gray-600 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{currentService.serviceRequest.location}</p>}
                  <Badge className="mt-2 border-none bg-blue-100 text-blue-800">Em Andamento</Badge>
              </div>
            )}
        </CardContent>
      </Card>

      {/* Grid para Upload de Fotos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Card Fotos "Antes" */}
        <Card className="flex flex-col">
          <CardHeader><CardTitle className="flex items-center"><Camera className="h-5 w-5 mr-2 text-purple-700" />Fotos "Antes"</CardTitle></CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" id="before-photos" multiple accept="image/*" onChange={(e) => handlePhotoUpload('before', e)} className="hidden" disabled={isSubmitting} />
                <label htmlFor="before-photos" className={`cursor-pointer ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Clique para adicionar fotos</p>
                </label>
              </div>
              {beforePhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {beforePhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img src={photo.preview} alt={`Preview Antes ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                      <button onClick={() => removePhoto('before', index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" disabled={isSubmitting}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* Card Fotos "Depois" */}
        <Card className="flex flex-col">
          <CardHeader><CardTitle className="flex items-center"><Camera className="h-5 w-5 mr-2 text-fuchsia-600" />Fotos "Depois"</CardTitle></CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input type="file" id="after-photos" multiple accept="image/*" onChange={(e) => handlePhotoUpload('after', e)} className="hidden" disabled={isSubmitting} />
                <label htmlFor="after-photos" className={`cursor-pointer ${isSubmitting ? 'cursor-not-allowed opacity-50' : ''}`}>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>Clique para adicionar fotos</p>
                </label>
              </div>
              {afterPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {afterPhotos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img src={photo.preview} alt={`Preview Depois ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                      <button onClick={() => removePhoto('after', index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity" disabled={isSubmitting}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Botão de Envio */}
      {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
        <div className="flex justify-center py-4">
          <Button 
            className="w-full max-w-md bg-purple-700 hover:bg-purple-800 text-white font-bold"
            onClick={handleSubmitPhotos}
            disabled={!selectedService || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            {isSubmitting ? 'Enviando...' : 'Enviar Documentação'}
          </Button>
        </div>
      )}
    </div>
  );
}
