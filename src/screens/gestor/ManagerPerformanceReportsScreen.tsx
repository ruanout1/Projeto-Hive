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
  Upload, 
  Send, 
  FileText, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  UserX,
  XCircle,
  Timer,
  Inbox,
  Eye,
  Check
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

interface ReportRequest {
  id: string;
  requestedBy: string;
  type: 'performance' | 'timeclock';
  startDate: string;
  endDate: string;
  team?: string;
  collaborator?: string;
  notes?: string;
  status: 'pending' | 'completed' | 'in-progress';
  requestDate: string;
  dueDate: string;
}

interface ManagerPerformanceReportsScreenProps {
  onBack?: () => void;
}

export default function ManagerPerformanceReportsScreen({ onBack }: ManagerPerformanceReportsScreenProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'requests'>('create');
  const [formData, setFormData] = useState({
    reportFrequency: '',
    period: '',
    team: '',
    region: '',
    date: '',
    servicesCompleted: '',
    onTimeRate: '',
    reworkRate: '',
    incidents: '',
    punctuality: '',
    satisfaction: '',
    absences: '',
    canceledServices: '',
    avgTime: '',
    fullTeam: 'yes',
    observations: '',
    signature: ''
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ReportRequest | null>(null);
  const [isRequestDetailOpen, setIsRequestDetailOpen] = useState(false);

  // Mock report requests from admin
  const [reportRequests, setReportRequests] = useState<ReportRequest[]>([
    {
      id: '1',
      requestedBy: 'Administrador Sistema',
      type: 'performance',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      team: 'Equipe Alpha',
      notes: 'Relatório mensal de desempenho para avaliação trimestral',
      status: 'pending',
      requestDate: '2025-10-21',
      dueDate: '2025-10-23'
    },
    {
      id: '2',
      requestedBy: 'Administrador Sistema',
      type: 'timeclock',
      startDate: '2025-10-15',
      endDate: '2025-10-21',
      team: 'Equipe Alpha',
      collaborator: 'Marina Oliveira',
      notes: 'Verificação de atrasos recorrentes',
      status: 'in-progress',
      requestDate: '2025-10-20',
      dueDate: '2025-10-22'
    },
    {
      id: '3',
      requestedBy: 'Administrador Sistema',
      type: 'performance',
      startDate: '2025-09-01',
      endDate: '2025-09-30',
      team: 'Toda a Equipe',
      status: 'completed',
      requestDate: '2025-10-01',
      dueDate: '2025-10-03'
    }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAttachments(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} arquivo(s) adicionado(s)`);
    }
  };

  const handleSubmit = () => {
    // Validação simples
    if (!formData.reportFrequency || !formData.period || !formData.team || !formData.region || !formData.date) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    toast.success('Relatório enviado com sucesso!', {
      description: 'O administrador receberá sua análise para aprovação.'
    });

    // Resetar formulário
    setFormData({
      reportFrequency: '',
      period: '',
      team: '',
      region: '',
      date: '',
      servicesCompleted: '',
      onTimeRate: '',
      reworkRate: '',
      incidents: '',
      punctuality: '',
      satisfaction: '',
      absences: '',
      canceledServices: '',
      avgTime: '',
      fullTeam: 'yes',
      observations: '',
      signature: ''
    });
    setAttachments([]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    toast.info('Anexo removido');
  };

  const handleStartRequest = (request: ReportRequest) => {
    setReportRequests(prev => prev.map(r => 
      r.id === request.id ? { ...r, status: 'in-progress' as const } : r
    ));
    toast.info('Solicitação marcada como em progresso');
  };

  const handleCompleteRequest = (request: ReportRequest) => {
    setReportRequests(prev => prev.map(r => 
      r.id === request.id ? { ...r, status: 'completed' as const } : r
    ));
    toast.success('Solicitação marcada como concluída!');
    setIsRequestDetailOpen(false);
  };

  const getRequestStatusBadge = (status: ReportRequest['status']) => {
    const statusConfig = {
      'pending': { label: 'Pendente', className: 'border-yellow-500 text-yellow-700 bg-yellow-50' },
      'in-progress': { label: 'Em Progresso', className: 'border-blue-500 text-blue-700 bg-blue-50' },
      'completed': { label: 'Concluído', className: 'border-green-500 text-green-700 bg-green-50' }
    };
    
    const config = statusConfig[status];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getRequestTypeBadge = (type: ReportRequest['type']) => {
    return type === 'performance' 
      ? <Badge variant="outline" className="border-purple-500 text-purple-700 bg-purple-50">Desempenho</Badge>
      : <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">Ponto</Badge>;
  };

  const pendingCount = reportRequests.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <ScreenHeader 
            title="Relatórios de Desempenho"
            description="Envie seus relatórios e responda às solicitações do administrador"
            onBack={() => onBack?.()}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: string) => setActiveTab(value as 'create' | 'requests')} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create" className="gap-2">
              <FileText className="h-4 w-4" />
              Criar Relatório
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Inbox className="h-4 w-4" />
              Solicitações
              {pendingCount > 0 && (
                <Badge 
                  className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Create Report Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Card: Informações do Relatório */}
            <Card>
              <CardHeader style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" style={{ color: '#6400A4' }} />
                  Informações do Relatório
                </CardTitle>
                <CardDescription>Dados gerais sobre o período e equipe</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportFrequency" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" style={{ color: '#6400A4' }} />
                      Frequência do Relatório *
                    </Label>
                    <Select value={formData.reportFrequency} onValueChange={(value: string) => {
                      handleInputChange('reportFrequency', value);
                      handleInputChange('period', '');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="period" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" style={{ color: '#6400A4' }} />
                      Período *
                    </Label>
                    <Select 
                      value={formData.period} 
                      onValueChange={(value: string) => handleInputChange('period', value)}
                      disabled={!formData.reportFrequency}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.reportFrequency ? "Selecione o período" : "Selecione a frequência primeiro"} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.reportFrequency === 'diario' && (
                          <>
                            <SelectItem value="21-10-2025">21/10/2025</SelectItem>
                            <SelectItem value="22-10-2025">22/10/2025</SelectItem>
                            <SelectItem value="23-10-2025">23/10/2025</SelectItem>
                            <SelectItem value="24-10-2025">24/10/2025</SelectItem>
                            <SelectItem value="25-10-2025">25/10/2025</SelectItem>
                          </>
                        )}
                        {formData.reportFrequency === 'semanal' && (
                          <>
                            <SelectItem value="semana-42-2025">Semana 42 (14-20/10/2025)</SelectItem>
                            <SelectItem value="semana-43-2025">Semana 43 (21-27/10/2025)</SelectItem>
                            <SelectItem value="semana-44-2025">Semana 44 (28/10-03/11/2025)</SelectItem>
                            <SelectItem value="semana-45-2025">Semana 45 (04-10/11/2025)</SelectItem>
                          </>
                        )}
                        {formData.reportFrequency === 'quinzenal' && (
                          <>
                            <SelectItem value="quinzena-1-out-2025">1ª Quinzena Outubro 2025</SelectItem>
                            <SelectItem value="quinzena-2-out-2025">2ª Quinzena Outubro 2025</SelectItem>
                            <SelectItem value="quinzena-1-nov-2025">1ª Quinzena Novembro 2025</SelectItem>
                            <SelectItem value="quinzena-2-nov-2025">2ª Quinzena Novembro 2025</SelectItem>
                          </>
                        )}
                        {formData.reportFrequency === 'mensal' && (
                          <>
                            <SelectItem value="jan-2025">Janeiro 2025</SelectItem>
                            <SelectItem value="fev-2025">Fevereiro 2025</SelectItem>
                            <SelectItem value="mar-2025">Março 2025</SelectItem>
                            <SelectItem value="abr-2025">Abril 2025</SelectItem>
                            <SelectItem value="mai-2025">Maio 2025</SelectItem>
                            <SelectItem value="jun-2025">Junho 2025</SelectItem>
                            <SelectItem value="jul-2025">Julho 2025</SelectItem>
                            <SelectItem value="ago-2025">Agosto 2025</SelectItem>
                            <SelectItem value="set-2025">Setembro 2025</SelectItem>
                            <SelectItem value="out-2025">Outubro 2025</SelectItem>
                            <SelectItem value="nov-2025">Novembro 2025</SelectItem>
                            <SelectItem value="dez-2025">Dezembro 2025</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" style={{ color: '#6400A4' }} />
                      Data de Envio *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team" className="flex items-center gap-2">
                      <Users className="h-4 w-4" style={{ color: '#6400A4' }} />
                      Equipe *
                    </Label>
                    <Select value={formData.team} onValueChange={(value: string) => handleInputChange('team', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipe-alpha">Equipe Alpha</SelectItem>
                        <SelectItem value="equipe-beta">Equipe Beta</SelectItem>
                        <SelectItem value="equipe-gamma">Equipe Gamma</SelectItem>
                        <SelectItem value="equipe-delta">Equipe Delta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" style={{ color: '#6400A4' }} />
                      Região *
                    </Label>
                    <Select value={formData.region} onValueChange={(value: string) => handleInputChange('region', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a região" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="norte">Norte</SelectItem>
                        <SelectItem value="sul">Sul</SelectItem>
                        <SelectItem value="leste">Leste</SelectItem>
                        <SelectItem value="oeste">Oeste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Indicadores Quantitativos */}
            <Card>
              <CardHeader style={{ backgroundColor: 'rgba(139, 32, 238, 0.05)' }}>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" style={{ color: '#8B20EE' }} />
                  Indicadores Quantitativos
                </CardTitle>
                <CardDescription>Métricas numéricas de desempenho</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Quantidade de serviços */}
                  <div className="space-y-2">
                    <Label htmlFor="servicesCompleted" className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      Serviços realizados
                    </Label>
                    <Input
                      id="servicesCompleted"
                      type="number"
                      placeholder="0"
                      value={formData.servicesCompleted}
                      onChange={(e) => handleInputChange('servicesCompleted', e.target.value)}
                    />
                  </div>

                  {/* Taxa de serviços no prazo */}
                  <div className="space-y-2">
                    <Label htmlFor="onTimeRate" className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      Concluídos no prazo (%)
                    </Label>
                    <Input
                      id="onTimeRate"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={formData.onTimeRate}
                      onChange={(e) => handleInputChange('onTimeRate', e.target.value)}
                    />
                  </div>

                  {/* Taxa de retrabalho */}
                  <div className="space-y-2">
                    <Label htmlFor="reworkRate" className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      Taxa de retrabalho (%)
                    </Label>
                    <Input
                      id="reworkRate"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={formData.reworkRate}
                      onChange={(e) => handleInputChange('reworkRate', e.target.value)}
                    />
                  </div>

                  {/* Número de incidentes */}
                  <div className="space-y-2">
                    <Label htmlFor="incidents" className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      Incidentes registrados
                    </Label>
                    <Input
                      id="incidents"
                      type="number"
                      placeholder="0"
                      value={formData.incidents}
                      onChange={(e) => handleInputChange('incidents', e.target.value)}
                    />
                  </div>

                  {/* Pontualidade */}
                  <div className="space-y-2">
                    <Label htmlFor="punctuality" className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      Pontualidade das equipes (%)
                    </Label>
                    <Input
                      id="punctuality"
                      type="number"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={formData.punctuality}
                      onChange={(e) => handleInputChange('punctuality', e.target.value)}
                    />
                  </div>

                  {/* Satisfação média */}
                  <div className="space-y-2">
                    <Label htmlFor="satisfaction" className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      Satisfação média (1-5)
                    </Label>
                    <Input
                      id="satisfaction"
                      type="number"
                      placeholder="0"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.satisfaction}
                      onChange={(e) => handleInputChange('satisfaction', e.target.value)}
                    />
                  </div>

                  {/* Ausências/Faltas */}
                  <div className="space-y-2">
                    <Label htmlFor="absences" className="flex items-center gap-2 text-sm">
                      <UserX className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      Ausências de colaboradores
                    </Label>
                    <Input
                      id="absences"
                      type="number"
                      placeholder="0"
                      value={formData.absences}
                      onChange={(e) => handleInputChange('absences', e.target.value)}
                    />
                  </div>

                  {/* Serviços cancelados */}
                  <div className="space-y-2">
                    <Label htmlFor="canceledServices" className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      Serviços cancelados
                    </Label>
                    <Input
                      id="canceledServices"
                      type="number"
                      placeholder="0"
                      value={formData.canceledServices}
                      onChange={(e) => handleInputChange('canceledServices', e.target.value)}
                    />
                  </div>

                  {/* Tempo médio por serviço */}
                  <div className="space-y-2">
                    <Label htmlFor="avgTime" className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4" style={{ color: '#35BAE6' }} />
                      Tempo médio (horas)
                    </Label>
                    <Input
                      id="avgTime"
                      type="number"
                      placeholder="0"
                      step="0.5"
                      value={formData.avgTime}
                      onChange={(e) => handleInputChange('avgTime', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Indicadores Qualitativos */}
            <Card>
              <CardHeader style={{ backgroundColor: 'rgba(255, 255, 32, 0.1)' }}>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: '#6400A4' }} />
                  Indicadores Qualitativos
                </CardTitle>
                <CardDescription>Avaliações e observações do período</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullTeam">
                      Equipe completa em todas as execuções?
                    </Label>
                    <Select value={formData.fullTeam} onValueChange={(value: string) => handleInputChange('fullTeam', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Sim</SelectItem>
                        <SelectItem value="no">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observations">
                      Observações gerais (prazos, incidentes, feedbacks, necessidades)
                    </Label>
                    <Textarea
                      id="observations"
                      placeholder="Descreva aqui prazos cumpridos, incidentes relevantes, feedbacks de clientes, necessidades da equipe, etc."
                      rows={6}
                      value={formData.observations}
                      onChange={(e) => handleInputChange('observations', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Anexos */}
            <Card>
              <CardHeader style={{ backgroundColor: 'rgba(53, 186, 230, 0.05)' }}>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" style={{ color: '#35BAE6' }} />
                  Anexos
                </CardTitle>
                <CardDescription>Fotos, planilhas e relatórios de ponto</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label 
                      htmlFor="file-upload" 
                      className="flex items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-blue-500 hover:bg-blue-50"
                      style={{ borderColor: '#35BAE6' }}
                    >
                      <Upload className="h-5 w-5" style={{ color: '#35BAE6' }} />
                      <span className="text-sm">Clique para adicionar arquivos</span>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.xlsx,.xls,.doc,.docx"
                      />
                    </Label>
                  </div>

                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm">Arquivos anexados:</p>
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">{file.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Card: Assinatura e Envio */}
            <Card>
              <CardHeader style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" style={{ color: '#6400A4' }} />
                  Assinatura Digital
                </CardTitle>
                <CardDescription>Confirme o envio do relatório</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signature">
                      Digite seu nome completo para assinar digitalmente
                    </Label>
                    <Input
                      id="signature"
                      type="text"
                      placeholder="Nome completo"
                      value={formData.signature}
                      onChange={(e) => handleInputChange('signature', e.target.value)}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          reportFrequency: '',
                          period: '',
                          team: '',
                          region: '',
                          date: '',
                          servicesCompleted: '',
                          onTimeRate: '',
                          reworkRate: '',
                          incidents: '',
                          punctuality: '',
                          satisfaction: '',
                          absences: '',
                          canceledServices: '',
                          avgTime: '',
                          fullTeam: 'yes',
                          observations: '',
                          signature: ''
                        });
                        setAttachments([]);
                        toast.info('Formulário limpo');
                      }}
                    >
                      Limpar Formulário
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="text-white"
                      style={{ backgroundColor: '#6400A4' }}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Relatório
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Solicitações</p>
                      <p className="text-black text-2xl">{reportRequests.length}</p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                      <Inbox className="h-6 w-6" style={{ color: '#6400A4' }} />
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
                        {reportRequests.filter(r => r.status === 'pending').length}
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
                      <p className="text-sm text-gray-600">Concluídas</p>
                      <p className="text-black text-2xl">
                        {reportRequests.filter(r => r.status === 'completed').length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Requests List */}
            <Card>
              <CardHeader style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <CardTitle className="flex items-center gap-2">
                  <Inbox className="h-5 w-5" style={{ color: '#6400A4' }} />
                  Solicitações do Administrador
                </CardTitle>
                <CardDescription>
                  Relatórios solicitados pela administração
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {reportRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-black">
                              Solicitação de Relatório - {request.team}
                            </h3>
                            {getRequestTypeBadge(request.type)}
                            {getRequestStatusBadge(request.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Período: {new Date(request.startDate).toLocaleDateString('pt-BR')} - {new Date(request.endDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Prazo: {new Date(request.dueDate).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>Por: {request.requestedBy}</span>
                            </div>
                          </div>
                          {request.collaborator && (
                            <div className="text-sm text-gray-600 mt-1">
                              Colaborador específico: <strong>{request.collaborator}</strong>
                            </div>
                          )}
                          {request.notes && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700 border border-blue-200">
                              <strong>Observação:</strong> {request.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsRequestDetailOpen(true);
                          }}
                          className="gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          Ver Detalhes
                        </Button>
                        
                        {request.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartRequest(request)}
                            className="gap-1"
                            style={{ backgroundColor: '#35BAE6', color: 'white' }}
                          >
                            <Clock className="h-4 w-4" />
                            Iniciar
                          </Button>
                        )}

                        {request.status === 'in-progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleCompleteRequest(request)}
                            className="gap-1"
                            style={{ backgroundColor: '#6400A4', color: 'white' }}
                          >
                            <Check className="h-4 w-4" />
                            Marcar como Concluído
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {reportRequests.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma solicitação de relatório no momento</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Request Detail Dialog */}
        <Dialog open={isRequestDetailOpen} onOpenChange={setIsRequestDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="modal-title-purple">Detalhes da Solicitação</DialogTitle>
              <DialogDescription>
                Informações completas sobre a solicitação de relatório
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  {getRequestTypeBadge(selectedRequest.type)}
                  {getRequestStatusBadge(selectedRequest.status)}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Tipo de Relatório</Label>
                    <p className="text-black">
                      {selectedRequest.type === 'performance' ? 'Relatório de Desempenho' : 'Relatório de Ponto'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Solicitado por</Label>
                    <p className="text-black">{selectedRequest.requestedBy}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Data da Solicitação</Label>
                    <p className="text-black">{new Date(selectedRequest.requestDate).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Prazo de Entrega</Label>
                    <p className="text-black">{new Date(selectedRequest.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Data Inicial</Label>
                    <p className="text-black">{new Date(selectedRequest.startDate).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Data Final</Label>
                    <p className="text-black">{new Date(selectedRequest.endDate).toLocaleDateString('pt-BR')}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-gray-600">Equipe</Label>
                    <p className="text-black">{selectedRequest.team || 'Todas'}</p>
                  </div>

                  {selectedRequest.collaborator && (
                    <div>
                      <Label className="text-sm text-gray-600">Colaborador Específico</Label>
                      <p className="text-black">{selectedRequest.collaborator}</p>
                    </div>
                  )}
                </div>

                {selectedRequest.notes && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm text-gray-600 mb-2">Observações</Label>
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-sm text-gray-700">{selectedRequest.notes}</p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="p-3 rounded-lg border-2" style={{ borderColor: '#35BAE6', backgroundColor: 'rgba(53, 186, 230, 0.05)' }}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: '#35BAE6' }} />
                    <p className="text-sm text-gray-700">
                      {selectedRequest.type === 'performance' 
                        ? 'Use a aba "Criar Relatório" para preencher e enviar o relatório de desempenho solicitado.'
                        : 'Acesse a tela de Controle de Ponto para gerar e enviar o relatório solicitado.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRequestDetailOpen(false)}>
                Fechar
              </Button>
              {selectedRequest?.status === 'pending' && (
                <Button
                  onClick={() => {
                    handleStartRequest(selectedRequest);
                    setIsRequestDetailOpen(false);
                  }}
                  style={{ backgroundColor: '#35BAE6', color: 'white' }}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Iniciar Agora
                </Button>
              )}
              {selectedRequest?.status === 'in-progress' && (
                <Button
                  onClick={() => handleCompleteRequest(selectedRequest)}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar como Concluído
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
