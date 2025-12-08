import { useState, useEffect } from 'react';
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
  MapPin,
  Search,
  Loader2
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
import api from '../../lib/api';
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
  clientArea: string;
  periodStart: string;
  periodEnd: string;
  services: ServiceItem[];
  totalValue: number;
  paymentStatus: 'paid' | 'pending';
  createdDate: string;
  createdBy: string;
  notes?: string;
}

interface Company {
  id: string;
  name: string;
}

interface ServiceOrdersScreenProps {
  onBack?: () => void;
}

export default function ServiceOrdersScreen({ onBack }: ServiceOrdersScreenProps) {
  // Estados de UI
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'paid' | 'pending'>('all');

  // Estados de dados
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalRevenue: 0,
    pendingRevenue: 0
  });

  // Estados de loading
  const [loading, setLoading] = useState(true);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados do formulário
  const [formClientId, setFormClientId] = useState('');
  const [formPeriodStart, setFormPeriodStart] = useState('');
  const [formPeriodEnd, setFormPeriodEnd] = useState('');
  const [formServices, setFormServices] = useState<ServiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [formPaymentStatus, setFormPaymentStatus] = useState<'paid' | 'pending'>('pending');
  const [formNotes, setFormNotes] = useState('');

  // ============================================================================
  // FUNÇÕES DE API
  // ============================================================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      // Buscar ordens
      const ordersParams: any = {};
      if (searchTerm) ordersParams.search = searchTerm;
      if (activeTab !== 'all') ordersParams.status = activeTab;
      
      const ordersResponse = await api.get('/service-orders', { params: ordersParams });
      setOrders(ordersResponse.data.data || []);

      // Buscar estatísticas
      const statsResponse = await api.get('/service-orders/stats');
      setStats(statsResponse.data.data || {
        total: 0,
        paid: 0,
        pending: 0,
        totalRevenue: 0,
        pendingRevenue: 0
      });

    } catch (error: any) {
      console.error('Erro ao buscar ordens:', error);
      toast.error(error.response?.data?.message || 'Erro ao carregar ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await api.get('/documents/clients');
      
      const mappedCompanies = (response.data.data || []).map((company: any) => ({
        id: String(company.client_id),
        name: company.main_company_name || company.name
      }));
      
      setCompanies(mappedCompanies);
    } catch (error: any) {
      console.error('Erro ao buscar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const createOrder = async () => {
    try {
      setSaving(true);
      
      const data = {
        clientId: formClientId,
        periodStart: formPeriodStart,
        periodEnd: formPeriodEnd,
        services: formServices.map(s => ({
          description: s.description,
          quantity: s.quantity,
          unitPrice: s.unitPrice
        })),
        paymentStatus: formPaymentStatus,
        notes: formNotes
      };

      await api.post('/service-orders', data);
      toast.success('Ordem de serviço criada com sucesso!');
      
      setIsCreateDialogOpen(false);
      resetForm();
      fetchOrders();
    } catch (error: any) {
      console.error('Erro ao criar ordem:', error);
      toast.error(error.response?.data?.message || 'Erro ao criar ordem de serviço');
    } finally {
      setSaving(false);
    }
  };

  const updateOrder = async () => {
    if (!selectedOrder) return;

    try {
      setSaving(true);
      
      const data = {
        clientId: formClientId,
        periodStart: formPeriodStart,
        periodEnd: formPeriodEnd,
        services: formServices.map(s => ({
          description: s.description,
          quantity: s.quantity,
          unitPrice: s.unitPrice
        })),
        paymentStatus: formPaymentStatus,
        notes: formNotes
      };

      await api.put(`/service-orders/${selectedOrder.id}`, data);
      toast.success('Ordem de serviço atualizada com sucesso!');
      
      setIsCreateDialogOpen(false);
      resetForm();
      fetchOrders();
    } catch (error: any) {
      console.error('Erro ao atualizar ordem:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar ordem de serviço');
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Deseja realmente excluir esta ordem de serviço?')) return;

    try {
      await api.delete(`/service-orders/${orderId}`);
      toast.success('Ordem de serviço excluída com sucesso!');
      setIsViewDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      console.error('Erro ao excluir ordem:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir ordem de serviço');
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, activeTab]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ============================================================================
  // FUNÇÕES DE UI
  // ============================================================================

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
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
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
    // Validações
    if (!formClientId || !formPeriodStart || !formPeriodEnd) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (formServices.some(s => !s.description || s.quantity <= 0 || s.unitPrice <= 0)) {
      toast.error('Por favor, preencha todos os serviços corretamente.');
      return;
    }

    if (isEditing) {
      updateOrder();
    } else {
      createOrder();
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

  // ============================================================================
  // RENDER
  // ============================================================================

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
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-1" />
                  ) : (
                    <p className="text-2xl mt-1">{stats.total}</p>
                  )}
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
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-1" />
                  ) : (
                    <p className="text-2xl mt-1">{stats.paid}</p>
                  )}
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
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-1" />
                  ) : (
                    <p className="text-2xl mt-1">
                      R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
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
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin mt-1" />
                  ) : (
                    <p className="text-2xl mt-1">
                      R$ {stats.pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
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
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-gray-600">Carregando ordens...</span>
                </div>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhuma ordem de serviço encontrada</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => {
              const statusConfig = getStatusConfig(order.paymentStatus);
              
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
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
                              {order.clientArea && (
                                <Badge 
                                  style={{ 
                                    backgroundColor: `${getAreaColor(order.clientArea)}15`,
                                    color: getAreaColor(order.clientArea)
                                  }}
                                >
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {order.clientArea.toUpperCase()}
                                </Badge>
                              )}
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
              Preencha as informações da ordem de serviço.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">
                  Cliente <span className="text-red-500">*</span>
                </Label>
                <Select value={formClientId} onValueChange={setFormClientId}>
                  <SelectTrigger id="client" className="mt-2">
                    <SelectValue placeholder={loadingCompanies ? "Carregando..." : "Selecione o cliente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCompanies ? (
                      <SelectItem value="loading" disabled>Carregando...</SelectItem>
                    ) : companies.length === 0 ? (
                      <SelectItem value="empty" disabled>Nenhuma empresa encontrada</SelectItem>
                    ) : (
                      companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))
                    )}
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

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Adicione observações (opcional)"
                rows={3}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveOrder}
              style={{ backgroundColor: '#6400A4', color: '#fff' }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {isEditing ? 'Atualizar' : 'Criar'} Ordem
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
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
                    <p className="text-gray-600">Período</p>
                    <p className="font-medium">{selectedOrder.periodStart} a {selectedOrder.periodEnd}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Criado em</p>
                    <p className="font-medium">{selectedOrder.createdDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Criado por</p>
                    <p className="font-medium">{selectedOrder.createdBy}</p>
                  </div>
                </div>
              </div>

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
              onClick={() => selectedOrder && deleteOrder(selectedOrder.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}