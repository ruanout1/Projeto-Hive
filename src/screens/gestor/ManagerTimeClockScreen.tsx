import { useState } from 'react';
import ScreenHeader from '../../components/ScreenHeader';
import { 
  Clock, 
  Search, 
  Download, 
  MapPin, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  PlayCircle,
  Calendar,
  FileText,
  Upload,
  Eye,
  Send
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { HighlightText } from '../../components/ui/search-highlight';
import { toast } from 'sonner';

interface TimeRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  team: string;
  checkInTime: string;
  checkInLocation: { lat: number; lng: number; address: string };
  checkOutTime?: string;
  checkOutLocation?: { lat: number; lng: number; address: string };
  totalHours?: string;
  status: 'present' | 'late' | 'absent' | 'on-duty' | 'not-registered';
  notes?: string;
  managerReport?: { reason: string; document?: string; date: string; reportedBy: string };
  reportRequested?: boolean;
}

// Manager's teams only (Ana Paula Rodrigues manages Equipe Alpha and Beta)
const mockRecords: TimeRecord[] = [
  {
    id: '1',
    employeeName: 'Carlos Mendes',
    employeeId: 'COL-001',
    team: 'Equipe Alpha',
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
    checkInTime: '08:25',
    checkInLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    totalHours: '-',
    status: 'late',
    notes: 'Atraso de 25 minutos',
    reportRequested: true,
    managerReport: { reason: 'Atraso no transporte público - metrô atrasado 20min', date: '30/09/2025', reportedBy: 'Ana Paula Rodrigues' }
  },
  {
    id: '3',
    employeeName: 'Roberto Silva',
    employeeId: 'COL-003',
    team: 'Equipe Beta',
    checkInTime: '08:05',
    checkInLocation: { lat: -23.5629, lng: -46.6544, address: 'Av. Paulista, São Paulo - SP' },
    totalHours: '-',
    status: 'on-duty'
  },
  {
    id: '5',
    employeeName: 'Lucas Ferreira',
    employeeId: 'COL-005',
    team: 'Equipe Beta',
    checkInTime: '-',
    checkInLocation: { lat: 0, lng: 0, address: '-' },
    totalHours: '-',
    status: 'not-registered',
    notes: 'Aguardando registro de ponto'
  },
  {
    id: '6',
    employeeName: 'Patrícia Souza',
    employeeId: 'COL-006',
    team: 'Equipe Alpha',
    checkInTime: '07:55',
    checkInLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    checkOutTime: '17:05',
    checkOutLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    totalHours: '9h 10m',
    status: 'present'
  }
];

const myTeams = ['Todas', 'Equipe Alpha', 'Equipe Beta'];

interface ManagerTimeClockScreenProps {
  onBack?: () => void;
}

export default function ManagerTimeClockScreen({ onBack }: ManagerTimeClockScreenProps) {
  const [records, setRecords] = useState<TimeRecord[]>(mockRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
  const [justificationText, setJustificationText] = useState('');
  const [originalJustificationText, setOriginalJustificationText] = useState('');
  const currentManagerName = 'Ana Paula Rodrigues'; // Nome do gestor logado
  
  // Export Report states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [exportType, setExportType] = useState<'team' | 'individual'>('team');
  const [exportTeam, setExportTeam] = useState('');
  const [exportEmployee, setExportEmployee] = useState('');
  const [exportEmployeeSearch, setExportEmployeeSearch] = useState('');
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  // Statistics
  const totalActive = records.length;
  const checkedIn = records.filter(r => r.checkInTime !== '-').length;
  const onDuty = records.filter(r => r.status === 'on-duty').length;
  const late = records.filter(r => r.status === 'late').length;
  const absent = records.filter(r => r.status === 'absent').length;

  // Filtered records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.team.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = filterTeam === 'Todas' || record.team === filterTeam;
    const matchesStatus = filterStatus === 'todos' || record.status === filterStatus;
    
    return matchesSearch && matchesTeam && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'present': { label: 'Presente', color: '#10B981', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      'late': { label: 'Atraso', color: '#F59E0B', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      'absent': { label: 'Falta', color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-800' },
      'on-duty': { label: 'Em Jornada', color: '#35BAE6', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      'not-registered': { label: 'Não Registrado', color: '#9CA3AF', bgColor: 'bg-gray-100', textColor: 'text-gray-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.bgColor} ${config.textColor} border-none`}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'present': CheckCircle,
      'late': AlertTriangle,
      'absent': XCircle,
      'on-duty': PlayCircle,
      'not-registered': Clock
    };
    const IconComponent = icons[status as keyof typeof icons];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  const handleViewDetails = (record: TimeRecord) => {
    setSelectedRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleJustify = (record: TimeRecord) => {
    setSelectedRecord(record);
    const initialText = record.managerReport?.reason || '';
    setJustificationText(initialText);
    setOriginalJustificationText(initialText);
    setIsJustifyModalOpen(true);
  };

  const hasJustificationChanges = () => {
    return justificationText !== originalJustificationText;
  };

  const handleSaveJustification = () => {
    if (selectedRecord && justificationText) {
      setRecords(records.map(r => 
        r.id === selectedRecord.id 
          ? { 
              ...r, 
              managerReport: { 
                reason: justificationText, 
                date: new Date().toLocaleDateString('pt-BR'),
                reportedBy: currentManagerName
              },
              reportRequested: false
            }
          : r
      ));
      toast.success('Reportação enviada ao Administrador!', {
        description: `Justificativa sobre ${selectedRecord.employeeName} foi registrada.`
      });
      setIsJustifyModalOpen(false);
      setJustificationText('');
    }
  };

  const handleExportReport = () => {
    setIsExportModalOpen(true);
  };

  const handlePreviewReport = () => {
    // Validação
    if (!exportStartDate || !exportEndDate) {
      toast.error('Selecione o período do relatório');
      return;
    }

    if (exportType === 'team' && !exportTeam) {
      toast.error('Selecione uma equipe');
      return;
    }

    if (exportType === 'individual' && !exportEmployee) {
      toast.error('Selecione um colaborador');
      return;
    }

    // Abrir pré-visualização
    setIsPreviewModalOpen(true);
  };

  const handleConfirmExport = () => {
    // Gerar relatório
    const reportDetails = exportType === 'team' 
      ? `Equipe: ${exportTeam}`
      : `Colaborador: ${records.find(r => r.employeeId === exportEmployee)?.employeeName}`;

    toast.success('Relatório exportado com sucesso!', {
      description: `${reportDetails} | Período: ${exportStartDate} a ${exportEndDate}`
    });

    // Resetar e fechar
    setIsExportModalOpen(false);
    setIsPreviewModalOpen(false);
    setExportType('team');
    setExportTeam('');
    setExportEmployee('');
    setExportEmployeeSearch('');
    setExportStartDate('');
    setExportEndDate('');
  };

  // Filtrar colaboradores para exportação
  const filteredEmployeesForExport = records.filter(record => 
    record.employeeName.toLowerCase().includes(exportEmployeeSearch.toLowerCase()) ||
    record.employeeId.toLowerCase().includes(exportEmployeeSearch.toLowerCase()) ||
    record.team.toLowerCase().includes(exportEmployeeSearch.toLowerCase())
  );

  // Gerar dados mockados do relatório para pré-visualização
  const generatePreviewData = () => {
    const mockData = [
      {
        date: '15/10/2025',
        employee: 'Carlos Mendes',
        checkIn: '08:00',
        checkInLocation: 'Shopping Center Norte, São Paulo - SP',
        breakStart: '12:00',
        breakEnd: '13:00',
        checkOut: '17:00',
        checkOutLocation: 'Shopping Center Norte, São Paulo - SP',
        totalHours: '8h 00m',
        status: 'Presente'
      },
      {
        date: '16/10/2025',
        employee: 'Carlos Mendes',
        checkIn: '08:05',
        checkInLocation: 'Shopping Center Norte, São Paulo - SP',
        breakStart: '12:00',
        breakEnd: '13:00',
        checkOut: '17:10',
        checkOutLocation: 'Shopping Center Norte, São Paulo - SP',
        totalHours: '8h 05m',
        status: 'Presente'
      },
      {
        date: '17/10/2025',
        employee: 'Carlos Mendes',
        checkIn: '08:20',
        checkInLocation: 'Shopping Center Norte, São Paulo - SP',
        breakStart: '12:00',
        breakEnd: '13:00',
        checkOut: '17:00',
        checkOutLocation: 'Shopping Center Norte, São Paulo - SP',
        totalHours: '7h 40m',
        status: 'Atraso',
        notes: 'Atraso de 20 minutos'
      },
      {
        date: '18/10/2025',
        employee: 'Carlos Mendes',
        checkIn: '07:58',
        checkInLocation: 'Shopping Center Norte, São Paulo - SP',
        breakStart: '12:00',
        breakEnd: '13:00',
        checkOut: '17:05',
        checkOutLocation: 'Shopping Center Norte, São Paulo - SP',
        totalHours: '8h 07m',
        status: 'Presente'
      },
      {
        date: '19/10/2025',
        employee: 'Carlos Mendes',
        checkIn: '-',
        checkInLocation: '-',
        breakStart: '-',
        breakEnd: '-',
        checkOut: '-',
        checkOutLocation: '-',
        totalHours: '0h 00m',
        status: 'Falta'
      }
    ];

    if (exportType === 'team') {
      // Se for equipe, duplicar para simular mais colaboradores
      return [
        ...mockData,
        ...mockData.map(d => ({ ...d, employee: 'Marina Oliveira' })),
        ...mockData.map(d => ({ ...d, employee: 'Patrícia Souza' }))
      ];
    }

    return mockData;
  };

  const previewData = generatePreviewData();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <ScreenHeader 
                title="Controle de Ponto - Minhas Equipes"
                description="Monitoramento de registro de ponto das suas equipes"
                onBack={() => onBack?.()}
              />
            </div>
            
            <Button
              onClick={handleExportReport}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Ativos</p>
                  <p className="text-2xl" style={{ color: '#6400A4' }}>{totalActive}</p>
                </div>
                <Users className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bateram Ponto</p>
                  <p className="text-2xl text-green-600">{checkedIn}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Em Jornada</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{onDuty}</p>
                </div>
                <PlayCircle className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#F59E0B' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Atrasos</p>
                  <p className="text-2xl" style={{ color: '#F59E0B' }}>{late}</p>
                </div>
                <AlertTriangle className="h-8 w-8" style={{ color: '#F59E0B', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ausências</p>
                  <p className="text-2xl text-red-600">{absent}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500 opacity-50" />
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
                placeholder="Buscar por nome, CPF ou equipe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Team Filter */}
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Equipe" />
              </SelectTrigger>
              <SelectContent>
                {myTeams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="present">Presentes</TabsTrigger>
                <TabsTrigger value="late">Atrasos</TabsTrigger>
                <TabsTrigger value="absent">Faltas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="max-w-7xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-black flex items-center">
              <MapPin className="h-5 w-5 mr-2" style={{ color: '#6400A4' }} />
              Mapa de Localização - Minhas Equipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg h-64 overflow-hidden border-2 border-gray-200" 
                 style={{ background: 'linear-gradient(to bottom right, rgba(100, 0, 164, 0.05), rgba(53, 186, 230, 0.05))' }}>
              <div className="absolute inset-0">
                {/* Map grid lines */}
                <div className="absolute top-8 left-0 right-0 h-px bg-gray-300 opacity-30"></div>
                <div className="absolute bottom-12 left-0 right-0 h-px bg-gray-300 opacity-30"></div>
                <div className="absolute top-0 bottom-0 left-12 w-px bg-gray-300 opacity-30"></div>
                <div className="absolute top-0 bottom-0 right-16 w-px bg-gray-300 opacity-30"></div>
                
                {/* Employee pins */}
                {filteredRecords.filter(r => r.checkInTime !== '-').map((record, idx) => (
                  <div 
                    key={record.id}
                    className="absolute group cursor-pointer"
                    style={{
                      left: `${20 + (idx * 15) % 60}%`,
                      top: `${30 + (idx * 10) % 40}%`
                    }}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                      style={{
                        backgroundColor: 
                          record.status === 'present' ? '#10B981' :
                          record.status === 'late' ? '#F59E0B' :
                          record.status === 'absent' ? '#EF4444' :
                          record.status === 'on-duty' ? '#35BAE6' : '#9CA3AF'
                      }}
                    ></div>
                    <div className="hidden group-hover:block absolute left-6 top-0 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      {record.employeeName} - {record.team}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-2 right-2 bg-white/90 rounded p-2 shadow-sm text-xs">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-black">Presente</span>
                </div>
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                  <span className="text-black">Atraso</span>
                </div>
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#35BAE6' }}></div>
                  <span className="text-black">Em Jornada</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-black">Falta</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Registros de Ponto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black">Colaborador</TableHead>
                    <TableHead className="text-black">Equipe</TableHead>
                    <TableHead className="text-black">Entrada</TableHead>
                    <TableHead className="text-black">Saída</TableHead>
                    <TableHead className="text-black">Total Horas</TableHead>
                    <TableHead className="text-black">Status</TableHead>
                    <TableHead className="text-black">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10" style={{ backgroundColor: '#6400A4' }}>
                              <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                                {getInitials(record.employeeName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-black">
                                <HighlightText text={record.employeeName} searchTerm={searchTerm} highlightClassName="search-highlight" />
                              </p>
                              <p className="text-xs text-gray-500">{record.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-black text-sm">
                            <HighlightText text={record.team} searchTerm={searchTerm} highlightClassName="search-highlight" />
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-black">{record.checkInTime}</p>
                          {record.checkInLocation.address !== '-' && (
                            <p className="text-xs text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {record.checkInLocation.address.substring(0, 30)}...
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-black">{record.checkOutTime || '-'}</p>
                        </TableCell>
                        <TableCell className="text-black">{record.totalHours}</TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start space-y-1">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(record.status)}
                              {getStatusBadge(record.status)}
                            </div>
                            {record.reportRequested && !record.managerReport && (
                              <Badge className="bg-orange-100 text-orange-800 border-none text-xs">
                                Reportação Solicitada
                              </Badge>
                            )}
                            {record.managerReport && (
                              <Badge className="bg-blue-100 text-blue-800 border-none text-xs">
                                Reportado
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(record)}
                              className="h-8 w-8 p-0"
                              title="Ver Detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {(record.status === 'late' || record.status === 'absent' || record.status === 'not-registered') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleJustify(record)}
                                className="h-8 w-8 p-0"
                                style={{ 
                                  borderColor: record.reportRequested ? '#F59E0B' : '#6400A4', 
                                  color: record.reportRequested ? '#F59E0B' : '#6400A4' 
                                }}
                                title={record.reportRequested ? "Responder Solicitação" : "Justificar ao Admin"}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Detalhes do Registro</DialogTitle>
            <DialogDescription>
              Visualize todas as informações do registro de ponto
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                <Avatar className="h-16 w-16" style={{ backgroundColor: '#6400A4' }}>
                  <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                    {getInitials(selectedRecord.employeeName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl" style={{ color: '#6400A4' }}>{selectedRecord.employeeName}</h3>
                  <p className="text-sm text-gray-600">{selectedRecord.employeeId}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
              </div>

              <div>
                <Label style={{ color: '#8B20EE' }}>Equipe</Label>
                <p className="text-black">{selectedRecord.team}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: '#8B20EE' }}>Hora de Entrada</Label>
                  <p className="text-black">{selectedRecord.checkInTime}</p>
                  {selectedRecord.checkInLocation.address !== '-' && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedRecord.checkInLocation.address}
                    </p>
                  )}
                </div>
                <div>
                  <Label style={{ color: '#8B20EE' }}>Hora de Saída</Label>
                  <p className="text-black">{selectedRecord.checkOutTime || '-'}</p>
                  {selectedRecord.checkOutLocation && (
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedRecord.checkOutLocation.address}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label style={{ color: '#8B20EE' }}>Total de Horas</Label>
                <p className="text-black text-lg">{selectedRecord.totalHours}</p>
              </div>

              {selectedRecord.managerReport && (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <Label style={{ color: '#8B20EE' }}>Reportação Enviada</Label>
                  <p className="text-black mt-1">{selectedRecord.managerReport.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">Data: {selectedRecord.managerReport.date}</p>
                </div>
              )}

              {selectedRecord.reportRequested && !selectedRecord.managerReport && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Label style={{ color: '#F59E0B' }}>⚠️ Reportação Solicitada pelo Administrador</Label>
                  <p className="text-sm text-gray-600 mt-1">Você precisa justificar a situação deste colaborador.</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label style={{ color: '#8B20EE' }}>Observações</Label>
                  <p className="text-black mt-1">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Report Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Exportar Relatório de Ponto</DialogTitle>
            <DialogDescription>
              Configure os filtros para exportar o histórico completo de registros de ponto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tipo de Relatório */}
            <div className="space-y-3">
              <Label style={{ color: '#8B20EE' }}>Tipo de Relatório *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setExportType('team');
                    setExportEmployee('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    exportType === 'team'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Users className={`h-6 w-6 mx-auto mb-2 ${exportType === 'team' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${exportType === 'team' ? 'text-purple-600' : 'text-gray-600'}`}>
                    Equipe Completa
                  </p>
                </button>
                <button
                  onClick={() => {
                    setExportType('individual');
                    setExportTeam('');
                    setExportEmployee('');
                    setExportEmployeeSearch('');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    exportType === 'individual'
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <Users className={`h-6 w-6 mx-auto mb-2 ${exportType === 'individual' ? 'text-purple-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${exportType === 'individual' ? 'text-purple-600' : 'text-gray-600'}`}>
                    Colaborador Específico
                  </p>
                </button>
              </div>
            </div>

            {/* Seleção de Equipe ou Colaborador */}
            {exportType === 'team' ? (
              <div className="space-y-2">
                <Label htmlFor="export-team" style={{ color: '#8B20EE' }}>Selecione a Equipe *</Label>
                <Select value={exportTeam} onValueChange={setExportTeam}>
                  <SelectTrigger id="export-team">
                    <SelectValue placeholder="Escolha uma equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equipe Alpha">Equipe Alpha</SelectItem>
                    <SelectItem value="Equipe Beta">Equipe Beta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="export-employee" style={{ color: '#8B20EE' }}>Buscar Colaborador *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="export-employee"
                    placeholder="Digite o nome, ID ou equipe do colaborador..."
                    value={exportEmployeeSearch}
                    onChange={(e) => {
                      setExportEmployeeSearch(e.target.value);
                      setExportEmployee('');
                    }}
                    className="pl-10"
                  />
                </div>
                
                {/* Lista de colaboradores filtrados */}
                {exportEmployeeSearch && (
                  <div className="border rounded-lg max-h-64 overflow-y-auto">
                    {filteredEmployeesForExport.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        Nenhum colaborador encontrado
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredEmployeesForExport.map((record) => (
                          <button
                            key={record.employeeId}
                            type="button"
                            onClick={() => {
                              setExportEmployee(record.employeeId);
                              setExportEmployeeSearch(record.employeeName);
                            }}
                            className={`w-full p-3 text-left hover:bg-purple-50 transition-colors ${
                              exportEmployee === record.employeeId ? 'bg-purple-100 border-l-4' : ''
                            }`}
                            style={exportEmployee === record.employeeId ? { borderLeftColor: '#6400A4' } : {}}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10" style={{ backgroundColor: '#6400A4' }}>
                                <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                                  {getInitials(record.employeeName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="text-black">
                                  <HighlightText 
                                    text={record.employeeName} 
                                    searchTerm={exportEmployeeSearch} 
                                    highlightClassName="search-highlight" 
                                  />
                                </p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs text-gray-500">
                                    <HighlightText 
                                      text={record.employeeId} 
                                      searchTerm={exportEmployeeSearch} 
                                      highlightClassName="search-highlight" 
                                    />
                                  </p>
                                  <span className="text-xs text-gray-400">•</span>
                                  <p className="text-xs text-gray-500">
                                    <HighlightText 
                                      text={record.team} 
                                      searchTerm={exportEmployeeSearch} 
                                      highlightClassName="search-highlight" 
                                    />
                                  </p>
                                </div>
                              </div>
                              {exportEmployee === record.employeeId && (
                                <CheckCircle className="h-5 w-5" style={{ color: '#6400A4' }} />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Colaborador selecionado */}
                {exportEmployee && !exportEmployeeSearch && (
                  <div className="p-3 rounded-lg border-2" style={{ borderColor: '#6400A4', backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10" style={{ backgroundColor: '#6400A4' }}>
                          <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                            {getInitials(records.find(r => r.employeeId === exportEmployee)?.employeeName || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-black">{records.find(r => r.employeeId === exportEmployee)?.employeeName}</p>
                          <p className="text-xs text-gray-500">
                            {records.find(r => r.employeeId === exportEmployee)?.employeeId} • {records.find(r => r.employeeId === exportEmployee)?.team}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setExportEmployee('');
                          setExportEmployeeSearch('');
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <XCircle className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Período */}
            <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5" style={{ color: '#35BAE6' }} />
                <Label style={{ color: '#35BAE6' }}>Período do Relatório *</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm text-gray-600">Data Inicial</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm text-gray-600">Data Final</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    min={exportStartDate}
                  />
                </div>
              </div>
            </div>

            {/* Informações sobre o Relatório */}
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 32, 0.1)', border: '1px solid #FFFF20' }}>
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 mt-0.5" style={{ color: '#6400A4' }} />
                <div>
                  <p className="text-sm" style={{ color: '#6400A4' }}>O que será exportado:</p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                    <li>Histórico completo de todos os registros do período</li>
                    <li>Horários de entrada, pausa, retorno e saída</li>
                    <li>Localização (GPS e endereço) de cada registro</li>
                    <li>Status de cada ponto (presente, atraso, falta, etc.)</li>
                    <li>Total de horas trabalhadas por dia</li>
                    <li>Observações e justificativas (quando houver)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsExportModalOpen(false);
                setExportType('team');
                setExportTeam('');
                setExportEmployee('');
                setExportEmployeeSearch('');
                setExportStartDate('');
                setExportEndDate('');
              }}
            >
              Cancelar
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePreviewReport}
                disabled={!exportStartDate || !exportEndDate || (exportType === 'team' ? !exportTeam : !exportEmployee)}
                style={{ borderColor: '#35BAE6', color: '#35BAE6' }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              <Button
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                onClick={handleConfirmExport}
                disabled={!exportStartDate || !exportEndDate || (exportType === 'team' ? !exportTeam : !exportEmployee)}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Report Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Pré-visualização do Relatório</DialogTitle>
            <DialogDescription>
              Documento de controle de ponto
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-2">
            <div className="space-y-4 py-4">
              {/* Cabeçalho do Documento */}
              <div className="border-b-2 pb-4" style={{ borderColor: '#6400A4' }}>
                <h3 className="text-center text-xl" style={{ color: '#6400A4' }}>
                  RELATÓRIO DE CONTROLE DE PONTO
                </h3>
                <p className="text-center text-sm text-gray-600 mt-2">
                  Gerado em: {new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>

              {/* Informações do Relatório */}
              <div className="grid grid-cols-2 gap-4 text-sm border p-4 rounded">
                <div>
                  <span className="text-gray-600">Tipo de Relatório:</span>
                  <p className="text-black">{exportType === 'team' ? 'Equipe Completa' : 'Colaborador Individual'}</p>
                </div>
                <div>
                  <span className="text-gray-600">
                    {exportType === 'team' ? 'Equipe:' : 'Colaborador:'}
                  </span>
                  <p className="text-black">
                    {exportType === 'team' 
                      ? exportTeam 
                      : records.find(r => r.employeeId === exportEmployee)?.employeeName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Período:</span>
                  <p className="text-black">
                    {new Date(exportStartDate).toLocaleDateString('pt-BR')} até {new Date(exportEndDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Gestor Responsável:</span>
                  <p className="text-black">Ana Paula Rodrigues</p>
                </div>
              </div>

              {/* Resumo Estatístico */}
              <div className="border p-4 rounded">
                <h4 className="text-sm mb-3" style={{ color: '#6400A4' }}>RESUMO DO PERÍODO</h4>
                <div className="grid grid-cols-4 gap-3 text-center text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Presenças</p>
                    <p className="text-xl text-green-600">{previewData.filter(d => d.status === 'Presente').length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Atrasos</p>
                    <p className="text-xl text-yellow-600">{previewData.filter(d => d.status === 'Atraso').length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Faltas</p>
                    <p className="text-xl text-red-600">{previewData.filter(d => d.status === 'Falta').length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Total de Horas</p>
                    <p className="text-xl" style={{ color: '#6400A4' }}>
                      {exportType === 'team' ? '120h 12m' : '40h 12m'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabela Compacta de Registros */}
              <div className="border rounded">
                <h4 className="text-sm p-3 border-b bg-gray-50" style={{ color: '#6400A4' }}>
                  REGISTROS DETALHADOS ({previewData.length} registros)
                </h4>
                
                <div className="overflow-y-auto max-h-[400px]">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-gray-100 border-b">
                      <tr>
                        <th className="p-2 text-left text-black">Data</th>
                        {exportType === 'team' && <th className="p-2 text-left text-black">Colaborador</th>}
                        <th className="p-2 text-center text-black">Entrada</th>
                        <th className="p-2 text-center text-black">Pausa</th>
                        <th className="p-2 text-center text-black">Retorno</th>
                        <th className="p-2 text-center text-black">Saída</th>
                        <th className="p-2 text-center text-black">Total</th>
                        <th className="p-2 text-center text-black">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {previewData.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-2 text-black whitespace-nowrap">{record.date}</td>
                          {exportType === 'team' && (
                            <td className="p-2 text-black">{record.employee}</td>
                          )}
                          <td className="p-2 text-center text-black">{record.checkIn}</td>
                          <td className="p-2 text-center text-black">{record.breakStart}</td>
                          <td className="p-2 text-center text-black">{record.breakEnd}</td>
                          <td className="p-2 text-center text-black">{record.checkOut}</td>
                          <td className="p-2 text-center text-black">{record.totalHours}</td>
                          <td className="p-2 text-center">
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              record.status === 'Presente' ? 'bg-green-100 text-green-800' :
                              record.status === 'Atraso' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Localização Detalhada */}
              <div className="border rounded">
                <h4 className="text-sm p-3 border-b bg-gray-50" style={{ color: '#6400A4' }}>
                  LOCALIZAÇÕES
                </h4>
                <div className="p-3 space-y-2 text-xs max-h-40 overflow-y-auto">
                  {previewData.slice(0, 5).map((record, index) => (
                    record.checkInLocation !== '-' && (
                      <div key={index} className="flex items-start gap-2 pb-2 border-b last:border-0">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: '#35BAE6' }} />
                        <div>
                          <p className="text-black">{record.date} - {record.employee || 'Colaborador'}</p>
                          <p className="text-gray-600">{record.checkInLocation}</p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Rodapé do Documento */}
              <div className="border-t-2 pt-4 mt-6 text-xs text-center text-gray-500" style={{ borderColor: '#6400A4' }}>
                <p>Este documento é uma pré-visualização do relatório de ponto.</p>
                <p className="mt-1">O relatório exportado conterá todas as coordenadas GPS e informações completas.</p>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsPreviewModalOpen(false)}
            >
              Voltar
            </Button>
            <Button
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              onClick={handleConfirmExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Confirmar e Exportar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Justify Modal */}
      <Dialog open={isJustifyModalOpen} onOpenChange={setIsJustifyModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              {selectedRecord?.reportRequested ? 'Responder Solicitação do Admin' : 'Justificar ao Administrador'}
            </DialogTitle>
            <DialogDescription>
              {selectedRecord?.reportRequested 
                ? 'O administrador solicitou informações sobre este colaborador'
                : 'Reporte a situação do colaborador ao administrador'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedRecord && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Colaborador</p>
                <p className="text-black">{selectedRecord.employeeName}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedRecord.team}</p>
                <div className="mt-2">
                  {getStatusBadge(selectedRecord.status)}
                </div>
              </div>
            )}

            {selectedRecord?.reportRequested && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm" style={{ color: '#F59E0B' }}>
                  ⚠️ Esta reportação foi solicitada pelo administrador
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="justification" style={{ color: '#8B20EE' }}>Justificativa *</Label>
              <Textarea
                id="justification"
                placeholder="Descreva a situação do colaborador para o administrador..."
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <Label style={{ color: '#8B20EE' }}>Anexar Documento (Opcional)</Label>
              <div className="mt-2">
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsJustifyModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              onClick={handleSaveJustification}
              disabled={!justificationText || !hasJustificationChanges()}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar Justificativa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}