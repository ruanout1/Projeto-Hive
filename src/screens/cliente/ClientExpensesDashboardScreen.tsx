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
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [backendSummary, setBackendSummary] = useState<any | null>(null);

  // ✅ Estados corretos para os gráficos
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
  const staticInvoices: Invoice[] = [
    { id: '1', number: 'NF-2024-089', serviceType: 'Limpeza Hospitalar', serviceId: 'OS-2024-078', amount: 8500, issueDate: '15/10/2024', dueDate: '30/10/2024', status: 'paid', paymentDate: '28/10/2024' },
    { id: '2', number: 'NF-2024-076', serviceType: 'Limpeza Geral', serviceId: 'OS-2024-065', amount: 5200, issueDate: '20/09/2024', dueDate: '05/10/2024', status: 'paid', paymentDate: '03/10/2024' },
    { id: '3', number: 'NF-2024-063', serviceType: 'Limpeza de Vidros', serviceId: 'OS-2024-052', amount: 3800, issueDate: '15/09/2024', dueDate: '30/09/2024', status: 'paid', paymentDate: '29/09/2024' },
    { id: '4', number: 'NF-2024-091', serviceType: 'Jardinagem', serviceId: 'OS-2024-082', amount: 4500, issueDate: '01/10/2024', dueDate: '16/10/2024', status: 'pending' },
    { id: '5', number: 'NF-2024-050', serviceType: 'Limpeza Pós-Obra', serviceId: 'OS-2024-038', amount: 12000, issueDate: '05/09/2024', dueDate: '20/09/2024', status: 'paid', paymentDate: '18/09/2024' },
    { id: '6', number: 'NF-2024-042', serviceType: 'Manutenção Elétrica', serviceId: 'OS-2024-030', amount: 6700, issueDate: '28/08/2024', dueDate: '12/09/2024', status: 'paid', paymentDate: '10/09/2024' },
    { id: '7', number: 'NF-2024-035', serviceType: 'Limpeza Geral', serviceId: 'OS-2024-022', amount: 5400, issueDate: '15/08/2024', dueDate: '30/08/2024', status: 'paid', paymentDate: '29/08/2024' },
  ];

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
  // 🔹 useEffect: Híbrido (backend + fallback)
  // ==========================
  useEffect(() => {
    setInvoices(staticInvoices);

    const fetchData = async () => {
      try {
        const [summaryRes, trendsRes] = await Promise.all([
          fetch('http://localhost:5000/api/clientes/summary'),
          fetch('http://localhost:5000/api/clientes/trends'),
        ]);

        if (!summaryRes.ok || !trendsRes.ok)
          throw new Error('Erro em uma das rotas do backend');

        const [summary, trends] = await Promise.all([
          summaryRes.json(),
          trendsRes.json(),
        ]);

        if (summary) setBackendSummary(summary);
        if (trends) {
          setMonthlyData(trends.monthlyData);
          setTrendData(trends.trendData);
        }
      } catch (error) {
        console.warn('⚠️ Backend não respondeu, mantendo dados locais.');
      }
    };

    fetchData();
  }, []);

  // ==========================
  // 🔹 Cálculos automáticos
  // ==========================
  const totalPaid = backendSummary?.totalPaid ?? invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = backendSummary?.totalPending ?? invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalAmount = backendSummary?.totalAmount ?? invoices.reduce((sum, i) => sum + i.amount, 0);
  const averageAmount = backendSummary?.averageAmount ?? totalAmount / invoices.length;

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
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm text-gray-600"><DollarSign className="h-4 w-4"/>Total Pago</CardTitle></CardHeader><CardContent><div className="text-2xl text-green-600">R$ {totalPaid.toLocaleString('pt-BR')}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm text-gray-600"><Clock className="h-4 w-4"/>Pendente</CardTitle></CardHeader><CardContent><div className="text-2xl text-yellow-600">R$ {totalPending.toLocaleString('pt-BR')}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm text-gray-600"><TrendingUp className="h-4 w-4"/>Gasto Total</CardTitle></CardHeader><CardContent><div className="text-2xl text-[#6400A4]">R$ {totalAmount.toLocaleString('pt-BR')}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm text-gray-600"><FileText className="h-4 w-4"/>Ticket Médio</CardTitle></CardHeader><CardContent><div className="text-2xl text-[#8B20EE]">R$ {Math.round(averageAmount).toLocaleString('pt-BR')}</div></CardContent></Card>
      </div>

      {/* === Gráficos === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Barras */}
        <Card>
          <CardHeader><CardTitle className="flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-[#6400A4]" />Gastos Mensais</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" /><YAxis />
                <Tooltip formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`} />
                <Bar dataKey="value" fill="#6400A4" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Linha */}
        <Card>
          <CardHeader><CardTitle className="flex items-center"><TrendingUp className="h-5 w-5 mr-2 text-[#8B20EE]" />Tendência de Gastos</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" /><YAxis />
                <Tooltip formatter={(v: any) => `R$ ${v.toLocaleString('pt-BR')}`} />
                <Line type="monotone" dataKey="value" stroke="#8B20EE" strokeWidth={3} dot={{ r: 5, fill: '#8B20EE' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* === Tabela de Notas Fiscais === */}
      <Card>
        <CardHeader><CardTitle className="flex items-center"><FileText className="h-5 w-5 mr-2 text-[#6400A4]" />Histórico de Notas Fiscais</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número NF</TableHead><TableHead>Serviço</TableHead><TableHead>OS</TableHead><TableHead>Valor</TableHead><TableHead>Emissão</TableHead><TableHead>Vencimento</TableHead><TableHead>Status</TableHead><TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map(inv => {
                const status = getStatusConfig(inv.status);
                return (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.number}</TableCell>
                    <TableCell>{inv.serviceType}</TableCell>
                    <TableCell>{inv.serviceId}</TableCell>
                    <TableCell className="text-[#6400A4] font-medium">R$ {inv.amount.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{inv.issueDate}</TableCell>
                    <TableCell>{inv.dueDate}</TableCell>
                    <TableCell><Badge className={`${status.color} border-none`}>{status.label}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => {
                          setSelectedInvoice(inv);
                          setIsDetailsOpen(true);
                        }}
                        ><Eye className="h-3 w-3 mr-1" />Ver</Button>
                        <Button size="sm" style={{ backgroundColor: '#FFFF20', color: '#000' }} onClick={() => window.open(`http://localhost:5000/api/clientes/invoice/${inv.id}/pdf`, '_blank')}><Download className="h-3 w-3 mr-1" />PDF</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
              R$ {selectedInvoice.amount.toLocaleString('pt-BR')}
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
            onClick={() => window.open(`http://localhost:5000/api/clientes/invoice/${selectedInvoice.id}/pdf`, '_blank')}
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
