import { useState } from 'react';
import ScreenHeader from '../../components/ScreenHeader';
import { 
  FileText, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Building,
  MapPin,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

interface ServiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ServiceOrder {
  id: string;
  clientId: string;
  clientName: string;
  clientArea: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro';
  periodStart: string;
  periodEnd: string;
  services: ServiceItem[];
  totalValue: number;
  paymentStatus: 'paid' | 'pending';
  createdDate: string;
  createdBy: string;
  notes?: string;
}

interface ServiceOrdersScreenProps {
  onBack?: () => void;
}

export default function ServiceOrdersScreen({ onBack }: ServiceOrdersScreenProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending'>('all');

  // Form states
  const [formClientId, setFormClientId] = useState('');
  const [formPeriodStart, setFormPeriodStart] = useState('');
  const [formPeriodEnd, setFormPeriodEnd] = useState('');
  const [formServices, setFormServices] = useState<ServiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [formPaymentStatus, setFormPaymentStatus] = useState<'paid' | 'pending'>('pending');
  const [formNotes, setFormNotes] = useState('');

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([
    {
      id: 'OS-2024-001',
      clientId: 'CLI-001',
      clientName: 'Shopping Center Norte',
      clientArea: 'norte',
      periodStart: '01/10/2024',
      periodEnd: '15/10/2024',
      services: [
        { description: 'Limpeza Geral - Piso Térreo', quantity: 15, unitPrice: 450.00, total: 6750.00 },
        { description: 'Limpeza de Estacionamento', quantity: 10, unitPrice: 350.00, total: 3500.00 }
      ],
      totalValue: 10250.00,
      paymentStatus: 'paid',
      createdDate: '16/10/2024',
      createdBy: 'Admin Sistema',
      notes: 'Serviços realizados conforme cronograma estabelecido.'
    },
    {
      id: 'OS-2024-002',
      clientId: 'CLI-003',
      clientName: 'Condomínio Parque Sul',
      clientArea: 'sul',
      periodStart: '01/10/2024',
      periodEnd: '31/10/2024',
      services: [
        { description: 'Jardinagem - Manutenção Mensal', quantity: 1, unitPrice: 2500.00, total: 2500.00 },
        { description: 'Poda de Árvores', quantity: 8, unitPrice: 180.00, total: 1440.00 }
      ],
      totalValue: 3940.00,
      paymentStatus: 'pending',
      createdDate: '20/10/2024',
      createdBy: 'Admin Sistema'
    },
    {
      id: 'OS-2024-003',
      clientId: 'CLI-005',
      clientName: 'Escritório Tech Center',
      clientArea: 'centro',
      periodStart: '10/10/2024',
      periodEnd: '20/10/2024',
      services: [
        { description: 'Limpeza de Vidros - Fachada Externa', quantity: 2, unitPrice: 850.00, total: 1700.00 }
      ],
      totalValue: 1700.00,
      paymentStatus: 'paid',
      createdDate: '21/10/2024',
      createdBy: 'Admin Sistema',
      notes: 'Pagamento realizado via transferência.'
    }
  ]);

  const clients = [
    { id: 'CLI-001', name: 'Shopping Center Norte', area: 'norte' as const },
    { id: 'CLI-002', name: 'Hospital Oeste', area: 'oeste' as const },
    { id: 'CLI-003', name: 'Condomínio Parque Sul', area: 'sul' as const },
    { id: 'CLI-004', name: 'Prédio Comercial Leste', area: 'leste' as const },
    { id: 'CLI-005', name: 'Escritório Tech Center', area: 'centro' as const }
  ];

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === 'all' || order.paymentStatus === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const statusCounts = {
    total: serviceOrders.length,
    paid: serviceOrders.filter(o => o.paymentStatus === 'paid').length,
    pending: serviceOrders.filter(o => o.paymentStatus === 'pending').length
  };

  const totalRevenue = serviceOrders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalValue, 0);

  const pendingRevenue = serviceOrders
    .filter(o => o.paymentStatus === 'pending')
    .reduce((sum, o) => sum + o.totalValue, 0);

  const handleOpenCreate = () => {
    resetForm();
    setIsEditing(false);
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setFormClientId(order.clientId);
    setFormPeriodStart(convertToInputDate(order.periodStart));
    setFormPeriodEnd(convertToInputDate(order.periodEnd));
    setFormServices(order.services);
    setFormPaymentStatus(order.paymentStatus);
    setFormNotes(order.notes || '');
    setIsEditing(true);
    setIsCreateDialogOpen(true);
  };

  const handleViewOrder = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormClientId('');
    setFormPeriodStart('');
    setFormPeriodEnd('');
    setFormServices([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setFormPaymentStatus('pending');
    setFormNotes('');
    setSelectedOrder(null);
  };

  const convertToInputDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  };

  const convertToDisplayDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const calculateServiceTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: string | number) => {
    const updatedServices = [...formServices];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedServices[index].total = calculateServiceTotal(
        updatedServices[index].quantity,
        updatedServices[index].unitPrice
      );
    }
    
    setFormServices(updatedServices);
  };

  const handleAddService = () => {
    setFormServices([...formServices, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveService = (index: number) => {
    if (formServices.length > 1) {
      setFormServices(formServices.filter((_, i) => i !== index));
    }
  };

  const calculateTotalValue = () => {
    return formServices.reduce((sum, service) => sum + service.total, 0);
  };

  const handleSaveOrder = () => {
    if (!formClientId || !formPeriodStart || !formPeriodEnd) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (formServices.some(s => !s.description || s.quantity <= 0 || s.unitPrice <= 0)) {
      toast.error('Por favor, preencha todos os serviços corretamente.');
      return;
    }

    const selectedClient = clients.find(c => c.id === formClientId);
    if (!selectedClient) return;

    const totalValue = calculateTotalValue();

    if (isEditing && selectedOrder) {
      const updatedOrder: ServiceOrder = {
        ...selectedOrder,
        clientId: formClientId,
        clientName: selectedClient.name,
        clientArea: selectedClient.area,
        periodStart: convertToDisplayDate(formPeriodStart),
        periodEnd: convertToDisplayDate(formPeriodEnd),
        services: formServices,
        totalValue,
        paymentStatus: formPaymentStatus,
        notes: formNotes
      };

      setServiceOrders(serviceOrders.map(o => o.id === selectedOrder.id ? updatedOrder : o));
      toast.success('Ordem de serviço atualizada com sucesso!');
    } else {
      const newOrder: ServiceOrder = {
        id: `OS-2024-${String(serviceOrders.length + 1).padStart(3, '0')}`,
        clientId: formClientId,
        clientName: selectedClient.name,
        clientArea: selectedClient.area,
        periodStart: convertToDisplayDate(formPeriodStart),
        periodEnd: convertToDisplayDate(formPeriodEnd),
        services: formServices,
        totalValue,
        paymentStatus: formPaymentStatus,
        createdDate: new Date().toLocaleDateString('pt-BR'),
        createdBy: 'Admin Sistema',
        notes: formNotes
      };

      setServiceOrders([newOrder, ...serviceOrders]);
      toast.success('Ordem de serviço criada com sucesso! Disponível para o cliente.');
    }

    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Deseja realmente excluir esta ordem de serviço?')) {
      setServiceOrders(serviceOrders.filter(o => o.id !== orderId));
      toast.success('Ordem de serviço excluída com sucesso!');
      setIsViewDialogOpen(false);
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

  const getStatusConfig = (status: 'paid' | 'pending') => {
    return status === 'paid' 
      ? { label: 'Pago', color: '#16a34a', bg: 'rgba(34, 197, 94, 0.1)' }
      : { label: 'Pendente', color: '#f59e0b', bg: 'rgba(234, 179, 8, 0.1)' };
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <ScreenHeader 
        title="Ordens de Serviço" 
        onBack={onBack}
      />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Ordens</p>
                  <p className="text-2xl mt-1">{statusCounts.total}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                  <FileText style={{ color: '#6400A4' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pagas</p>
                  <p className="text-2xl mt-1">{statusCounts.paid}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <CheckCircle style={{ color: '#16a34a' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Receita Recebida</p>
                  <p className="text-2xl mt-1">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                  <DollarSign style={{ color: '#16a34a' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">A Receber</p>
                  <p className="text-2xl mt-1">R$ {pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)' }}>
                  <Clock style={{ color: '#f59e0b' }} className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as any)} className="w-full md:w-auto">
                <TabsList className="grid grid-cols-3 w-full md:w-[300px]">
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="paid">Pagas</TabsTrigger>
                  <TabsTrigger value="pending">Pendentes</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button 
                onClick={handleOpenCreate}
                style={{ backgroundColor: '#6400A4', color: '#fff' }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Ordem
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhuma ordem de serviço encontrada</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.paymentStatus);
              
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Left: Main Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm text-gray-600">ID: {order.id}</p>
                              <Badge 
                                style={{ 
                                  backgroundColor: statusConfig.bg,
                                  color: statusConfig.color
                                }}
                              >
                                {statusConfig.label}
                              </Badge>
                              <Badge 
                                style={{ 
                                  backgroundColor: `${getAreaColor(order.clientArea)}15`,
                                  color: getAreaColor(order.clientArea)
                                }}
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                {order.clientArea.toUpperCase()}
                              </Badge>
                            </div>
                            <h3 className="font-medium">{order.clientName}</h3>
                            <p className="text-sm text-gray-600">
                              Período: {order.periodStart} a {order.periodEnd}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>{order.services.length} serviço(s)</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>Criado em {order.createdDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" style={{ color: '#6400A4' }} />
                            <span className="font-medium" style={{ color: '#6400A4' }}>
                              R$ {order.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOrder(order)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(order)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar' : 'Nova'} Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Preencha as informações da ordem de serviço. Ela será disponibilizada automaticamente nos documentos do cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Client Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">
                  Cliente <span className="text-red-500">*</span>
                </Label>
                <Select value={formClientId} onValueChange={setFormClientId}>
                  <SelectTrigger id="client" className="mt-2">
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.area.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="payment-status">
                  Status de Pagamento <span className="text-red-500">*</span>
                </Label>
                <Select value={formPaymentStatus} onValueChange={(v: string) => setFormPaymentStatus(v as 'paid' | 'pending')}>
                  <SelectTrigger id="payment-status" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="period-start">
                  Início do Período <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="period-start"
                  type="date"
                  value={formPeriodStart}
                  onChange={(e) => setFormPeriodStart(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="period-end">
                  Fim do Período <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="period-end"
                  type="date"
                  value={formPeriodEnd}
                  onChange={(e) => setFormPeriodEnd(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Serviços Prestados <span className="text-red-500">*</span></Label>
                <Button size="sm" variant="outline" onClick={handleAddService}>
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Serviço
                </Button>
              </div>

              <div className="space-y-3">
                {formServices.map((service, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-3">
                            <Input
                              placeholder="Descrição do serviço"
                              value={service.description}
                              onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <Label className="text-xs">Quantidade</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={service.quantity}
                                  onChange={(e) => handleServiceChange(index, 'quantity', Number(e.target.value))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Valor Unitário (R$)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={service.unitPrice}
                                  onChange={(e) => handleServiceChange(index, 'unitPrice', Number(e.target.value))}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Total (R$)</Label>
                                <Input
                                  type="text"
                                  value={service.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  disabled
                                  className="mt-1 bg-gray-50"
                                />
                              </div>
                            </div>
                          </div>
                          {formServices.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveService(index)}
                              className="mt-7"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium" style={{ color: '#6400A4' }}>Valor Total:</span>
                  <span className="text-xl font-medium" style={{ color: '#6400A4' }}>
                    R$ {calculateTotalValue().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Adicione observações sobre a ordem de serviço (opcional)"
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveOrder}
              style={{ backgroundColor: '#6400A4', color: '#fff' }}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isEditing ? 'Atualizar' : 'Criar'} Ordem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Visualize todas as informações da ordem de serviço
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ordem de Serviço</p>
                    <h3 className="text-xl font-medium">{selectedOrder.id}</h3>
                  </div>
                  <Badge 
                    style={{ 
                      backgroundColor: getStatusConfig(selectedOrder.paymentStatus).bg,
                      color: getStatusConfig(selectedOrder.paymentStatus).color
                    }}
                  >
                    {getStatusConfig(selectedOrder.paymentStatus).label}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                  <div>
                    <p className="text-gray-600">Cliente</p>
                    <p className="font-medium">{selectedOrder.clientName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Área</p>
                    <Badge 
                      style={{ 
                        backgroundColor: `${getAreaColor(selectedOrder.clientArea)}15`,
                        color: getAreaColor(selectedOrder.clientArea)
                      }}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedOrder.clientArea.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-600">Período</p>
                    <p className="font-medium">{selectedOrder.periodStart} a {selectedOrder.periodEnd}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Criado em</p>
                    <p className="font-medium">{selectedOrder.createdDate}</p>
                  </div>
                </div>
              </div>

              {/* Services Table */}
              <div>
                <h4 className="font-medium mb-3">Serviços Prestados</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-gray-600">Descrição</th>
                        <th className="text-center p-3 text-sm font-medium text-gray-600">Qtd</th>
                        <th className="text-right p-3 text-sm font-medium text-gray-600">Valor Unit.</th>
                        <th className="text-right p-3 text-sm font-medium text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.services.map((service, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm">{service.description}</td>
                          <td className="p-3 text-sm text-center">{service.quantity}</td>
                          <td className="p-3 text-sm text-right">
                            R$ {service.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-sm text-right font-medium">
                            R$ {service.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t bg-purple-50">
                        <td colSpan={3} className="p-3 text-sm font-medium text-right" style={{ color: '#6400A4' }}>
                          Valor Total:
                        </td>
                        <td className="p-3 text-lg font-medium text-right" style={{ color: '#6400A4' }}>
                          R$ {selectedOrder.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Observações</p>
                  <p className="text-sm text-blue-800">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedOrder) handleOpenEdit(selectedOrder);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              style={{ borderColor: '#dc2626', color: '#dc2626' }}
              onClick={() => selectedOrder && handleDeleteOrder(selectedOrder.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
