import { useState } from 'react';
import { FileText, Download, Eye, Calendar, DollarSign, TrendingUp, TrendingDown, Filter, Search, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
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

interface ClientExpensesDashboardScreenProps {
  onBack?: () => void;
}

export default function ClientExpensesDashboardScreen({ onBack }: ClientExpensesDashboardScreenProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  const invoices: Invoice[] = [
    {
      id: '1',
      number: 'NF-2024-089',
      serviceType: 'Limpeza Hospitalar',
      serviceId: 'OS-2024-078',
      amount: 8500,
      issueDate: '15/10/2024',
      dueDate: '30/10/2024',
      status: 'paid',
      paymentDate: '28/10/2024'
    },
    {
      id: '2',
      number: 'NF-2024-076',
      serviceType: 'Limpeza Geral',
      serviceId: 'OS-2024-065',
      amount: 5200,
      issueDate: '20/09/2024',
      dueDate: '05/10/2024',
      status: 'paid',
      paymentDate: '03/10/2024'
    },
    {
      id: '3',
      number: 'NF-2024-063',
      serviceType: 'Limpeza de Vidros',
      serviceId: 'OS-2024-052',
      amount: 3800,
      issueDate: '15/09/2024',
      dueDate: '30/09/2024',
      status: 'paid',
      paymentDate: '29/09/2024'
    },
    {
      id: '4',
      number: 'NF-2024-091',
      serviceType: 'Jardinagem',
      serviceId: 'OS-2024-082',
      amount: 4500,
      issueDate: '01/10/2024',
      dueDate: '16/10/2024',
      status: 'pending'
    },
    {
      id: '5',
      number: 'NF-2024-050',
      serviceType: 'Limpeza Pós-Obra',
      serviceId: 'OS-2024-038',
      amount: 12000,
      issueDate: '05/09/2024',
      dueDate: '20/09/2024',
      status: 'paid',
      paymentDate: '18/09/2024'
    },
    {
      id: '6',
      number: 'NF-2024-042',
      serviceType: 'Manutenção Elétrica',
      serviceId: 'OS-2024-030',
      amount: 6700,
      issueDate: '28/08/2024',
      dueDate: '12/09/2024',
      status: 'paid',
      paymentDate: '10/09/2024'
    },
    {
      id: '7',
      number: 'NF-2024-035',
      serviceType: 'Limpeza Geral',
      serviceId: 'OS-2024-022',
      amount: 5400,
      issueDate: '15/08/2024',
      dueDate: '30/08/2024',
      status: 'paid',
      paymentDate: '29/08/2024'
    }
  ];

  const getStatusConfig = (status: 'paid' | 'pending' | 'overdue') => {
    const configs = {
      paid: { label: 'Pago', color: 'bg-green-100 text-green-800' },
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      overdue: { label: 'Vencido', color: 'bg-red-100 text-red-800' }
    };
    return configs[status];
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsOpen(true);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesSearch = inv.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.serviceId.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de período
    let matchesPeriod = true;
    if (periodFilter !== 'all') {
      const invoiceMonth = parseInt(inv.issueDate.split('/')[1]);
      const currentMonth = 10; // Outubro 2024
      
      if (periodFilter === 'current') {
        matchesPeriod = invoiceMonth === currentMonth;
      } else if (periodFilter === 'last3') {
        matchesPeriod = invoiceMonth >= currentMonth - 2 && invoiceMonth <= currentMonth;
      } else if (periodFilter === 'last6') {
        matchesPeriod = invoiceMonth >= currentMonth - 5 && invoiceMonth <= currentMonth;
      }
    }
    
    return matchesStatus && matchesSearch && matchesPeriod;
  });

  // Cálculos de totais
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);
  const averageAmount = totalAmount / invoices.length;

  // Dados para o gráfico de gastos mensais
  const monthlyData = [
    { month: 'Ago', value: 11800 },
    { month: 'Set', value: 21000 },
    { month: 'Out', value: 17000 }
  ];

  // Dados para o gráfico de linha de tendência
  const trendData = [
    { month: 'Jun', value: 9500 },
    { month: 'Jul', value: 10200 },
    { month: 'Ago', value: 11800 },
    { month: 'Set', value: 21000 },
    { month: 'Out', value: 17000 }
  ];

  return (
    <div className="p-6 overflow-hidden">
      <ScreenHeader 
        title="Dashboard de Gastos"
        description="Acompanhe todas as notas fiscais emitidas e tenha controle total dos seus gastos."
        onBack={() => onBack?.()}
      />

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              R$ {totalPaid.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.filter(i => i.status === 'paid').length} notas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">
              R$ {totalPending.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.filter(i => i.status === 'pending').length} notas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gasto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl" style={{ color: '#6400A4' }}>
              R$ {totalAmount.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {invoices.length} notas emitidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Ticket Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl" style={{ color: '#8B20EE' }}>
              R$ {Math.round(averageAmount).toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Média por serviço
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico de Barras - Gastos Mensais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Gastos Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="value" fill="#6400A4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Linha - Tendência */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" style={{ color: '#8B20EE' }} />
              Tendência de Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => `R$ ${value.toLocaleString('pt-BR')}`}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B20EE" 
                  strokeWidth={3}
                  dot={{ fill: '#8B20EE', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número, serviço ou OS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="overdue">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo período</SelectItem>
                  <SelectItem value="current">Mês atual</SelectItem>
                  <SelectItem value="last3">Últimos 3 meses</SelectItem>
                  <SelectItem value="last6">Últimos 6 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Notas Fiscais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
            Histórico de Notas Fiscais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número NF</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Ordem de Serviço</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const statusConfig = getStatusConfig(invoice.status);
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{invoice.serviceType}</TableCell>
                    <TableCell className="text-gray-600">{invoice.serviceId}</TableCell>
                    <TableCell>
                      <span className="font-medium" style={{ color: '#6400A4' }}>
                        R$ {invoice.amount.toLocaleString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell>{invoice.issueDate}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        {invoice.dueDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig.color} border-none`}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button
                          size="sm"
                          style={{ backgroundColor: '#FFFF20', color: '#000' }}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes da Nota Fiscal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              Detalhes da Nota Fiscal
            </DialogTitle>
            <DialogDescription>
              {selectedInvoice?.number}
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Número:</span>
                  <span className="font-medium">{selectedInvoice.number}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Serviço:</span>
                  <span className="font-medium">{selectedInvoice.serviceType}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Ordem de Serviço:</span>
                  <span className="font-medium">{selectedInvoice.serviceId}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Valor:</span>
                  <span className="text-lg" style={{ color: '#6400A4', fontWeight: 'bold' }}>
                    R$ {selectedInvoice.amount.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Emissão:</span>
                  <span className="font-medium">{selectedInvoice.issueDate}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Vencimento:</span>
                  <span className="font-medium">{selectedInvoice.dueDate}</span>
                </div>
                {selectedInvoice.paymentDate && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm text-gray-600">Data Pagamento:</span>
                    <span className="font-medium text-green-600">{selectedInvoice.paymentDate}</span>
                  </div>
                )}
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge className={`${getStatusConfig(selectedInvoice.status).color} border-none`}>
                    {getStatusConfig(selectedInvoice.status).label}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  style={{ backgroundColor: '#FFFF20', color: '#000' }}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
