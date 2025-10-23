import { useState } from 'react';
import ScreenHeader from '../../components/ScreenHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  Calendar, 
  Users, 
  MapPin, 
  Filter, 
  TrendingUp,
  CheckCircle,
  XCircle,
  MessageSquare,
  Download,
  Eye,
  BarChart3,
  Clock,
  Star,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  Plus,
  Search
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';

interface Report {
  id: string;
  manager: string;
  team: string;
  region: string;
  period: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  metrics: {
    servicesCompleted: number;
    onTimeRate: number;
    reworkRate: number;
    incidents: number;
    punctuality: number;
    satisfaction: number;
    absences: number;
    canceledServices: number;
    avgTime: number;
  };
  observations: string;
  attachments: number;
}

interface TimeRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  team: string;
  manager: string;
  date: string;
  checkInTime: string;
  checkInLocation: { lat: number; lng: number; address: string };
  checkOutTime?: string;
  checkOutLocation?: { lat: number; lng: number; address: string };
  totalHours?: string;
  status: 'present' | 'late' | 'absent' | 'on-duty' | 'not-registered';
  notes?: string;
}

interface AdminPerformanceReportsScreenProps {
  onBack?: () => void;
}

export default function AdminPerformanceReportsScreen({ onBack }: AdminPerformanceReportsScreenProps) {
  const [activeTab, setActiveTab] = useState<'performance' | 'timeclock'>('performance');
  const [filters, setFilters] = useState({
    period: 'all',
    manager: 'all',
    team: 'all',
    status: 'all'
  });

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  
  // Request Report Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<'performance' | 'timeclock'>('performance');
  const [selectedManager, setSelectedManager] = useState('');
  const [requestStartDate, setRequestStartDate] = useState('');
  const [requestEndDate, setRequestEndDate] = useState('');
  const [requestCollaborator, setRequestCollaborator] = useState('all');
  const [requestTeam, setRequestTeam] = useState('all');
  const [requestNotes, setRequestNotes] = useState('');
  
  // Time Clock filters
  const [searchTerm, setSearchTerm] = useState('');
  const [timeClockDateFilter, setTimeClockDateFilter] = useState('today');

  // Mock data - relatórios de exemplo
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      manager: 'Carlos Silva',
      team: 'Equipe Alpha',
      region: 'Norte',
      period: 'Setembro 2025',
      date: '2025-10-01',
      status: 'pending',
      metrics: {
        servicesCompleted: 45,
        onTimeRate: 92,
        reworkRate: 5,
        incidents: 2,
        punctuality: 88,
        satisfaction: 4.5,
        absences: 3,
        canceledServices: 1,
        avgTime: 3.5
      },
      observations: 'Excelente desempenho geral. Equipe manteve alta pontualidade apesar de alguns desafios climáticos.',
      attachments: 5
    },
    {
      id: '2',
      manager: 'Ana Costa',
      team: 'Equipe Beta',
      region: 'Sul',
      period: 'Setembro 2025',
      date: '2025-10-02',
      status: 'approved',
      metrics: {
        servicesCompleted: 38,
        onTimeRate: 95,
        reworkRate: 3,
        incidents: 1,
        punctuality: 94,
        satisfaction: 4.7,
        absences: 1,
        canceledServices: 0,
        avgTime: 3.2
      },
      observations: 'Mês excepcional. Todos os indicadores acima da meta. Cliente Shopping Sul destacou qualidade do atendimento.',
      attachments: 8
    },
    {
      id: '3',
      manager: 'Ricardo Mendes',
      team: 'Equipe Gamma',
      region: 'Leste',
      period: 'Setembro 2025',
      date: '2025-09-30',
      status: 'rejected',
      metrics: {
        servicesCompleted: 32,
        onTimeRate: 78,
        reworkRate: 12,
        incidents: 5,
        punctuality: 75,
        satisfaction: 3.8,
        absences: 6,
        canceledServices: 3,
        avgTime: 4.5
      },
      observations: 'Período desafiador com várias ausências por motivos de saúde. Necessário reforço na equipe.',
      attachments: 3
    }
  ]);

  // Mock time clock records
  const mockTimeRecords: TimeRecord[] = [
    {
      id: '1',
      employeeName: 'Carlos Mendes',
      employeeId: 'COL-001',
      team: 'Equipe Alpha',
      manager: 'Ana Paula Rodrigues',
      date: '21/10/2025',
      checkInTime: '08:00',
      checkInLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
      checkOutTime: '17:00',
      checkOutLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
      totalHours: '9h 00m',
      status: 'present'
    },
    {
      id: '2',
      employeeName: 'Marina Oliveira',
      employeeId: 'COL-002',
      team: 'Equipe Alpha',
      manager: 'Ana Paula Rodrigues',
      date: '21/10/2025',
      checkInTime: '08:25',
      checkInLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
      totalHours: '-',
      status: 'late',
      notes: 'Atraso de 25 minutos'
    },
    {
      id: '3',
      employeeName: 'Roberto Silva',
      employeeId: 'COL-003',
      team: 'Equipe Beta',
      manager: 'Fernanda Lima',
      date: '21/10/2025',
      checkInTime: '08:05',
      checkInLocation: { lat: -23.5629, lng: -46.6544, address: 'Av. Paulista, São Paulo - SP' },
      totalHours: '-',
      status: 'on-duty'
    },
    {
      id: '4',
      employeeName: 'Juliana Santos',
      employeeId: 'COL-004',
      team: 'Equipe Gamma',
      manager: 'Pedro Costa',
      date: '21/10/2025',
      checkInTime: '-',
      checkInLocation: { lat: 0, lng: 0, address: '-' },
      totalHours: '-',
      status: 'absent',
      notes: 'Sem registro até o momento'
    }
  ];

  const handleApprove = (reportId: string) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, status: 'approved' as const } : r
    ));
    toast.success('Relatório aprovado com sucesso!');
  };

  const handleReject = (reportId: string) => {
    setReports(prev => prev.map(r => 
      r.id === reportId ? { ...r, status: 'rejected' as const } : r
    ));
    toast.error('Relatório rejeitado');
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      toast.error('Digite uma mensagem de feedback');
      return;
    }
    toast.success('Feedback enviado ao gestor!');
    setFeedbackText('');
  };

  const handleRequestReport = () => {
    if (!selectedManager) {
      toast.error('Selecione um gestor');
      return;
    }
    if (!requestStartDate || !requestEndDate) {
      toast.error('Informe o período desejado');
      return;
    }
    
    const reportTypeName = requestType === 'performance' ? 'desempenho' : 'ponto';
    const targetInfo = requestType === 'timeclock' 
      ? (requestCollaborator !== 'all' ? ` para ${requestCollaborator}` : ` para equipe ${requestTeam}`)
      : '';
    
    toast.success(`Solicitação de relatório de ${reportTypeName} enviada!`, {
      description: `Gestor: ${selectedManager}${targetInfo} | Período: ${new Date(requestStartDate).toLocaleDateString('pt-BR')} - ${new Date(requestEndDate).toLocaleDateString('pt-BR')}`
    });
    
    // Reset form
    setIsRequestModalOpen(false);
    setSelectedManager('');
    setRequestStartDate('');
    setRequestEndDate('');
    setRequestCollaborator('all');
    setRequestTeam('all');
    setRequestNotes('');
  };

  const getStatusBadge = (status: Report['status'] | TimeRecord['status']) => {
    const statusConfig = {
      'pending': { label: 'Pendente', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
      'approved': { label: 'Aprovado', className: 'border-green-500 text-green-700 bg-green-50' },
      'rejected': { label: 'Rejeitado', className: 'border-red-500 text-red-700 bg-red-50' },
      'present': { label: 'Presente', className: 'border-green-500 text-green-700 bg-green-50' },
      'late': { label: 'Atraso', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
      'absent': { label: 'Falta', className: 'border-red-500 text-red-700 bg-red-50' },
      'on-duty': { label: 'Em Serviço', className: 'border-blue-500 text-blue-700 bg-blue-50' },
      'not-registered': { label: 'Não Registrado', className: 'border-gray-500 text-gray-700 bg-gray-50' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  // Filtrar relatórios
  const filteredReports = reports.filter(report => {
    if (filters.period && filters.period !== 'all' && report.period !== filters.period) return false;
    if (filters.manager && filters.manager !== 'all' && report.manager !== filters.manager) return false;
    if (filters.team && filters.team !== 'all' && report.team !== filters.team) return false;
    if (filters.status && filters.status !== 'all' && report.status !== filters.status) return false;
    return true;
  });

  // Filter time records
  const filteredTimeRecords = mockTimeRecords.filter(record => {
    if (searchTerm && !record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) 
        && !record.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Dados para gráficos comparativos
  const performanceChartData = filteredReports.map(report => ({
    name: report.team,
    'Serviços': report.metrics.servicesCompleted,
    'No Prazo (%)': report.metrics.onTimeRate,
    'Satisfação': report.metrics.satisfaction * 20 // Escala 0-100
  }));

  const timelineData = [
    { month: 'Jun', servicos: 120, satisfacao: 4.3 },
    { month: 'Jul', servicos: 135, satisfacao: 4.5 },
    { month: 'Ago', servicos: 128, satisfacao: 4.4 },
    { month: 'Set', servicos: 115, satisfacao: 4.3 }
  ];

  const radarData = selectedReport ? [
    { subject: 'Pontualidade', value: selectedReport.metrics.punctuality },
    { subject: 'Qualidade', value: 100 - selectedReport.metrics.reworkRate },
    { subject: 'Satisfação', value: selectedReport.metrics.satisfaction * 20 },
    { subject: 'Prazo', value: selectedReport.metrics.onTimeRate },
    { subject: 'Produtividade', value: Math.min(100, (selectedReport.metrics.servicesCompleted / 50) * 100) }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <ScreenHeader 
                title="Relatórios Administrativos"
                description="Analise relatórios de desempenho e controle de ponto"
                onBack={() => onBack?.()}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsRequestModalOpen(true)}
                className="gap-2 text-white"
                style={{ backgroundColor: '#6400A4' }}
              >
                <Plus className="h-4 w-4" />
                Solicitar Relatório
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Tabs Toggle */}
          <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'performance' | 'timeclock')}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="performance" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Relatórios de Desempenho
              </TabsTrigger>
              <TabsTrigger value="timeclock" className="gap-2">
                <Clock className="h-4 w-4" />
                Relatórios de Ponto
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Performance Reports Tab */}
        {activeTab === 'performance' && (
          <>
            {/* Filtros */}
            <Card className="mb-6">
              <CardHeader style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" style={{ color: '#6400A4' }} />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="filter-period">Período</Label>
                    <Select value={filters.period} onValueChange={(value: string) => setFilters(prev => ({ ...prev, period: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os períodos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Setembro 2025">Setembro 2025</SelectItem>
                        <SelectItem value="Agosto 2025">Agosto 2025</SelectItem>
                        <SelectItem value="Julho 2025">Julho 2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter-manager">Gestor</Label>
                    <Select value={filters.manager} onValueChange={(value: string) => setFilters(prev => ({ ...prev, manager: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os gestores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="Carlos Silva">Carlos Silva</SelectItem>
                        <SelectItem value="Ana Costa">Ana Costa</SelectItem>
                        <SelectItem value="Ricardo Mendes">Ricardo Mendes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter-team">Equipe</Label>
                    <Select value={filters.team} onValueChange={(value: string) => setFilters(prev => ({ ...prev, team: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as equipes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="Equipe Alpha">Equipe Alpha</SelectItem>
                        <SelectItem value="Equipe Beta">Equipe Beta</SelectItem>
                        <SelectItem value="Equipe Gamma">Equipe Gamma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filter-status">Status</Label>
                    <Select value={filters.status} onValueChange={(value: string) => setFilters(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="approved">Aprovado</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards de métricas consolidadas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Relatórios</p>
                      <p className="text-black text-2xl">{filteredReports.length}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                      <FileText className="h-6 w-6" style={{ color: '#6400A4' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pendentes</p>
                      <p className="text-black text-2xl">
                        {filteredReports.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-100">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Satisfação Média</p>
                      <p className="text-black text-2xl">
                        {filteredReports.length > 0 
                          ? (filteredReports.reduce((sum, r) => sum + r.metrics.satisfaction, 0) / filteredReports.length).toFixed(1)
                          : '0.0'
                        }
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 32, 0.2)' }}>
                      <Star className="h-6 w-6" style={{ color: '#6400A4' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Serviços</p>
                      <p className="text-black text-2xl">
                        {filteredReports.reduce((sum, r) => sum + r.metrics.servicesCompleted, 0)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                      <TrendingUp className="h-6 w-6" style={{ color: '#35BAE6' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico de Desempenho Comparativo */}
              <Card>
                <CardHeader style={{ backgroundColor: 'rgba(139, 32, 238, 0.05)' }}>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" style={{ color: '#8B20EE' }} />
                    Desempenho por Equipe
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Serviços" fill="#6400A4" />
                      <Bar dataKey="No Prazo (%)" fill="#8B20EE" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Histórico Temporal */}
              <Card>
                <CardHeader style={{ backgroundColor: 'rgba(53, 186, 230, 0.05)' }}>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" style={{ color: '#35BAE6' }} />
                    Histórico Trimestral
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="servicos" stroke="#6400A4" strokeWidth={2} name="Serviços" />
                      <Line yAxisId="right" type="monotone" dataKey="satisfacao" stroke="#35BAE6" strokeWidth={2} name="Satisfação" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Relatórios */}
            <Card>
              <CardHeader style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" style={{ color: '#6400A4' }} />
                  Relatórios Recebidos
                </CardTitle>
                <CardDescription>
                  {filteredReports.length} relatório(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="border rounded-lg overflow-hidden">
                      {/* Header do Relatório */}
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-black">{report.team}</h3>
                              {getStatusBadge(report.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="h-4 w-4" />
                                {report.manager}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="h-4 w-4" />
                                {report.region}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" style={{ color: '#8B20EE' }} />
                                {report.period}
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <FileText className="h-4 w-4" />
                                {report.attachments} anexos
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            {expandedReportId === report.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo Expandido */}
                      {expandedReportId === report.id && (
                        <div className="border-t bg-gray-50 p-4 space-y-4">
                          {/* Métricas em Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Serviços</p>
                              <p className="text-black">{report.metrics.servicesCompleted}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">No Prazo</p>
                              <p className="text-black">{report.metrics.onTimeRate}%</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Retrabalho</p>
                              <p className="text-black">{report.metrics.reworkRate}%</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Satisfação</p>
                              <p className="text-black">{report.metrics.satisfaction}</p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-xs text-gray-600 mb-1">Incidentes</p>
                              <p className="text-black">{report.metrics.incidents}</p>
                            </div>
                          </div>

                          {/* Observações */}
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm mb-2">Observações do Gestor:</p>
                            <p className="text-sm text-gray-700">{report.observations}</p>
                          </div>

                          {/* Gráfico Radar Individual */}
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm mb-3">Análise de Desempenho:</p>
                            <ResponsiveContainer width="100%" height={250}>
                              <RadarChart data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                <Radar name="Desempenho" dataKey="value" stroke="#6400A4" fill="#8B20EE" fillOpacity={0.6} />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Ações */}
                          <div className="flex flex-wrap gap-3 pt-2">
                            {report.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => handleApprove(report.id)}
                                  className="gap-2 text-white"
                                  style={{ backgroundColor: '#35BAE6' }}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Aprovar
                                </Button>
                                <Button
                                  onClick={() => handleReject(report.id)}
                                  variant="outline"
                                  className="gap-2 border-red-500 text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => setSelectedReport(report)}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                  Enviar Feedback
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Enviar Feedback</DialogTitle>
                                  <DialogDescription>
                                    Envie uma mensagem de feedback para {report.manager}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <Textarea
                                    placeholder="Digite seu feedback aqui..."
                                    rows={6}
                                    value={feedbackText}
                                    onChange={(e) => setFeedbackText(e.target.value)}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      onClick={handleSendFeedback}
                                      className="text-white"
                                      style={{ backgroundColor: '#6400A4' }}
                                    >
                                      <Send className="h-4 w-4 mr-2" />
                                      Enviar
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" className="gap-2">
                              <Eye className="h-4 w-4" />
                              Ver Anexos
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredReports.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum relatório encontrado com os filtros selecionados</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Time Clock Reports Tab */}
        {activeTab === 'timeclock' && (
          <>
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardHeader style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" style={{ color: '#6400A4' }} />
                  Busca e Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="search">Buscar Colaborador</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Nome ou ID do colaborador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-filter">Data</Label>
                    <Select value={timeClockDateFilter} onValueChange={setTimeClockDateFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoje</SelectItem>
                        <SelectItem value="yesterday">Ontem</SelectItem>
                        <SelectItem value="week">Esta Semana</SelectItem>
                        <SelectItem value="month">Este Mês</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Registros</p>
                      <p className="text-black text-2xl">{filteredTimeRecords.length}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                      <Users className="h-6 w-6" style={{ color: '#6400A4' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Presentes</p>
                      <p className="text-black text-2xl">
                        {filteredTimeRecords.filter(r => r.status === 'present').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Atrasos</p>
                      <p className="text-black text-2xl">
                        {filteredTimeRecords.filter(r => r.status === 'late').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-100">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Faltas</p>
                      <p className="text-black text-2xl">
                        {filteredTimeRecords.filter(r => r.status === 'absent').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-100">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Time Records Table */}
            <Card>
              <CardHeader style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" style={{ color: '#6400A4' }} />
                  Registros de Ponto
                </CardTitle>
                <CardDescription>
                  {filteredTimeRecords.length} registro(s) encontrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Equipe</TableHead>
                      <TableHead>Gestor</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Saída</TableHead>
                      <TableHead>Total Horas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Local</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTimeRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)', color: '#6400A4' }}>
                                {record.employeeName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm text-black">{record.employeeName}</p>
                              <p className="text-xs text-gray-500">{record.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-700">{record.team}</TableCell>
                        <TableCell className="text-sm text-gray-700">{record.manager}</TableCell>
                        <TableCell className="text-sm text-gray-700">{record.date}</TableCell>
                        <TableCell className="text-sm text-gray-700">{record.checkInTime}</TableCell>
                        <TableCell className="text-sm text-gray-700">{record.checkOutTime || '-'}</TableCell>
                        <TableCell className="text-sm text-gray-700">{record.totalHours || '-'}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[150px] truncate">{record.checkInLocation.address}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredTimeRecords.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum registro de ponto encontrado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Request Report Dialog */}
        <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="modal-title-purple">Solicitar Relatório ao Gestor</DialogTitle>
              <DialogDescription>
                Configure os detalhes do relatório que deseja solicitar
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Report Type */}
              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <Select value={requestType} onValueChange={(value: string) => setRequestType(value as 'performance' | 'timeclock')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="performance">Relatório de Desempenho</SelectItem>
                    <SelectItem value="timeclock">Relatório de Ponto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Manager Selection */}
              <div className="space-y-2">
                <Label>Gestor Responsável *</Label>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gestor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carlos Silva">Carlos Silva - Equipe Alpha</SelectItem>
                    <SelectItem value="Ana Costa">Ana Costa - Equipe Beta</SelectItem>
                    <SelectItem value="Ricardo Mendes">Ricardo Mendes - Equipe Gamma</SelectItem>
                    <SelectItem value="Ana Paula Rodrigues">Ana Paula Rodrigues - Equipe Delta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial *</Label>
                  <Input
                    type="date"
                    value={requestStartDate}
                    onChange={(e) => setRequestStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data Final *</Label>
                  <Input
                    type="date"
                    value={requestEndDate}
                    onChange={(e) => setRequestEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Time Clock Specific Options */}
              {requestType === 'timeclock' && (
                <>
                  <Separator />
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-gray-600">Opções específicas para relatório de ponto:</p>
                    
                    <div className="space-y-2">
                      <Label>Equipe</Label>
                      <Select value={requestTeam} onValueChange={setRequestTeam}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a equipe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toda a Equipe</SelectItem>
                          <SelectItem value="Equipe Alpha">Equipe Alpha</SelectItem>
                          <SelectItem value="Equipe Beta">Equipe Beta</SelectItem>
                          <SelectItem value="Equipe Gamma">Equipe Gamma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Colaborador Específico (Opcional)</Label>
                      <Select value={requestCollaborator} onValueChange={setRequestCollaborator}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os colaboradores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os Colaboradores</SelectItem>
                          <SelectItem value="Carlos Mendes">Carlos Mendes (COL-001)</SelectItem>
                          <SelectItem value="Marina Oliveira">Marina Oliveira (COL-002)</SelectItem>
                          <SelectItem value="Roberto Silva">Roberto Silva (COL-003)</SelectItem>
                          <SelectItem value="Juliana Santos">Juliana Santos (COL-004)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Deixe como "Todos" para solicitar relatório de toda a equipe
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label>Observações (Opcional)</Label>
                <Textarea
                  placeholder="Adicione informações adicionais ou requisitos específicos..."
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                />
              </div>

              {/* Info Box */}
              <div className="p-3 rounded-lg border-2" style={{ borderColor: '#35BAE6', backgroundColor: 'rgba(53, 186, 230, 0.05)' }}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: '#35BAE6' }} />
                  <p className="text-sm text-gray-700">
                    O gestor receberá uma notificação e terá até 48 horas para enviar o relatório solicitado.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleRequestReport}
                className="text-white"
                style={{ backgroundColor: '#6400A4' }}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar Solicitação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
