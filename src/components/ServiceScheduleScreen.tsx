import { useState } from 'react';
import { Calendar, Clock, Users, MapPin, FileText, Eye, Filter, Search, ChevronLeft, ChevronRight, Edit2, XCircle, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface ScheduledService {
  id: string;
  clientName: string;
  clientArea: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  clientLocation?: string;
  serviceType: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedManager: string;
  assignedManagerArea: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  assignedTeam?: string;
  assignedCollaborator?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  cancellationReason?: string;
}

interface ServiceScheduleScreenProps {
  userRole: 'admin' | 'manager';
  managerArea?: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
}

type ViewMode = 'daily' | 'weekly' | 'monthly';

export default function ServiceScheduleScreen({ userRole, managerArea }: ServiceScheduleScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 16)); // 16 de outubro de 2025
  const [selectedService, setSelectedService] = useState<ScheduledService | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // Estados para dialogs de gestor
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  
  const [cancellationReason, setCancellationReason] = useState('');
  const [originalEditForm, setOriginalEditForm] = useState({
    serviceType: '',
    scheduledDate: '',
    scheduledTime: '',
    assignedTeam: ''
  });
  const [editForm, setEditForm] = useState({
    serviceType: '',
    scheduledDate: '',
    scheduledTime: '',
    assignedTeam: ''
  });

  // Gerar muitos serviços agendados para simulação realista
  const [allScheduledServices, setAllScheduledServices] = useState<ScheduledService[]>([
    // Outubro 16
    { id: 'REQ-2025-001', clientName: 'Shopping Center Norte', clientArea: 'norte', clientLocation: 'Unidade Principal - 3º Andar', serviceType: 'Limpeza Profunda', description: 'Limpeza completa de todos os andares', scheduledDate: '2025-10-16', scheduledTime: '08:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', assignedTeam: 'Equipe Alpha', assignedCollaborator: 'Carlos Silva', status: 'in-progress' },
    { id: 'REQ-2025-002', clientName: 'Hospital Santa Maria', clientArea: 'sul', serviceType: 'Limpeza Hospitalar', description: 'Limpeza especializada em ambiente hospitalar', scheduledDate: '2025-10-16', scheduledTime: '06:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', assignedTeam: 'Equipe Delta', assignedCollaborator: 'Maria Silva', status: 'in-progress' },
    { id: 'REQ-2025-003', clientName: 'Escritório Tech Park', clientArea: 'leste', serviceType: 'Limpeza de Vidros', description: 'Limpeza externa de vidros', scheduledDate: '2025-10-16', scheduledTime: '14:00', assignedManager: 'Pedro Costa', assignedManagerArea: 'leste', assignedTeam: 'Equipe Beta', status: 'scheduled' },
    
    // Outubro 17
    { id: 'REQ-2025-004', clientName: 'Condomínio Residencial Horizonte', clientArea: 'norte', clientLocation: 'Bloco B - Área de Lazer', serviceType: 'Manutenção de Piscina', description: 'Limpeza e tratamento químico da piscina', scheduledDate: '2025-10-17', scheduledTime: '10:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', assignedTeam: 'Equipe Beta', status: 'scheduled' },
    { id: 'REQ-2025-005', clientName: 'Shopping Plaza', clientArea: 'sul', serviceType: 'Jardinagem', description: 'Manutenção de jardins externos', scheduledDate: '2025-10-17', scheduledTime: '07:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', assignedTeam: 'Equipe Gamma', status: 'scheduled' },
    { id: 'REQ-2025-006', clientName: 'Edifício Empresarial Central', clientArea: 'centro', serviceType: 'Limpeza Geral', description: 'Limpeza de áreas comuns', scheduledDate: '2025-10-17', scheduledTime: '09:00', assignedManager: 'Ricardo Santos', assignedManagerArea: 'centro', assignedTeam: 'Equipe Epsilon', status: 'scheduled' },
    { id: 'REQ-2025-007', clientName: 'Hotel Premium', clientArea: 'oeste', serviceType: 'Limpeza Profunda', description: 'Limpeza de quartos e áreas comuns', scheduledDate: '2025-10-17', scheduledTime: '13:00', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', status: 'scheduled' },

    // Outubro 18
    { id: 'REQ-2025-008', clientName: 'Torre Comercial Norte', clientArea: 'norte', serviceType: 'Manutenção Elétrica', description: 'Troca de lâmpadas LED', scheduledDate: '2025-10-18', scheduledTime: '08:30', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', assignedTeam: 'Equipe Alpha', status: 'scheduled' },
    { id: 'REQ-2025-009', clientName: 'Condomínio Residencial', clientArea: 'oeste', serviceType: 'Jardinagem', description: 'Manutenção de jardins e poda de árvores', scheduledDate: '2025-10-18', scheduledTime: '07:00', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', assignedTeam: 'Equipe Gamma', assignedCollaborator: 'João Santos', status: 'scheduled' },
    { id: 'REQ-2025-010', clientName: 'Clínica Médica Vida', clientArea: 'sul', serviceType: 'Limpeza Especializada', description: 'Desinfecção de consultórios', scheduledDate: '2025-10-18', scheduledTime: '18:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', status: 'scheduled' },

    // Outubro 19
    { id: 'REQ-2025-011', clientName: 'Parque Industrial Leste', clientArea: 'leste', serviceType: 'Limpeza Industrial', description: 'Limpeza de galpões', scheduledDate: '2025-10-19', scheduledTime: '06:00', assignedManager: 'Pedro Costa', assignedManagerArea: 'leste', assignedTeam: 'Equipe Epsilon', status: 'scheduled' },
    { id: 'REQ-2025-012', clientName: 'Escola Municipal', clientArea: 'norte', serviceType: 'Limpeza Escolar', description: 'Limpeza de salas e pátio', scheduledDate: '2025-10-19', scheduledTime: '14:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', status: 'scheduled' },
    { id: 'REQ-2025-013', clientName: 'Restaurante Gourmet', clientArea: 'centro', serviceType: 'Limpeza de Cozinha', description: 'Limpeza profunda de cozinha industrial', scheduledDate: '2025-10-19', scheduledTime: '22:00', assignedManager: 'Ricardo Santos', assignedManagerArea: 'centro', status: 'scheduled' },

    // Outubro 20
    { id: 'REQ-2025-014', clientName: 'Academia Fitness', clientArea: 'sul', serviceType: 'Limpeza e Desinfecção', description: 'Limpeza de aparelhos e vestiários', scheduledDate: '2025-10-20', scheduledTime: '05:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', status: 'scheduled' },
    { id: 'REQ-2025-015', clientName: 'Condomínio Sunset', clientArea: 'oeste', serviceType: 'Limpeza de Piscina', description: 'Tratamento químico e limpeza', scheduledDate: '2025-10-20', scheduledTime: '09:00', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', status: 'scheduled' },
    { id: 'REQ-2025-016', clientName: 'Biblioteca Municipal', clientArea: 'centro', serviceType: 'Limpeza Geral', description: 'Limpeza de estantes e pisos', scheduledDate: '2025-10-20', scheduledTime: '16:00', assignedManager: 'Ricardo Santos', assignedManagerArea: 'centro', status: 'scheduled' },
    { id: 'REQ-2025-017', clientName: 'Mercado Central', clientArea: 'norte', serviceType: 'Limpeza Comercial', description: 'Limpeza de corredores e banheiros', scheduledDate: '2025-10-20', scheduledTime: '20:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', status: 'scheduled' },

    // Outubro 21
    { id: 'REQ-2025-018', clientName: 'Hotel Business', clientArea: 'leste', serviceType: 'Limpeza Hoteleira', description: 'Limpeza de 50 quartos', scheduledDate: '2025-10-21', scheduledTime: '10:00', assignedManager: 'Pedro Costa', assignedManagerArea: 'leste', assignedTeam: 'Equipe Alpha', status: 'scheduled' },
    { id: 'REQ-2025-019', clientName: 'Centro Empresarial', clientArea: 'sul', serviceType: 'Limpeza de Vidros', description: 'Limpeza de fachada de vidro', scheduledDate: '2025-10-21', scheduledTime: '07:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', status: 'scheduled' },
    { id: 'REQ-2025-020', clientName: 'Estacionamento Coberto', clientArea: 'oeste', serviceType: 'Limpeza Industrial', description: 'Lavagem de piso e paredes', scheduledDate: '2025-10-21', scheduledTime: '23:00', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', status: 'scheduled' },

    // Outubro 22
    { id: 'REQ-2025-021', clientName: 'Escritório Corporate', clientArea: 'oeste', clientLocation: 'Torre B - 12º Andar', serviceType: 'Limpeza de Vidros', description: 'Limpeza externa e interna de vidros de fachada', scheduledDate: '2025-10-22', scheduledTime: '09:30', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', assignedTeam: 'Equipe Beta', status: 'scheduled' },
    { id: 'REQ-2025-022', clientName: 'Clínica Odontológica', clientArea: 'norte', serviceType: 'Limpeza Especializada', description: 'Desinfecção de consultórios', scheduledDate: '2025-10-22', scheduledTime: '19:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', status: 'scheduled' },
    { id: 'REQ-2025-023', clientName: 'Teatro Municipal', clientArea: 'centro', serviceType: 'Limpeza de Evento', description: 'Limpeza após apresentação', scheduledDate: '2025-10-22', scheduledTime: '22:30', assignedManager: 'Ricardo Santos', assignedManagerArea: 'centro', status: 'scheduled' },

    // Outubro 23
    { id: 'REQ-2025-024', clientName: 'Universidade Campus Sul', clientArea: 'sul', serviceType: 'Limpeza Escolar', description: 'Limpeza de salas de aula', scheduledDate: '2025-10-23', scheduledTime: '18:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', assignedTeam: 'Equipe Delta', status: 'scheduled' },
    { id: 'REQ-2025-025', clientName: 'Fábrica Tech', clientArea: 'leste', serviceType: 'Limpeza Industrial', description: 'Limpeza de área de produção', scheduledDate: '2025-10-23', scheduledTime: '03:00', assignedManager: 'Pedro Costa', assignedManagerArea: 'leste', status: 'scheduled' },
    { id: 'REQ-2025-026', clientName: 'Supermercado Premium', clientArea: 'norte', serviceType: 'Limpeza Comercial', description: 'Limpeza completa após expediente', scheduledDate: '2025-10-23', scheduledTime: '23:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', status: 'scheduled' },

    // Outubro 24
    { id: 'REQ-2025-027', clientName: 'Parque Aquático', clientArea: 'oeste', serviceType: 'Limpeza de Piscinas', description: 'Manutenção de todas as piscinas', scheduledDate: '2025-10-24', scheduledTime: '06:00', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', assignedTeam: 'Equipe Gamma', status: 'scheduled' },
    { id: 'REQ-2025-028', clientName: 'Banco Central', clientArea: 'centro', serviceType: 'Limpeza Bancária', description: 'Limpeza de agências', scheduledDate: '2025-10-24', scheduledTime: '19:00', assignedManager: 'Ricardo Santos', assignedManagerArea: 'centro', status: 'scheduled' },
    { id: 'REQ-2025-029', clientName: 'Hospital Geral Sul', clientArea: 'sul', serviceType: 'Limpeza Hospitalar', description: 'Limpeza de alas e UTI', scheduledDate: '2025-10-24', scheduledTime: '04:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', status: 'scheduled' },

    // Outubro 25
    { id: 'REQ-2025-030', clientName: 'Edifício Empresarial Norte', clientArea: 'norte', serviceType: 'Manutenção Elétrica', description: 'Troca de lâmpadas e manutenção preventiva', scheduledDate: '2025-10-25', scheduledTime: '14:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', assignedTeam: 'Equipe Epsilon', status: 'scheduled' },
    { id: 'REQ-2025-031', clientName: 'Shopping Mall Leste', clientArea: 'leste', serviceType: 'Limpeza Profunda', description: 'Limpeza de praça de alimentação', scheduledDate: '2025-10-25', scheduledTime: '23:00', assignedManager: 'Pedro Costa', assignedManagerArea: 'leste', status: 'scheduled' },
    { id: 'REQ-2025-032', clientName: 'Cinema Multiplex', clientArea: 'oeste', serviceType: 'Limpeza de Salas', description: 'Limpeza de 10 salas de cinema', scheduledDate: '2025-10-25', scheduledTime: '02:00', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', status: 'scheduled' },

    // Outubro 26
    { id: 'REQ-2025-033', clientName: 'Igreja Central', clientArea: 'centro', serviceType: 'Limpeza Religiosa', description: 'Limpeza completa do templo', scheduledDate: '2025-10-26', scheduledTime: '13:00', assignedManager: 'Ricardo Santos', assignedManagerArea: 'centro', status: 'scheduled' },
    { id: 'REQ-2025-034', clientName: 'Clube de Campo', clientArea: 'sul', serviceType: 'Jardinagem', description: 'Manutenção de campos e jardins', scheduledDate: '2025-10-26', scheduledTime: '07:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', status: 'scheduled' },

    // Outubro 27
    { id: 'REQ-2025-035', clientName: 'Laboratório Análises', clientArea: 'norte', serviceType: 'Limpeza Especializada', description: 'Limpeza com protocolos específicos', scheduledDate: '2025-10-27', scheduledTime: '20:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', status: 'scheduled' },
    { id: 'REQ-2025-036', clientName: 'Ginásio Esportivo', clientArea: 'leste', serviceType: 'Limpeza Esportiva', description: 'Limpeza de quadras e vestiários', scheduledDate: '2025-10-27', scheduledTime: '21:00', assignedManager: 'Pedro Costa', assignedManagerArea: 'leste', status: 'scheduled' },
    { id: 'REQ-2025-037', clientName: 'Spa & Wellness', clientArea: 'oeste', serviceType: 'Limpeza Premium', description: 'Limpeza de áreas de tratamento', scheduledDate: '2025-10-27', scheduledTime: '08:00', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', status: 'scheduled' },

    // Outubro 28
    { id: 'REQ-2025-038', clientName: 'Museu de Arte', clientArea: 'centro', serviceType: 'Limpeza Especial', description: 'Limpeza de galerias e exposições', scheduledDate: '2025-10-28', scheduledTime: '18:00', assignedManager: 'Ricardo Santos', assignedManagerArea: 'centro', status: 'scheduled' },
    { id: 'REQ-2025-039', clientName: 'Aeroporto Regional', clientArea: 'sul', serviceType: 'Limpeza Aeroportuária', description: 'Limpeza de terminais', scheduledDate: '2025-10-28', scheduledTime: '05:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', status: 'scheduled' },
    { id: 'REQ-2025-040', clientName: 'Data Center', clientArea: 'norte', serviceType: 'Limpeza Técnica', description: 'Limpeza de sala de servidores', scheduledDate: '2025-10-28', scheduledTime: '02:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', status: 'scheduled' },

    // Outubro 29
    { id: 'REQ-2025-041', clientName: 'Resort Beach', clientArea: 'leste', serviceType: 'Limpeza Hoteleira', description: 'Limpeza de chalés e áreas comuns', scheduledDate: '2025-10-29', scheduledTime: '09:00', assignedManager: 'Pedro Costa', assignedManagerArea: 'leste', status: 'scheduled' },
    { id: 'REQ-2025-042', clientName: 'Posto de Gasolina', clientArea: 'oeste', serviceType: 'Limpeza Comercial', description: 'Limpeza de pista e loja', scheduledDate: '2025-10-29', scheduledTime: '04:00', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', status: 'scheduled' },

    // Outubro 30
    { id: 'REQ-2025-043', clientName: 'Coworking Space', clientArea: 'centro', serviceType: 'Limpeza de Escritório', description: 'Limpeza de estações de trabalho', scheduledDate: '2025-10-30', scheduledTime: '19:00', assignedManager: 'Ricardo Santos', assignedManagerArea: 'centro', status: 'scheduled' },
    { id: 'REQ-2025-044', clientName: 'Pet Shop Premium', clientArea: 'sul', serviceType: 'Limpeza Especializada', description: 'Limpeza e desinfecção', scheduledDate: '2025-10-30', scheduledTime: '20:00', assignedManager: 'Carla Mendes', assignedManagerArea: 'sul', status: 'scheduled' },
    { id: 'REQ-2025-045', clientName: 'Farmácia Central', clientArea: 'norte', serviceType: 'Limpeza Farmacêutica', description: 'Limpeza com protocolos sanitários', scheduledDate: '2025-10-30', scheduledTime: '22:00', assignedManager: 'Ana Paula Rodrigues', assignedManagerArea: 'norte', status: 'scheduled' },

    // Outubro 31
    { id: 'REQ-2025-046', clientName: 'Boate Night Club', clientArea: 'oeste', serviceType: 'Limpeza Pós-Evento', description: 'Limpeza completa após festa', scheduledDate: '2025-10-31', scheduledTime: '06:00', assignedManager: 'Roberto Lima', assignedManagerArea: 'oeste', status: 'scheduled' },
    { id: 'REQ-2025-047', clientName: 'Feira de Exposições', clientArea: 'leste', serviceType: 'Limpeza de Evento', description: 'Limpeza de estandes', scheduledDate: '2025-10-31', scheduledTime: '18:00', assignedManager: 'Pedro Costa', assignedManagerArea: 'leste', status: 'scheduled' },
    { id: 'REQ-2025-048', clientName: 'Prefeitura Municipal', clientArea: 'centro', serviceType: 'Limpeza Pública', description: 'Limpeza de repartições', scheduledDate: '2025-10-31', scheduledTime: '17:00', assignedManager: 'Ricardo Santos', assignedManagerArea: 'centro', status: 'scheduled' },
  ]);

  // Filtrar serviços baseado no papel do usuário
  const scheduledServices = userRole === 'admin' 
    ? allScheduledServices 
    : allScheduledServices.filter(service => service.assignedManagerArea === managerArea);

  // Handlers para ações do gestor
  const handleOpenCancelDialog = () => {
    setCancellationReason('');
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!cancellationReason.trim()) {
      toast.error('Por favor, informe o motivo do cancelamento');
      return;
    }

    if (!selectedService) return;

    setAllScheduledServices(prev => prev.map(service => 
      service.id === selectedService.id
        ? { ...service, status: 'cancelled' as const, cancellationReason }
        : service
    ));

    toast.success('Agendamento cancelado com sucesso!');
    setIsCancelDialogOpen(false);
    setIsDetailsOpen(false);
    setCancellationReason('');
  };

  const handleOpenEditDialog = () => {
    if (!selectedService) return;
    
    const formData = {
      serviceType: selectedService.serviceType,
      scheduledDate: selectedService.scheduledDate,
      scheduledTime: selectedService.scheduledTime,
      assignedTeam: selectedService.assignedTeam || 'none'
    };
    
    setEditForm(formData);
    setOriginalEditForm(formData);
    setIsEditDialogOpen(true);
  };

  const hasEditChanges = () => {
    return editForm.serviceType !== originalEditForm.serviceType ||
           editForm.scheduledDate !== originalEditForm.scheduledDate ||
           editForm.scheduledTime !== originalEditForm.scheduledTime ||
           editForm.assignedTeam !== originalEditForm.assignedTeam;
  };

  const handleConfirmEdit = () => {
    if (!editForm.serviceType || !editForm.scheduledDate || !editForm.scheduledTime) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!selectedService) return;

    setAllScheduledServices(prev => prev.map(service => 
      service.id === selectedService.id
        ? { 
            ...service, 
            serviceType: editForm.serviceType,
            scheduledDate: editForm.scheduledDate,
            scheduledTime: editForm.scheduledTime,
            assignedTeam: editForm.assignedTeam === 'none' ? undefined : editForm.assignedTeam || undefined
          }
        : service
    ));

    toast.success('Serviço atualizado com sucesso!');
    setIsEditDialogOpen(false);
    setIsDetailsOpen(false);
  };

  const handleStartService = () => {
    setIsStartDialogOpen(true);
  };

  const handleConfirmStart = () => {
    if (!selectedService) return;

    setAllScheduledServices(prev => prev.map(service => 
      service.id === selectedService.id
        ? { ...service, status: 'in-progress' as const }
        : service
    ));

    toast.success('Serviço iniciado! Status atualizado para "Em Andamento"');
    setIsStartDialogOpen(false);
    setIsDetailsOpen(false);
  };

  const handleCompleteService = () => {
    setIsCompleteDialogOpen(true);
  };

  const handleConfirmComplete = () => {
    if (!selectedService) return;

    setAllScheduledServices(prev => prev.map(service => 
      service.id === selectedService.id
        ? { ...service, status: 'completed' as const }
        : service
    ));

    toast.success('Serviço concluído com sucesso!');
    setIsCompleteDialogOpen(false);
    setIsDetailsOpen(false);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      'scheduled': { 
        label: 'Agendado', 
        color: '#35BAE6',
        bg: 'rgba(53, 186, 230, 0.1)'
      },
      'in-progress': { 
        label: 'Em Andamento', 
        color: '#8B20EE',
        bg: 'rgba(139, 32, 238, 0.1)'
      },
      'completed': { 
        label: 'Concluído', 
        color: '#16a34a',
        bg: 'rgba(34, 197, 94, 0.1)'
      },
      'cancelled': { 
        label: 'Cancelado', 
        color: '#dc2626',
        bg: 'rgba(220, 38, 38, 0.1)'
      }
    };
    return configs[status as keyof typeof configs];
  };

  const getAreaColor = (area: string) => {
    const colors = {
      norte: '#8B20EE',
      sul: '#35BAE6',
      leste: '#FFFF20',
      oeste: '#6400A4',
      centro: '#000000'
    };
    return colors[area as keyof typeof colors] || '#6400A4';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleViewService = (service: ScheduledService) => {
    setSelectedService(service);
    setIsDetailsOpen(true);
  };

  // Filtros
  const filteredServices = scheduledServices.filter(service => {
    const matchesSearch = service.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || service.status === statusFilter;
    const matchesArea = areaFilter === 'all' || service.clientArea === areaFilter;
    return matchesSearch && matchesStatus && matchesArea;
  });

  // Estatísticas
  const stats = {
    total: scheduledServices.length,
    scheduled: scheduledServices.filter(s => s.status === 'scheduled').length,
    inProgress: scheduledServices.filter(s => s.status === 'in-progress').length,
    completed: scheduledServices.filter(s => s.status === 'completed').length
  };

  // Navegação de período
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date(2025, 9, 16)); // 16 de outubro de 2025
  };

  // Obter serviços por data
  const getServicesForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return filteredServices.filter(s => s.scheduledDate === dateString);
  };

  // Renderizar card de serviço
  const renderServiceCard = (service: ScheduledService) => {
    return (
      <Card 
        key={service.id}
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleViewService(service)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{service.clientName}</h3>
                <Badge 
                  style={{ 
                    backgroundColor: getStatusConfig(service.status).bg,
                    color: getStatusConfig(service.status).color,
                    border: `1px solid ${getStatusConfig(service.status).color}`
                  }}
                >
                  {getStatusConfig(service.status).label}
                </Badge>
                <Badge 
                  style={{ 
                    backgroundColor: `${getAreaColor(service.clientArea)}15`,
                    color: getAreaColor(service.clientArea),
                    border: `1px solid ${getAreaColor(service.clientArea)}40`
                  }}
                >
                  {service.clientArea.charAt(0).toUpperCase() + service.clientArea.slice(1)}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{service.serviceType}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.scheduledTime}</span>
                </div>
                {service.assignedTeam && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{service.assignedTeam}</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleViewService(service);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Renderizar visualização diária
  const renderDailyView = () => {
    const services = getServicesForDate(currentDate);
    
    return (
      <div className="space-y-3">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2" style={{ borderColor: '#6400A4' }}>
          <h3 className="text-lg mb-1" style={{ color: '#6400A4' }}>
            {currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
          </h3>
          <p className="text-2xl">
            {currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {services.length} {services.length === 1 ? 'serviço agendado' : 'serviços agendados'}
          </p>
        </div>

        {services.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-gray-500">Nenhum serviço agendado para este dia</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {services
              .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
              .map((service) => renderServiceCard(service))}
          </div>
        )}
      </div>
    );
  };

  // Renderizar visualização semanal
  const renderWeeklyView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
          <h3 className="text-lg" style={{ color: '#6400A4' }}>
            Semana de {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} a {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((date, index) => {
            const services = getServicesForDate(date);
            const isToday = date.toDateString() === new Date(2025, 9, 16).toDateString();
            
            return (
              <div key={index} className="space-y-2">
                <div 
                  className="rounded-lg p-3 text-center border-2"
                  style={{ 
                    borderColor: isToday ? '#6400A4' : '#e5e7eb',
                    backgroundColor: isToday ? 'rgba(100, 0, 164, 0.05)' : 'white'
                  }}
                >
                  <p className="text-xs text-gray-600">
                    {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </p>
                  <p className="text-xl" style={{ color: isToday ? '#6400A4' : 'inherit' }}>
                    {date.getDate()}
                  </p>
                  <p className="text-xs" style={{ color: '#8B20EE' }}>
                    {services.length} serviços
                  </p>
                </div>
                
                <div className="space-y-1">
                  {services.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="p-2 rounded-md text-xs cursor-pointer hover:shadow-md transition-shadow"
                      style={{ 
                        backgroundColor: getStatusConfig(service.status).bg,
                        borderLeft: `3px solid ${getStatusConfig(service.status).color}`
                      }}
                      onClick={() => handleViewService(service)}
                    >
                      <p className="truncate">{service.scheduledTime}</p>
                      <p className="truncate font-semibold">{service.clientName}</p>
                      <p className="truncate text-gray-600">{service.serviceType}</p>
                    </div>
                  ))}
                  {services.length > 3 && (
                    <p className="text-xs text-center text-gray-500 py-1">
                      +{services.length - 3} mais
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar visualização mensal
  const renderMonthlyView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const weeks = [];
    let currentWeek = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      currentWeek.push(new Date(date));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
          <h3 className="text-2xl" style={{ color: '#6400A4' }}>
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="p-3 text-center text-sm text-gray-600 bg-gray-50">
                {day}
              </div>
            ))}
          </div>

          {/* Grade do calendário */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 last:border-b-0">
              {week.map((date, dayIndex) => {
                const services = getServicesForDate(date);
                const isCurrentMonth = date.getMonth() === month;
                const isToday = date.toDateString() === new Date(2025, 9, 16).toDateString();
                
                return (
                  <div
                    key={dayIndex}
                    className="min-h-[120px] p-2 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors"
                    style={{ 
                      backgroundColor: isToday ? 'rgba(100, 0, 164, 0.05)' : isCurrentMonth ? 'white' : '#f9fafb'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span 
                        className="text-sm"
                        style={{ 
                          color: isToday ? '#6400A4' : isCurrentMonth ? 'black' : '#9ca3af',
                          fontWeight: isToday ? 700 : 400
                        }}
                      >
                        {date.getDate()}
                      </span>
                      {services.length > 0 && (
                        <Badge 
                          className="text-xs"
                          style={{ 
                            backgroundColor: '#8B20EE',
                            color: 'white'
                          }}
                        >
                          {services.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {services.slice(0, 2).map((service) => (
                        <div
                          key={service.id}
                          className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ 
                            backgroundColor: getStatusConfig(service.status).bg,
                            borderLeft: `2px solid ${getStatusConfig(service.status).color}`
                          }}
                          onClick={() => handleViewService(service)}
                        >
                          <p className="truncate font-semibold">{service.scheduledTime}</p>
                          <p className="truncate">{service.clientName}</p>
                        </div>
                      ))}
                      {services.length > 2 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{services.length - 2}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="hive-screen-title">Agenda de Serviços</h1>
          <p className="text-black">
            {userRole === 'admin' 
              ? 'Visualize todos os serviços agendados do sistema'
              : `Serviços agendados para a área ${managerArea?.toUpperCase()}`
            }
          </p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl" style={{ color: '#6400A4' }}>{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agendados</p>
              <p className="text-2xl" style={{ color: '#35BAE6' }}>{stats.scheduled}</p>
            </div>
            <Clock className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Em Andamento</p>
              <p className="text-2xl" style={{ color: '#8B20EE' }}>{stats.inProgress}</p>
            </div>
            <Users className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Concluídos</p>
              <p className="text-2xl text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Controles de Visualização e Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            {/* Seletor de visualização */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="daily">Diária</TabsTrigger>
                <TabsTrigger value="weekly">Semanal</TabsTrigger>
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Navegação de período */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                style={{ 
                  backgroundColor: '#6400A4',
                  color: 'white',
                  borderColor: '#6400A4'
                }}
              >
                {(() => {
                  if (viewMode === 'daily') {
                    const today = new Date(2025, 9, 16);
                    const isToday = currentDate.toDateString() === today.toDateString();
                    return isToday ? 'Hoje' : currentDate.toLocaleDateString('pt-BR', { weekday: 'long' });
                  } else if (viewMode === 'weekly') {
                    const startOfWeek = new Date(currentDate);
                    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
                    return `Semana ${startOfWeek.getDate()}/${startOfWeek.getMonth() + 1}`;
                  } else {
                    const month = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
                    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
                    return `${capitalizedMonth}/${currentDate.getFullYear()}`;
                  }
                })()}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, serviço ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            {userRole === 'admin' && (
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Áreas</SelectItem>
                  <SelectItem value="norte">Norte</SelectItem>
                  <SelectItem value="sul">Sul</SelectItem>
                  <SelectItem value="leste">Leste</SelectItem>
                  <SelectItem value="oeste">Oeste</SelectItem>
                  <SelectItem value="centro">Centro</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Renderização da visualização selecionada */}
      {viewMode === 'daily' && renderDailyView()}
      {viewMode === 'weekly' && renderWeeklyView()}
      {viewMode === 'monthly' && renderMonthlyView()}

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <DialogTitle style={{ color: '#6400A4' }}>
                Detalhes do Serviço Agendado
              </DialogTitle>
              {selectedService && (
                <Badge 
                  style={{ 
                    backgroundColor: getStatusConfig(selectedService.status).bg,
                    color: getStatusConfig(selectedService.status).color,
                    border: `1px solid ${getStatusConfig(selectedService.status).color}`
                  }}
                >
                  {getStatusConfig(selectedService.status).label}
                </Badge>
              )}
            </div>
            <DialogDescription>
              {selectedService?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cliente</p>
                  <p className="font-semibold">{selectedService.clientName}</p>
                  {selectedService.clientLocation && (
                    <p className="text-sm text-gray-600">{selectedService.clientLocation}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Área</p>
                  <Badge 
                    style={{ 
                      backgroundColor: `${getAreaColor(selectedService.clientArea)}15`,
                      color: getAreaColor(selectedService.clientArea),
                      border: `1px solid ${getAreaColor(selectedService.clientArea)}40`
                    }}
                  >
                    {selectedService.clientArea.charAt(0).toUpperCase() + selectedService.clientArea.slice(1)}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Tipo de Serviço</p>
                <p>{selectedService.serviceType}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">Descrição</p>
                <p className="text-sm">{selectedService.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Data Agendada</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p>{formatDate(selectedService.scheduledDate)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Horário</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p>{selectedService.scheduledTime}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Gestor Responsável</p>
                  <p style={{ color: '#6400A4' }}>{selectedService.assignedManager}</p>
                </div>
                {selectedService.assignedTeam && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Equipe</p>
                    <p style={{ color: '#8B20EE' }}>{selectedService.assignedTeam}</p>
                  </div>
                )}
              </div>

              {selectedService.assignedCollaborator && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Colaborador</p>
                  <p>{selectedService.assignedCollaborator}</p>
                </div>
              )}

              {selectedService.cancellationReason && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-gray-500 mb-1">Motivo do Cancelamento</p>
                  <p className="text-sm text-red-700">{selectedService.cancellationReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Botões de ação para GESTOR apenas */}
          {userRole === 'manager' && selectedService && selectedService.status !== 'cancelled' && (
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2 w-full">
                {/* Botão Cancelar (apenas para agendados) */}
                {selectedService.status === 'scheduled' && (
                  <Button
                    onClick={handleOpenCancelDialog}
                    className="flex-1"
                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar Agendamento
                  </Button>
                )}

                {/* Botão Editar (apenas para agendados) */}
                {selectedService.status === 'scheduled' && (
                  <Button
                    onClick={handleOpenEditDialog}
                    className="flex-1"
                    style={{ backgroundColor: '#FFFF20', color: 'black' }}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}

                {/* Botão Iniciar Serviço (apenas para agendados) */}
                {selectedService.status === 'scheduled' && (
                  <Button
                    onClick={handleStartService}
                    className="flex-1"
                    style={{ backgroundColor: '#8B20EE', color: 'white' }}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Iniciar Serviço
                  </Button>
                )}

                {/* Botão Concluir Serviço (apenas para em andamento) - Centralizado */}
                {selectedService.status === 'in-progress' && (
                  <Button
                    onClick={handleCompleteService}
                    className="w-full max-w-md mx-auto"
                    style={{ backgroundColor: '#16a34a', color: 'white' }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Concluir Serviço
                  </Button>
                )}
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Cancelamento */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cancelar Agendamento
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Motivo do Cancelamento *</Label>
              <Textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Descreva o motivo do cancelamento..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Voltar
            </Button>
            <Button 
              onClick={handleConfirmCancel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Editar Serviço
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do serviço agendado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Tipo de Serviço *</Label>
              <Input
                value={editForm.serviceType}
                onChange={(e) => setEditForm({ ...editForm, serviceType: e.target.value })}
                placeholder="Ex: Limpeza Profunda"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={editForm.scheduledDate}
                  onChange={(e) => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Horário *</Label>
                <Input
                  type="time"
                  value={editForm.scheduledTime}
                  onChange={(e) => setEditForm({ ...editForm, scheduledTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Equipe</Label>
              <Select value={editForm.assignedTeam} onValueChange={(value) => setEditForm({ ...editForm, assignedTeam: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem equipe</SelectItem>
                  <SelectItem value="Equipe Alpha">Equipe Alpha</SelectItem>
                  <SelectItem value="Equipe Beta">Equipe Beta</SelectItem>
                  <SelectItem value="Equipe Gamma">Equipe Gamma</SelectItem>
                  <SelectItem value="Equipe Delta">Equipe Delta</SelectItem>
                  <SelectItem value="Equipe Epsilon">Equipe Epsilon</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmEdit}
              disabled={!hasEditChanges()}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Iniciar Serviço */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: '#8B20EE' }}>
              <PlayCircle className="h-5 w-5" />
              Iniciar Serviço
            </DialogTitle>
            <DialogDescription>
              Confirme o início do serviço. O status será alterado para "Em Andamento".
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4">
              <div className="p-4 rounded-lg border-2" style={{ borderColor: '#8B20EE', backgroundColor: 'rgba(139, 32, 238, 0.05)' }}>
                <p className="font-semibold mb-2">{selectedService.clientName}</p>
                <p className="text-sm text-gray-600 mb-1">{selectedService.serviceType}</p>
                <p className="text-sm text-gray-500">{formatDate(selectedService.scheduledDate)} às {selectedService.scheduledTime}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmStart}
              style={{ backgroundColor: '#8B20EE', color: 'white' }}
            >
              Confirmar Início
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Concluir Serviço */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Concluir Serviço
            </DialogTitle>
            <DialogDescription>
              Confirme a conclusão do serviço. O status será alterado para "Concluído".
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="py-4">
              <div className="p-4 rounded-lg border-2 border-green-500 bg-green-50">
                <p className="font-semibold mb-2">{selectedService.clientName}</p>
                <p className="text-sm text-gray-600 mb-1">{selectedService.serviceType}</p>
                <p className="text-sm text-gray-500">{formatDate(selectedService.scheduledDate)} às {selectedService.scheduledTime}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmComplete}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Confirmar Conclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
