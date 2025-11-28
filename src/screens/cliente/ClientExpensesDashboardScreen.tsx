import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar, DollarSign, TrendingUp, Filter, Search, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import ScreenHeader from '../../components/ScreenHeader';
import api from '../../lib/api'; // ✅ USANDO API.TS COM JWT
import { toast } from 'sonner';

// =============================
// 🔧 INTEGRAÇÃO COM BACKEND
// =============================
// ✅ Todas as requisições usam api.ts com JWT automático
// ✅ URLs corrigidas para /client-portal
// ✅ Download seguro de PDFs
// ✅ Fallback automático se backend offline
// =============================

interface Invoice {
  id: string;
  number: string;
  serviceType: string;
  serviceId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
}

export default function ClientExpensesDashboardScreen({ onBack }: { onBack?: () => void }) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // =============================
  // ✅ ESTADOS PARA DADOS DO BACKEND
  // =============================
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [monthlyData, setMonthlyData] = useState([
    { month: 'Ago', value: 11800 },
    { month: 'Set', value: 21000 },
    { month: 'Out', value: 17000 },
  ]);
  const [trendData, setTrendData] = useState([
    { month: 'Jun', value: 9500 },
    { month: 'Jul', value: 10200 },
    { month: 'Ago', value: 11800 },
    { month: 'Set', value: 21000 },
    { month: 'Out', value: 17000 },
  ]);

  // ✅ Dados locais estáticos (fallback)
  const FALLBACK_INVOICES: Invoice[] = [
    { id: '1', number: 'NF-2024-089', serviceType: 'Limpeza Hospitalar', serviceId: 'OS-2024-078', amount: 8500, issueDate: '15/10/2024', dueDate: '30/10/2024', status: 'paid', paymentDate: '28/10/2024' },
    { id: '2', number: 'NF-2024-076', serviceType: 'Limpeza Geral', serviceId: 'OS-2024-065', amount: 5200, issueDate: '20/09/2024', dueDate: '05/10/2024', status: 'paid', paymentDate: '03/10/2024' },
    { id: '3', number: 'NF-2024-063', serviceType: 'Limpeza de Vidros', serviceId: 'OS-2024-052', amount: 3800, issueDate: '15/09/2024', dueDate: '30/09/2024', status: 'paid', paymentDate: '29/09/2024' },
    { id: '4', number: 'NF-2024-091', serviceType: 'Jardinagem', serviceId: 'OS-2024-082', amount: 4500, issueDate: '01/10/2024', dueDate: '16/10/2024', status: 'pending' },
    { id: '5', number: 'NF-2024-050', serviceType: 'Limpeza Pós-Obra', serviceId: 'OS-2024-038', amount: 12000, issueDate: '05/09/2024', dueDate: '20/09/2024', status: 'paid', paymentDate: '18/09/2024' },
    { id: '6', number: 'NF-2024-042', serviceType: 'Manutenção Elétrica', serviceId: 'OS-2024-030', amount: 6700, issueDate: '28/08/2024', dueDate: '12/09/2024', status: 'paid', paymentDate: '10/09/2024' },
    { id: '7', number: 'NF-2024-035', serviceType: 'Limpeza Geral', serviceId: 'OS-2024-022', amount: 5400, issueDate: '15/08/2024', dueDate: '30/08/2024', status: 'paid', paymentDate: '29/08/2024' },
  ];

  // ==========================
  // ✅ BUSCAR DADOS DO BACKEND
  // ==========================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Buscando dados financeiros do backend...');

        // ✅ CORRETO: Usando api.ts com JWT automático
        const [invoicesRes, summaryRes, trendsRes] = await Promise.allSettled([
          api.get('/client-portal/invoices'),
          api.get('/client-portal/expenses/summary'),
          api.get('/client-portal/expenses/trends')
        ]);

        // Processa faturas
        if (invoicesRes.status === 'fulfilled' && Array.isArray(invoicesRes.value.data) && invoicesRes.value.data.length > 0) {
          setInvoices(invoicesRes.value.data);
          console.log(' Faturas carregadas do backend:', invoicesRes.value.data.length);
        } else {
          setInvoices(FALLBACK_INVOICES);
          console.log('ℹ Usando faturas de fallback');
        }

        // Processa resumo financeiro
        if (summaryRes.status === 'fulfilled' && summaryRes.value.data) {
          console.log(' Resumo financeiro carregado');
          // Dados já estão sendo calculados localmente
        }

        // Processa tendências/gráficos
        if (trendsRes.status === 'fulfilled' && trendsRes.value.data) {
          if (trendsRes.value.data.monthlyData) {
            setMonthlyData(trendsRes.value.data.monthlyData);
          }
          if (trendsRes.value.data.trendData) {
            setTrendData(trendsRes.value.data.trendData);
          }
          console.log(' Gráficos carregados do backend');
        } else {
          console.log('ℹ Usando gráficos de fallback');
        }

      } catch (error: any) {
        console.error(' Erro ao buscar dados financeiros:', error);
        
        // Verifica tipo de erro
        if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
          toast.info('Backend offline - usando dados de exemplo', {
            description: 'Os dados mostrados são apenas para demonstração'
          });
        } else if (error.response?.status === 401) {
          console.log(' Token inválido ou expirado');
        } else {
          toast.error('Erro ao carregar dados financeiros', {
            description: 'Usando dados de exemplo'
          });
        }
        
        // Usa fallback em caso de erro
        setInvoices(FALLBACK_INVOICES);
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ==========================
  // ✅ DOWNLOAD SEGURO DE PDF
  // ==========================
  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      console.log(' Baixando PDF da fatura:', invoiceId);

      // ✅ CORRETO: Download seguro com JWT
      const response = await api.get(`/client-portal/invoices/${invoiceId}/pdf`, {
        responseType: 'blob' // Importante para receber arquivo binário
      });

      // Cria URL temporária para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `fatura-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF baixado com sucesso!');

    } catch (error: any) {
      console.error(' Erro ao baixar PDF:', error);
      
      if (error.response?.status === 404) {
        toast.error('PDF não encontrado');
      } else if (error.response?.status === 401) {
        toast.error('Sessão expirada', {
          description: 'Faça login novamente'
        });
      } else {
        toast.error('Erro ao baixar PDF');
      }
    }
  };

  // ==========================
  // 🔹 Filtros e manipulação
  // ==========================
  const getStatusConfig = (status: 'paid' | 'pending' | 'overdue') => {
    const configs = {
      paid: { label: 'Pago', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
    };
    return configs[status];
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch = inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.serviceId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // ==========================
  // 🔹 Cálculos automáticos
  // ==========================
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);
  const averageAmount = totalAmount / (invoices.length || 1);

  // ==========================
  // 🔹 Loading State
  // ==========================
  if (loading) {
    return (
      <div className="p-6">
        <ScreenHeader 
          title="Dashboard de Gastos"
          description="Carregando..."
          onBack={() => onBack?.()}
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#6400A4' }}></div>
        </div>
      </div>
    );
  }

  // ==========================
  // 🔹 Renderização principal
  // ==========================
  return (
    <div className="p-6 overflow-hidden">
      <ScreenHeader 
        title="Dashboard de Gastos"
        description="Acompanhe todas as notas fiscais emitidas e tenha controle total dos seus gastos."
        onBack={() => onBack?.()}
      />

      {/* === Cards de resumo financeiro === */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4"/>
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4"/>
              Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">
              R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4"/>
              Gasto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-[#6400A4]">
              R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4"/>
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-[#8B20EE]">
              R$ {Math.round(averageAmount).toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* === Gráficos === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Barras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#6400A4]" />
              Gastos Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`} />
                <Bar dataKey="value" fill="#6400A4" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Linha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#8B20EE]" />
              Tendência de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B20EE" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#8B20EE' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* === Tabela de Notas Fiscais === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#6400A4]" />
            Histórico de Notas Fiscais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número NF</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    Nenhuma fatura encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map(inv => {
                  const status = getStatusConfig(inv.status);
                  return (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.number}</TableCell>
                      <TableCell>{inv.serviceType}</TableCell>
                      <TableCell>{inv.serviceId}</TableCell>
                      <TableCell className="text-[#6400A4] font-medium">
                        R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{inv.issueDate}</TableCell>
                      <TableCell>{inv.dueDate}</TableCell>
                      <TableCell>
                        <Badge className={`${status.color} border-none`}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button 
                            size="sm" 
                            style={{ backgroundColor: '#FFFF20', color: '#000' }}
                            onClick={() => handleDownloadPDF(inv.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* === Dialog Detalhes da Nota Fiscal === */}
      {selectedInvoice && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle style={{ color: '#6400A4' }}>
                Detalhes da Nota Fiscal
              </DialogTitle>
              <DialogDescription>
                {selectedInvoice.number}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Serviço:</span>
                  <span className="font-medium">{selectedInvoice.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ordem de Serviço:</span>
                  <span className="font-medium">{selectedInvoice.serviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valor:</span>
                  <span className="font-medium text-[#6400A4]">
                    R$ {selectedInvoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Emissão:</span>
                  <span>{selectedInvoice.issueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vencimento:</span>
                  <span>{selectedInvoice.dueDate}</span>
                </div>
                {selectedInvoice.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pagamento:</span>
                    <span className="text-green-600">{selectedInvoice.paymentDate}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={`border-none ${
                    selectedInvoice.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : selectedInvoice.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedInvoice.status === 'paid'
                      ? 'Pago'
                      : selectedInvoice.status === 'pending'
                      ? 'Pendente'
                      : 'Vencido'}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  style={{ backgroundColor: '#FFFF20', color: '#000' }}
                  onClick={() => handleDownloadPDF(selectedInvoice.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar PDF
                </Button>
                <Button
                  className="flex-1"
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}