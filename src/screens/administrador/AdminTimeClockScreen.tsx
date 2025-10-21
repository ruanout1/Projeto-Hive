import { useState } from 'react';
import ScreenHeader from './ScreenHeader';
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
  Edit,
  Upload,
  Eye,
  Send
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { HighlightText } from './ui/search-highlight';
import { toast } from 'sonner@2.0.3';

interface TimeRecord {
  id: string;
  employeeName: string;
  employeeId: string;
  team: string;
  manager: string;
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

const mockRecords: TimeRecord[] = [
  {
    id: '1',
    employeeName: 'Carlos Mendes',
    employeeId: 'COL-001',
    team: 'Equipe Alpha',
    manager: 'Ana Paula Rodrigues',
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
    manager: 'Fernanda Lima',
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
    checkInTime: '-',
    checkInLocation: { lat: 0, lng: 0, address: '-' },
    totalHours: '-',
    status: 'absent',
    notes: 'Sem registro até o momento',
    reportRequested: false
  },
  {
    id: '5',
    employeeName: 'Lucas Ferreira',
    employeeId: 'COL-005',
    team: 'Equipe Beta',
    manager: 'Fernanda Lima',
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
    manager: 'Ana Paula Rodrigues',
    checkInTime: '07:55',
    checkInLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    checkOutTime: '17:05',
    checkOutLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    totalHours: '9h 10m',
    status: 'present'
  }
];

const teams = ['Todas', 'Equipe Alpha', 'Equipe Beta', 'Equipe Gamma', 'Equipe Delta'];
const managers = ['Todos', 'Ana Paula Rodrigues', 'Fernanda Lima', 'Pedro Costa'];

interface AdminTimeClockScreenProps {
  onBack?: () => void;
}

export default function AdminTimeClockScreen({ onBack }: AdminTimeClockScreenProps) {
  const [records, setRecords] = useState<TimeRecord[]>(mockRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('Todas');
  const [filterManager, setFilterManager] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRequestReportModalOpen, setIsRequestReportModalOpen] = useState(false);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [correctionData, setCorrectionData] = useState({ checkIn: '', checkOut: '', reason: '' });
  const [originalCorrectionData, setOriginalCorrectionData] = useState({ checkIn: '', checkOut: '', reason: '' });
  
  // Estados para filtros de exportação
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');
  const [exportEmployee, setExportEmployee] = useState('todos');
  const [exportTeam, setExportTeam] = useState('todas');

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
    const matchesManager = filterManager === 'Todos' || record.manager === filterManager;
    const matchesStatus = filterStatus === 'todos' || record.status === filterStatus;
    
    return matchesSearch && matchesTeam && matchesManager && matchesStatus;
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

  const handleRequestReport = (record: TimeRecord) => {
    setSelectedRecord(record);
    setRequestMessage('');
    setIsRequestReportModalOpen(true);
  };

  const handleSendReportRequest = () => {
    if (selectedRecord && requestMessage) {
      setRecords(records.map(r => 
        r.id === selectedRecord.id 
          ? { ...r, reportRequested: true }
          : r
      ));
      toast.success('Reportação solicitada ao gestor!', {
        description: `${selectedRecord.manager} foi notificado sobre ${selectedRecord.employeeName}.`
      });
      setIsRequestReportModalOpen(false);
      setRequestMessage('');
    }
  };

  const handleCorrect = (record: TimeRecord) => {
    setSelectedRecord(record);
    const initialCorrectionData = {
      checkIn: record.checkInTime !== '-' ? record.checkInTime : '',
      checkOut: record.checkOutTime || '',
      reason: ''
    };
    setCorrectionData(initialCorrectionData);
    setOriginalCorrectionData(initialCorrectionData);
    setIsCorrectModalOpen(true);
  };

  const hasCorrectionChanges = () => {
    return JSON.stringify(correctionData) !== JSON.stringify(originalCorrectionData);
  };

  const handleSaveCorrection = () => {
    if (selectedRecord && correctionData.reason) {
      setRecords(records.map(r => 
        r.id === selectedRecord.id 
          ? { 
              ...r, 
              checkInTime: correctionData.checkIn,
              checkOutTime: correctionData.checkOut,
              notes: `Corrigido pelo Admin: ${correctionData.reason}`
            }
          : r
      ));
      toast.success('Ponto corrigido com sucesso!');
      setIsCorrectModalOpen(false);
      setCorrectionData({ checkIn: '', checkOut: '', reason: '' });
    }
  };

  const handleOpenExportModal = () => {
    // Definir datas padrão (últimos 30 dias)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setExportStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setExportEndDate(today.toISOString().split('T')[0]);
    setExportEmployee('todos');
    setExportTeam('todas');
    setIsExportModalOpen(true);
  };

  // Filtrar registros para exportação
  const getExportRecords = () => {
    return records.filter(record => {
      const matchesEmployee = exportEmployee === 'todos' || record.employeeId === exportEmployee;
      const matchesTeam = exportTeam === 'todas' || record.team === exportTeam;
      return matchesEmployee && matchesTeam;
    });
  };

  const handleExportReport = () => {
    const exportData = getExportRecords();
    
    if (exportData.length === 0) {
      toast.error('Nenhum registro encontrado', {
        description: 'Ajuste os filtros e tente novamente.'
      });
      return;
    }

    // Simulação de exportação CSV
    const csvContent = [
      ['ID', 'Colaborador', 'Equipe', 'Gestor', 'Entrada', 'Saída', 'Total Horas', 'Status', 'Localização Entrada'],
      ...exportData.map(r => [
        r.employeeId,
        r.employeeName,
        r.team,
        r.manager,
        r.checkInTime,
        r.checkOutTime || '-',
        r.totalHours || '-',
        r.status,
        r.checkInLocation.address
      ])
    ].map(row => row.join(',')).join('\n');

    toast.success('Relatório exportado com sucesso!', {
      description: `${exportData.length} registros de ${exportStartDate} até ${exportEndDate}.`
    });
    
    setIsExportModalOpen(false);
  };

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
                title="Controle de Ponto Online"
                description="Monitoramento completo de registro de ponto dos colaboradores"
                onBack={() => onBack?.()}
              />
            </div>
            
            <Button
              onClick={handleOpenExportModal}
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
                {teams.map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Manager Filter */}
            <Select value={filterManager} onValueChange={setFilterManager}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Gestor" />
              </SelectTrigger>
              <SelectContent>
                {managers.map(manager => (
                  <SelectItem key={manager} value={manager}>{manager}</SelectItem>
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
              Mapa de Georreferenciamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative rounded-lg h-64 overflow-hidden border-2 border-gray-200" 
                 style={{ background: 'linear-gradient(to bottom right, rgba(100, 0, 164, 0.05), rgba(53, 186, 230, 0.05))' }}>
              {/* Simplified map visualization */}
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
                      {record.employeeName} - {record.status === 'on-duty' ? 'Em Jornada' : 
                       record.status === 'present' ? 'Presente' : 
                       record.status === 'late' ? 'Atraso' : 'Falta'}
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
                    <TableHead className="text-black w-[220px]">Colaborador</TableHead>
                    <TableHead className="text-black w-[140px]">Equipe/Gestor</TableHead>
                    <TableHead className="text-black w-[120px]">Entrada</TableHead>
                    <TableHead className="text-black w-[80px]">Saída</TableHead>
                    <TableHead className="text-black w-[90px]">Horas</TableHead>
                    <TableHead className="text-black w-[140px]">Status</TableHead>
                    <TableHead className="text-black w-[100px]">Ações</TableHead>
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
                        <TableCell className="w-[220px]">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8 flex-shrink-0" style={{ backgroundColor: '#6400A4' }}>
                              <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white', fontSize: '0.7rem' }}>
                                {getInitials(record.employeeName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="text-black text-sm truncate">
                                <HighlightText text={record.employeeName} searchTerm={searchTerm} highlightClassName="search-highlight" />
                              </p>
                              <p className="text-xs text-gray-500 truncate">{record.employeeId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[140px]">
                          <div className="min-w-0">
                            <p className="text-black text-sm truncate">
                              <HighlightText text={record.team} searchTerm={searchTerm} highlightClassName="search-highlight" />
                            </p>
                            <p className="text-xs text-gray-500 truncate">{record.manager}</p>
                          </div>
                        </TableCell>
                        <TableCell className="w-[120px]">
                          <div className="min-w-0">
                            <p className="text-black text-sm">{record.checkInTime}</p>
                            {record.checkInLocation.address !== '-' && (
                              <p className="text-xs text-gray-500 flex items-center truncate" title={record.checkInLocation.address}>
                                <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{record.checkInLocation.address.substring(0, 15)}...</span>
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-[80px]">
                          <p className="text-black text-sm">{record.checkOutTime || '-'}</p>
                        </TableCell>
                        <TableCell className="text-black text-sm w-[90px]">{record.totalHours}</TableCell>
                        <TableCell className="w-[140px]">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1">
                              <div className="flex-shrink-0">
                                {getStatusIcon(record.status)}
                              </div>
                              <div className="min-w-0">
                                {getStatusBadge(record.status)}
                              </div>
                            </div>
                            {record.reportRequested && !record.managerReport && (
                              <Badge className="bg-orange-100 text-orange-800 border-none text-xs whitespace-nowrap">
                                Rep. Solicitada
                              </Badge>
                            )}
                            {record.managerReport && (
                              <Badge className="bg-blue-100 text-blue-800 border-none text-xs whitespace-nowrap">
                                Rep. Gestor
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-[100px]">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(record)}
                              className="h-7 w-7 p-0 flex-shrink-0"
                              title="Ver Detalhes"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {(record.status === 'late' || record.status === 'absent' || record.status === 'not-registered') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRequestReport(record)}
                                className="h-7 w-7 p-0 flex-shrink-0"
                                style={{ 
                                  borderColor: record.reportRequested ? '#35BAE6' : '#F59E0B', 
                                  color: record.reportRequested ? '#35BAE6' : '#F59E0B' 
                                }}
                                title={record.reportRequested ? "Reportação Solicitada" : "Solicitar Reportação"}
                              >
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCorrect(record)}
                              className="h-7 w-7 p-0 flex-shrink-0"
                              style={{ borderColor: '#6400A4', color: '#6400A4' }}
                              title="Corrigir Ponto"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label style={{ color: '#8B20EE' }}>Equipe</Label>
                  <p className="text-black">{selectedRecord.team}</p>
                </div>
                <div>
                  <Label style={{ color: '#8B20EE' }}>Gestor</Label>
                  <p className="text-black">{selectedRecord.manager}</p>
                </div>
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
                  <Label style={{ color: '#8B20EE' }}>Reportação do Gestor</Label>
                  <p className="text-black mt-1">{selectedRecord.managerReport.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Reportado por: <strong>{selectedRecord.managerReport.reportedBy}</strong> em {selectedRecord.managerReport.date}
                  </p>
                </div>
              )}

              {selectedRecord.reportRequested && !selectedRecord.managerReport && (
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <Label style={{ color: '#F59E0B' }}>Reportação Solicitada</Label>
                  <p className="text-sm text-gray-600 mt-1">Aguardando resposta do gestor {selectedRecord.manager}</p>
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

      {/* Request Report Modal */}
      <Dialog open={isRequestReportModalOpen} onOpenChange={setIsRequestReportModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Solicitar Reportação do Gestor</DialogTitle>
            <DialogDescription>
              Solicite que o gestor responsável reporte sobre a situação do colaborador
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedRecord && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Colaborador</p>
                <p className="text-black">{selectedRecord.employeeName}</p>
                <p className="text-sm text-gray-600 mt-2">Gestor Responsável</p>
                <p className="text-black">{selectedRecord.manager}</p>
              </div>
            )}

            <div>
              <Label htmlFor="request" style={{ color: '#8B20EE' }}>Mensagem para o Gestor *</Label>
              <Textarea
                id="request"
                placeholder="Descreva o que precisa ser reportado pelo gestor..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Atenção:</strong> O gestor {selectedRecord?.manager} será notificado e deverá justificar a situação.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestReportModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              onClick={handleSendReportRequest}
              disabled={!requestMessage}
            >
              <Send className="h-4 w-4 mr-2" />
              Solicitar Reportação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Correct Modal */}
      <Dialog open={isCorrectModalOpen} onOpenChange={setIsCorrectModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Corrigir Registro de Ponto</DialogTitle>
            <DialogDescription>
              Corrija os horários de entrada e saída do colaborador
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedRecord && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Colaborador</p>
                <p className="text-black">{selectedRecord.employeeName}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="checkIn" style={{ color: '#8B20EE' }}>Hora de Entrada</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={correctionData.checkIn}
                  onChange={(e) => setCorrectionData({ ...correctionData, checkIn: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="checkOut" style={{ color: '#8B20EE' }}>Hora de Saída</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={correctionData.checkOut}
                  onChange={(e) => setCorrectionData({ ...correctionData, checkOut: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reason" style={{ color: '#8B20EE' }}>Motivo da Correção *</Label>
              <Textarea
                id="reason"
                placeholder="Descreva o motivo da correção..."
                value={correctionData.reason}
                onChange={(e) => setCorrectionData({ ...correctionData, reason: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCorrectModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              onClick={handleSaveCorrection}
              disabled={!correctionData.reason || !hasCorrectionChanges()}
            >
              Salvar Correção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Report Modal */}
      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="max-w-[1400px] max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="modal-title-purple">Exportar Relatório de Pontos</DialogTitle>
            <DialogDescription>
              Configure os filtros e visualize a prévia antes de exportar
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">{/* Container de scroll invisível */}
          
          <div className="space-y-5 py-3">
            {/* Filtros de Exportação */}
            <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm mb-4" style={{ color: '#6400A4' }}>Filtros de Exportação</h3>
              
              <div className="grid grid-cols-4 gap-4">
                {/* Período - 2 colunas */}
                <div className="col-span-2">
                  <Label style={{ color: '#8B20EE' }}>Período *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label htmlFor="start-date" className="text-xs text-gray-600">Data Inicial</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={exportStartDate}
                        onChange={(e) => setExportStartDate(e.target.value)}
                        max={exportEndDate}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-xs text-gray-600">Data Final</Label>
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

                {/* Colaborador - 1 coluna */}
                <div>
                  <Label htmlFor="export-employee" style={{ color: '#8B20EE' }}>Colaborador</Label>
                  <Select value={exportEmployee} onValueChange={setExportEmployee}>
                    <SelectTrigger id="export-employee" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {records.map(record => (
                        <SelectItem key={record.employeeId} value={record.employeeId}>
                          {record.employeeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Equipe - 1 coluna */}
                <div>
                  <Label htmlFor="export-team" style={{ color: '#8B20EE' }}>Equipe</Label>
                  <Select value={exportTeam} onValueChange={setExportTeam}>
                    <SelectTrigger id="export-team" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {teams.filter(t => t !== 'Todas').map(team => (
                        <SelectItem key={team} value={team}>
                          {team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Info sobre filtros */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-700">
                  <strong>Filtros aplicados:</strong> Período de <strong>{exportStartDate || 'não definido'}</strong> até <strong>{exportEndDate || 'não definido'}</strong>
                  {exportEmployee !== 'todos' && <>, Colaborador: <strong>{records.find(r => r.employeeId === exportEmployee)?.employeeName}</strong></>}
                  {exportTeam !== 'todas' && <>, Equipe: <strong>{exportTeam}</strong></>}
                </p>
              </div>
            </div>

            {/* Prévia dos Dados */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm" style={{ color: '#6400A4' }}>Prévia do Relatório</h3>
                <Badge style={{ backgroundColor: '#6400A4', color: 'white' }}>
                  {getExportRecords().length} registros
                </Badge>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
                  <Table>
                    <TableHeader className="bg-gray-50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="text-black text-xs w-[100px]">ID</TableHead>
                        <TableHead className="text-black text-xs w-[220px]">Colaborador</TableHead>
                        <TableHead className="text-black text-xs w-[160px]">Equipe</TableHead>
                        <TableHead className="text-black text-xs w-[100px]">Entrada</TableHead>
                        <TableHead className="text-black text-xs w-[100px]">Saída</TableHead>
                        <TableHead className="text-black text-xs w-[100px]">Horas</TableHead>
                        <TableHead className="text-black text-xs w-[140px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getExportRecords().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center space-y-3">
                              <FileText className="h-16 w-16 text-gray-300" />
                              <p className="text-sm">Nenhum registro encontrado com os filtros aplicados</p>
                              <p className="text-xs text-gray-400">Ajuste os filtros acima para visualizar dados</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        getExportRecords().map((record) => (
                          <TableRow key={record.id} className="hover:bg-gray-50">
                            <TableCell className="text-sm w-[100px]">{record.employeeId}</TableCell>
                            <TableCell className="w-[220px]">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-7 w-7 flex-shrink-0" style={{ backgroundColor: '#6400A4' }}>
                                  <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white', fontSize: '0.65rem' }}>
                                    {getInitials(record.employeeName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm truncate">{record.employeeName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm w-[160px] truncate">{record.team}</TableCell>
                            <TableCell className="text-sm w-[100px]">{record.checkInTime}</TableCell>
                            <TableCell className="text-sm w-[100px]">{record.checkOutTime || '-'}</TableCell>
                            <TableCell className="text-sm w-[100px]">{record.totalHours || '-'}</TableCell>
                            <TableCell className="w-[140px]">{getStatusBadge(record.status)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Resumo */}
            {getExportRecords().length > 0 && (
              <div className="p-5 bg-purple-50 rounded-lg border-2" style={{ borderColor: '#6400A4' }}>
                <h3 className="text-sm mb-4" style={{ color: '#6400A4' }}>Resumo da Exportação</h3>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total de Registros</p>
                    <p className="text-2xl" style={{ color: '#6400A4' }}>{getExportRecords().length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Presentes</p>
                    <p className="text-2xl text-green-600">{getExportRecords().filter(r => r.status === 'present').length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Atrasos</p>
                    <p className="text-2xl text-yellow-600">{getExportRecords().filter(r => r.status === 'late').length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Faltas</p>
                    <p className="text-2xl text-red-600">{getExportRecords().filter(r => r.status === 'absent').length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          </div>{/* Fim do container de scroll */}

          <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 mt-4">
            <Button variant="outline" onClick={() => setIsExportModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              onClick={handleExportReport}
              disabled={!exportStartDate || !exportEndDate || getExportRecords().length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar ({getExportRecords().length} registros)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}