import { useState } from 'react';
import { TrendingUp, Download, FileText, CheckCircle, AlertCircle, Search, Calendar, Send, Users, Mail, Phone, Clock } from 'lucide-react';
// CORREÇÃO: Caminho para o ScreenHeader a partir da mesma pasta
import ScreenHeader from './ScreenHeader';
// CORREÇÃO: Caminho para os componentes da UI
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { HighlightText } from '../../components/ui/search-highlight';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface TeamReport {
  id: string;
  teamName: string;
  teamId: string;
  manager: {
    name: string;
    email: string;
    phone: string;
  };
  members: TeamMember[];
  submittedDate: string;
  dueDate: string;
  status: 'submitted' | 'pending' | 'overdue';
  performance: {
    productivity: number;
    goalsAchieved: number;
    issues: string[];
  };
  observations: string;
  adminFeedback?: {
    status: 'approved' | 'needs_adjustment';
    comment: string;
    date: string;
  };
}

// Mock data
const mockReports: TeamReport[] = [
  {
    id: '1',
    teamName: 'Equipe Alpha',
    teamId: '1',
    manager: {
      name: 'Ana Paula Rodrigues',
      email: 'ana.rodrigues@hive.com',
      phone: '(11) 98765-4321'
    },
    members: [
      { id: '2', name: 'Carlos Mendes', role: 'Colaborador' },
      { id: '7', name: 'Marina Oliveira', role: 'Colaborador' }
    ],
    submittedDate: '28/09/2025',
    dueDate: '30/09/2025',
    status: 'submitted',
    performance: {
      productivity: 92,
      goalsAchieved: 8,
      issues: []
    },
    observations: 'Equipe performou acima da média. Todas as metas foram alcançadas com eficiência.',
    adminFeedback: {
      status: 'approved',
      comment: 'Excelente trabalho! Continue assim.',
      date: '29/09/2025'
    }
  },
  {
    id: '2',
    teamName: 'Equipe Beta',
    teamId: '2',
    manager: {
      name: 'Fernanda Lima',
      email: 'fernanda.lima@hive.com',
      phone: '(11) 98765-1234'
    },
    members: [
      { id: '4', name: 'Roberto Silva', role: 'Colaborador' }
    ],
    submittedDate: '27/09/2025',
    dueDate: '30/09/2025',
    status: 'submitted',
    performance: {
      productivity: 78,
      goalsAchieved: 6,
      issues: ['Atraso na entrega de 2 serviços', 'Necessidade de treinamento adicional']
    },
    observations: 'Equipe enfrentou alguns desafios este mês. Necessário reforço em treinamento.',
    adminFeedback: {
      status: 'needs_adjustment',
      comment: 'Necessário plano de ação para melhorar a pontualidade nas entregas.',
      date: '28/09/2025'
    }
  },
  {
    id: '3',
    teamName: 'Equipe Gamma',
    teamId: '3',
    manager: {
      name: 'Pedro Costa',
      email: 'pedro.costa@hive.com',
      phone: '(11) 98765-5678'
    },
    members: [
      { id: '5', name: 'Juliana Santos', role: 'Colaborador' }
    ],
    submittedDate: '',
    dueDate: '25/09/2025',
    status: 'overdue',
    performance: {
      productivity: 0,
      goalsAchieved: 0,
      issues: ['Relatório não enviado']
    },
    observations: '',
  },
  {
    id: '4',
    teamName: 'Equipe Delta',
    teamId: '4',
    manager: {
      name: 'Lucas Ferreira',
      email: 'lucas.ferreira@hive.com',
      phone: '(11) 98765-9012'
    },
    members: [
      { id: '6', name: 'Marina Santos', role: 'Colaborador' },
      { id: '8', name: 'Paulo Oliveira', role: 'Colaborador' }
    ],
    submittedDate: '',
    dueDate: '30/09/2025',
    status: 'pending',
    performance: {
      productivity: 0,
      goalsAchieved: 0,
      issues: []
    },
    observations: '',
  }
];

interface TeamReportsScreenProps {
  onBack?: () => void;
}

export default function TeamReportsScreen({ onBack }: TeamReportsScreenProps) {
  const [reports, setReports] = useState<TeamReport[]>(mockReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedReport, setSelectedReport] = useState<TeamReport | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    status: 'approved' as 'approved' | 'needs_adjustment',
    comment: ''
  });

  const submittedCount = reports.filter(r => r.status === 'submitted').length;
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const overdueCount = reports.filter(r => r.status === 'overdue').length;
  const avgProductivity = reports
    .filter(r => r.status === 'submitted')
    .reduce((sum, r) => sum + r.performance.productivity, 0) / submittedCount || 0;

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.manager.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'todos' || report.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenDetail = (report: TeamReport) => {
    setSelectedReport(report);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedReport(null);
  };

  const handleOpenFeedback = (report: TeamReport) => {
    setSelectedReport(report);
    setFeedbackData({
      status: report.adminFeedback?.status || 'approved',
      comment: report.adminFeedback?.comment || ''
    });
    setIsFeedbackOpen(true);
  };

  const handleCloseFeedback = () => {
    setIsFeedbackOpen(false);
    setSelectedReport(null);
  };

  const handleSendFeedback = () => {
    if (!selectedReport) return;

    setReports(reports.map(r => 
      r.id === selectedReport.id 
        ? { 
            ...r, 
            adminFeedback: {
              status: feedbackData.status,
              comment: feedbackData.comment,
              date: new Date().toLocaleDateString('pt-BR')
            }
          }
        : r
    ));

    toast.success('Feedback enviado com sucesso!', {
      description: `Feedback enviado para ${selectedReport.manager.name}.`
    });

    handleCloseFeedback();
  };

  const handleDownloadReport = (report: TeamReport) => {
    toast.success('Download iniciado!', {
      description: `Relatório de ${report.teamName} em PDF.`
    });
  };

  const handleRequestNewReport = (report: TeamReport) => {
    toast.success('Solicitação enviada!', {
      description: `Solicitação de novo relatório enviada para ${report.manager.name}.`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge style={{ backgroundColor: '#10B981', color: 'white' }}>Enviado</Badge>;
      case 'pending':
        return <Badge style={{ backgroundColor: '#F59E0B', color: 'white' }}>Pendente</Badge>;
      case 'overdue':
        return <Badge style={{ backgroundColor: '#EF4444', color: 'white' }}>Atrasado</Badge>;
      default:
        return null;
    }
  };

  const getFeedbackBadge = (status?: 'approved' | 'needs_adjustment') => {
    if (!status) return null;
    
    switch (status) {
      case 'approved':
        return (
          <Badge style={{ backgroundColor: '#10B981', color: 'white' }}>
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'needs_adjustment':
        return (
          <Badge style={{ backgroundColor: '#F59E0B', color: 'white' }}>
            <AlertCircle className="h-3 w-3 mr-1" />
            Ajustes Solicitados
          </Badge>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <ScreenHeader 
              title="Relatórios de Equipes"
              description="Acompanhe o desempenho e forneça feedback às equipes"
              onBack={() => onBack?.()}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Relatórios</p>
                  <p className="text-2xl" style={{ color: '#8B20EE' }}>{reports.length}</p>
                </div>
                <FileText className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enviados</p>
                  <p className="text-2xl text-green-600">{submittedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Atrasados</p>
                  <p className="text-2xl text-red-600">{overdueCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Produtividade Média</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{avgProductivity.toFixed(0)}%</p>
                </div>
                <TrendingUp className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por equipe ou gestor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="submitted">Enviados</TabsTrigger>
                <TabsTrigger value="pending">Pendentes</TabsTrigger>
                <TabsTrigger value="overdue">Atrasados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhum relatório encontrado</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div
                key={report.id}
                className={`bg-white rounded-2xl p-5 transition-all border-2 ${
                  report.status === 'overdue' 
                    ? 'border-red-300 hover:border-red-400' 
                    : 'border-transparent hover:border-purple-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                      <Users className="h-6 w-6" style={{ color: '#8B20EE' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 style={{ color: '#8B20EE' }}>
                          <HighlightText text={report.teamName} searchTerm={searchTerm} highlightClassName="search-highlight" />
                        </h3>
                        {getStatusBadge(report.status)}
                        {report.adminFeedback && getFeedbackBadge(report.adminFeedback.status)}
                        {report.status === 'overdue' && (
                          <Badge style={{ backgroundColor: '#EF4444', color: 'white' }}>
                            <AlertCircle className="h-3 w-3 mr-1" />
                            CRÍTICO
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Gestor: <HighlightText text={report.manager.name} searchTerm={searchTerm} highlightClassName="search-highlight" /></span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" style={{ color: '#8B20EE' }} />
                          Prazo: {report.dueDate}
                        </span>
                        {report.submittedDate && (
                          <>
                            <span>•</span>
                            <span>Enviado: {report.submittedDate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Summary (only for submitted reports) */}
                {report.status === 'submitted' && (
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Produtividade</p>
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${report.performance.productivity}%`,
                              backgroundColor: report.performance.productivity >= 80 ? '#10B981' : report.performance.productivity >= 60 ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        </div>
                        <span className="text-sm" style={{ color: '#6400A4' }}>{report.performance.productivity}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Metas Alcançadas</p>
                      <p style={{ color: '#6400A4' }}>{report.performance.goalsAchieved} de 10</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Problemas</p>
                      <p style={{ color: report.performance.issues.length > 0 ? '#EF4444' : '#10B981' }}>
                        {report.performance.issues.length} {report.performance.issues.length === 1 ? 'problema' : 'problemas'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Observations (only for submitted reports) */}
                {report.status === 'submitted' && report.observations && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Observações do Gestor:</p>
                    <p className="text-sm text-gray-700">{report.observations}</p>
                  </div>
                )}

                {/* Admin Feedback (if exists) */}
                {report.adminFeedback && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg border-l-4" style={{ borderColor: '#8B20EE' }}>
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-xs" style={{ color: '#6400A4' }}>Seu Feedback</p>
                      <span className="text-xs text-gray-500">• {report.adminFeedback.date}</span>
                    </div>
                    <p className="text-sm text-gray-700">{report.adminFeedback.comment}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetail(report)}
                    style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                    className="hover:bg-purple-50"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Ver Detalhes
                  </Button>
                  
                  {report.status === 'submitted' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report)}
                        style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
                        className="hover:bg-blue-50"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenFeedback(report)}
                        style={{ borderColor: '#10B981', color: '#10B981' }}
                        className="hover:bg-green-50"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {report.adminFeedback ? 'Editar Feedback' : 'Enviar Feedback'}
                      </Button>
                    </>
                  )}
                  
                  {(report.status === 'pending' || report.status === 'overdue') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRequestNewReport(report)}
                      style={{ borderColor: '#F59E0B', color: '#F59E0B' }}
                      className="hover:bg-yellow-50"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Solicitar Relatório
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredReports.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Exibindo <span style={{ color: '#8B20EE' }}>{filteredReports.length}</span> de{' '}
              <span style={{ color: '#8B20EE' }}>{reports.length}</span> relatórios
            </p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={handleCloseDetail}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto scrollbar-hide">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="modal-title-purple">{selectedReport.teamName}</DialogTitle>
                <DialogDescription>
                  Detalhes da equipe e histórico de relatórios
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Team Status */}
                <div className="flex items-center justify-center space-x-2">
                  {getStatusBadge(selectedReport.status)}
                  {selectedReport.adminFeedback && getFeedbackBadge(selectedReport.adminFeedback.status)}
                </div>

                {/* Manager Info */}
                <div>
                  <h4 className="text-sm text-gray-500 mb-3">Gestor Responsável:</h4>
                  <div className="flex items-center space-x-3 bg-purple-50 rounded-xl p-4">
                    <Avatar className="h-12 w-12" style={{ backgroundColor: '#6400A4' }}>
                      <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                        {getInitials(selectedReport.manager.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p style={{ color: '#6400A4' }}>{selectedReport.manager.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {selectedReport.manager.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedReport.manager.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h4 className="text-sm text-gray-500 mb-3">
                    Colaboradores ({selectedReport.members.length}):
                  </h4>
                  <div className="space-y-2">
                    {selectedReport.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3 bg-blue-50 rounded-xl p-3"
                      >
                        <Avatar className="h-10 w-10" style={{ backgroundColor: '#35BAE6' }}>
                          <AvatarFallback style={{ backgroundColor: '#35BAE6', color: 'white' }}>
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Details (if submitted) */}
                {selectedReport.status === 'submitted' && (
                  <>
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm text-gray-500 mb-3">Desempenho:</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">Produtividade</span>
                            <span className="text-sm" style={{ color: '#6400A4' }}>{selectedReport.performance.productivity}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${selectedReport.performance.productivity}%`,
                                backgroundColor: '#8B20EE'
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Metas Alcançadas</span>
                          <span style={{ color: '#6400A4' }}>{selectedReport.performance.goalsAchieved} de 10</span>
                        </div>
                      </div>
                    </div>

                    {selectedReport.performance.issues.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-500 mb-3">Problemas Identificados:</h4>
                        <ul className="space-y-2">
                          {selectedReport.performance.issues.map((issue, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                              <span className="text-gray-700">{issue}</span>
                            </li>
                          ))}\
                        </ul>
                      </div>
                    )}

                    {selectedReport.observations && (
                      <div>
                        <h4 className="text-sm text-gray-500 mb-3">Observações Gerais:</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {selectedReport.observations}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Dates */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Prazo de Envio</p>
                      <p className="flex items-center" style={{ color: '#6400A4' }}>
                        <Clock className="h-4 w-4 mr-1" style={{ color: '#8B20EE' }} />
                        {selectedReport.dueDate}
                      </p>
                    </div>
                    {selectedReport.submittedDate && (
                      <div>
                        <p className="text-gray-500">Data de Envio</p>
                        <p style={{ color: '#10B981' }}>{selectedReport.submittedDate}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                {(selectedReport.status === 'pending' || selectedReport.status === 'overdue') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleRequestNewReport(selectedReport);
                      handleCloseDetail();
                    }}
                    style={{ borderColor: '#F59E0B', color: '#F59E0B' }}
                    className="hover:bg-yellow-50"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Solicitar Novo Relatório
                  </Button>
                )}
                <Button variant="outline" onClick={handleCloseDetail}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}\
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackOpen} onOpenChange={handleCloseFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Enviar Feedback</DialogTitle>
            <DialogDescription>
              Forneça feedback para {selectedReport?.teamName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="feedbackStatus" style={{ color: '#8B20EE' }}>Status *</Label>
              <Select 
                value={feedbackData.status} 
                onValueChange={(value: 'approved' | 'needs_adjustment') => 
                  setFeedbackData({ ...feedbackData, status: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Aprovado
                    </div>
                  </SelectItem>
                  <SelectItem value="needs_adjustment">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                      Solicitar Ajustes
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="feedbackComment" style={{ color: '#8B20EE' }}>Comentário *</Label>
              <Textarea
                id="feedbackComment"
                value={feedbackData.comment}
                onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                placeholder="Digite seu feedback..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseFeedback}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendFeedback}
              disabled={!feedbackData.comment.trim()}
              style={{ backgroundColor: '#8B20EE', color: 'white' }}
              className="hover:opacity-90"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
