import { useState } from 'react';
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
import { toast } from 'sonner';
import React from 'react';


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

export default function ManagerTimeClockScreen() {
  const [records, setRecords] = useState<TimeRecord[]>(mockRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);
  const [justificationText, setJustificationText] = useState('');
  const currentManagerName = 'Ana Paula Rodrigues'; // Nome do gestor logado

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
    setJustificationText(record.managerReport?.reason || '');
    setIsJustifyModalOpen(true);
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
    toast.success('Relatório exportado com sucesso!', {
      description: 'O arquivo foi baixado para sua pasta de Downloads.'
    });
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
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                <Clock className="h-6 w-6" style={{ color: '#6400A4' }} />
              </div>
              <div>
                <h1 className="hive-screen-title">Controle de Ponto - Minhas Equipes</h1>
                <p className="text-sm text-gray-600">
                  Monitoramento de registro de ponto das suas equipes
                </p>
              </div>
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
                          <div className="space-y-1">
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
              disabled={!justificationText}
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