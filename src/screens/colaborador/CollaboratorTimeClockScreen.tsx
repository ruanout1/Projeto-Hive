import { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  CheckCircle, 
  PlayCircle,
  StopCircle,
  Calendar,
  AlertCircle,
  History,
  Coffee,
  Filter,
  X
} from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';

interface TimeRecord {
  id: string;
  date: string;
  checkInTime?: string;
  checkInLocation?: { lat: number; lng: number; address: string };
  checkOutTime?: string;
  checkOutLocation?: { lat: number; lng: number; address: string };
  breakStartTime?: string;
  breakEndTime?: string;
  totalHours?: string;
  status: 'present' | 'late' | 'absent' | 'on-duty' | 'pending-justification' | 'on-break';
  justification?: { reason: string; document?: string; date: string };
}

const mockHistory: TimeRecord[] = [
  {
    id: '1',
    date: '29/09/2025',
    checkInTime: '08:00',
    checkInLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    checkOutTime: '17:00',
    checkOutLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    totalHours: '9h 00m',
    status: 'present'
  },
  {
    id: '2',
    date: '28/09/2025',
    checkInTime: '08:05',
    checkInLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    breakStartTime: '12:15',
    breakEndTime: '13:10',
    checkOutTime: '17:10',
    checkOutLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    totalHours: '9h 05m',
    status: 'present'
  },
  {
    id: '3',
    date: '27/09/2025',
    checkInTime: '08:25',
    checkInLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    checkOutTime: '17:30',
    checkOutLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    totalHours: '9h 05m',
    status: 'late',
    justification: { reason: 'Atraso no transporte público', date: '27/09/2025' }
  },
  {
    id: '4',
    date: '26/09/2025',
    status: 'absent',
  },
  {
    id: '5',
    date: '25/09/2025',
    checkInTime: '07:55',
    checkInLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    checkOutTime: '17:00',
    checkOutLocation: { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' },
    totalHours: '9h 05m',
    status: 'present'
  }
];

interface CollaboratorTimeClockScreenProps {
  onBack?: () => void;
}

export default function CollaboratorTimeClockScreen({ onBack }: CollaboratorTimeClockScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkInLocation, setCheckInLocation] = useState<string>('');
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);
  const [breakStartLocation, setBreakStartLocation] = useState<string>('');
  const [breakEndTime, setBreakEndTime] = useState<string | null>(null);
  const [breakEndLocation, setBreakEndLocation] = useState<string>('');
  const [history, setHistory] = useState<TimeRecord[]>(mockHistory);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'check-in' | 'check-out' | 'break-start' | 'break-end'>('check-in');
  const [pendingLocation, setPendingLocation] = useState({ lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' });
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestCheckIn = () => {
    // Simulate GPS location capture
    const location = { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' };
    setPendingLocation(location);
    setConfirmAction('check-in');
    setIsConfirmModalOpen(true);
  };

  const handleRequestCheckOut = () => {
    // Simulate GPS location capture
    const location = { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' };
    setPendingLocation(location);
    setConfirmAction('check-out');
    setIsConfirmModalOpen(true);
  };

  const handleRequestBreakStart = () => {
    // Simulate GPS location capture
    const location = { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' };
    setPendingLocation(location);
    setConfirmAction('break-start');
    setIsConfirmModalOpen(true);
  };

  const handleRequestBreakEnd = () => {
    // Simulate GPS location capture
    const location = { lat: -23.5505, lng: -46.6333, address: 'Shopping Center Norte, São Paulo - SP' };
    setPendingLocation(location);
    setConfirmAction('break-end');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmCheckIn = () => {
    const time = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    setCheckInTime(time);
    setCheckInLocation(pendingLocation.address);
    setIsOnDuty(true);
    setIsConfirmModalOpen(false);
    
    toast.success('Ponto de entrada registrado!', {
      description: `Hora: ${time} | Local: ${pendingLocation.address}`
    });
  };

  const handleConfirmCheckOut = () => {
    const time = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    setIsOnDuty(false);
    
    // Calculate total hours (simplified)
    const totalHours = '9h 00m';
    
    // Add to history
    const newRecord: TimeRecord = {
      id: Date.now().toString(),
      date: currentTime.toLocaleDateString('pt-BR'),
      checkInTime: checkInTime || '',
      checkInLocation: { lat: -23.5505, lng: -46.6333, address: checkInLocation },
      breakStartTime: breakStartTime || undefined,
      breakEndTime: breakEndTime || undefined,
      checkOutTime: time,
      checkOutLocation: { lat: pendingLocation.lat, lng: pendingLocation.lng, address: pendingLocation.address },
      totalHours,
      status: 'present'
    };
    
    setHistory([newRecord, ...history]);
    setCheckInTime(null);
    setCheckInLocation('');
    setBreakStartTime(null);
    setBreakStartLocation('');
    setBreakEndTime(null);
    setBreakEndLocation('');
    setIsConfirmModalOpen(false);
    
    toast.success('Ponto de saída registrado!', {
      description: `Hora: ${time} | Total trabalhado: ${totalHours}`
    });
  };

  const handleConfirmBreakStart = () => {
    const time = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    setBreakStartTime(time);
    setBreakStartLocation(pendingLocation.address);
    setIsOnBreak(true);
    setIsConfirmModalOpen(false);
    
    toast.success('Saída para intervalo registrada!', {
      description: `Hora: ${time} | Aproveite seu descanso!`
    });
  };

  const handleConfirmBreakEnd = () => {
    const time = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    setBreakEndTime(time);
    setBreakEndLocation(pendingLocation.address);
    setIsOnBreak(false);
    setIsConfirmModalOpen(false);
    
    toast.success('Retorno do intervalo registrado!', {
      description: `Hora: ${time} | Bem-vindo de volta!`
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'present': { label: 'Presente', bgColor: 'bg-green-100', textColor: 'text-green-800' },
      'late': { label: 'Atraso', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
      'absent': { label: 'Falta', bgColor: 'bg-red-100', textColor: 'text-red-800' },
      'on-duty': { label: 'Em Jornada', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
      'on-break': { label: 'Em Intervalo', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
      'pending-justification': { label: 'Pendente Justificativa', bgColor: 'bg-orange-100', textColor: 'text-orange-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={`${config.bgColor} ${config.textColor} border-none`}>{config.label}</Badge>;
  };

  const todayDate = currentTime.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Parse date from DD/MM/YYYY to Date object
  const parseDate = (dateStr: string): Date | null => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  // Filter history based on date range
  const filteredHistory = history.filter((record) => {
    if (!filterStartDate && !filterEndDate) return true;
    
    const recordDate = parseDate(record.date);
    if (!recordDate) return true;

    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    if (startDate && endDate) {
      return recordDate >= startDate && recordDate <= endDate;
    } else if (startDate) {
      return recordDate >= startDate;
    } else if (endDate) {
      return recordDate <= endDate;
    }

    return true;
  });

  const clearFilters = () => {
    setFilterStartDate('');
    setFilterEndDate('');
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <ScreenHeader 
                title="Registro de Ponto"
                description={todayDate}
                onBack={() => onBack?.()}
              />
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsHistoryModalOpen(true)}
              style={{ borderColor: '#6400A4', color: '#6400A4' }}
            >
              <History className="h-4 w-4 mr-2" />
              Histórico
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Clock Display */}
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full" 
                   style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
                <Clock className="h-16 w-16" style={{ color: '#6400A4' }} />
              </div>
              
              <div>
                <p className="text-6xl" style={{ color: '#6400A4' }}>
                  {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-gray-600 mt-2">Horário Atual</p>
              </div>

              {isOnDuty && checkInTime && !isOnBreak && (
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(53, 186, 230, 0.1)' }}>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <PlayCircle className="h-5 w-5" style={{ color: '#35BAE6' }} />
                    <p style={{ color: '#35BAE6' }}>Em Jornada de Trabalho</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Entrada registrada às <strong>{checkInTime}</strong>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center justify-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {checkInLocation}
                  </p>
                </div>
              )}

              {isOnBreak && breakStartTime && (
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 165, 0, 0.1)' }}>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Coffee className="h-5 w-5 text-orange-600" />
                    <p className="text-orange-600">Em Intervalo</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Saída para intervalo às <strong>{breakStartTime}</strong>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center justify-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {breakStartLocation}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleRequestCheckIn}
            disabled={isOnDuty}
            className="h-32 text-lg"
            style={{ 
              backgroundColor: isOnDuty ? '#9CA3AF' : '#10B981', 
              color: 'white' 
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="h-12 w-12" />
              <span>Registrar Entrada</span>
            </div>
          </Button>

          <Button
            onClick={handleRequestCheckOut}
            disabled={!isOnDuty || isOnBreak}
            className="h-32 text-lg"
            style={{ 
              backgroundColor: (!isOnDuty || isOnBreak) ? '#9CA3AF' : '#EF4444', 
              color: 'white' 
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              <StopCircle className="h-12 w-12" />
              <span>Registrar Saída</span>
            </div>
          </Button>

          <Button
            onClick={handleRequestBreakStart}
            disabled={!isOnDuty || isOnBreak}
            className="h-32 text-lg"
            style={{ 
              backgroundColor: (!isOnDuty || isOnBreak) ? '#9CA3AF' : '#F97316', 
              color: 'white' 
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              <Coffee className="h-12 w-12" />
              <span>Saída para Intervalo</span>
            </div>
          </Button>

          <Button
            onClick={handleRequestBreakEnd}
            disabled={!isOnBreak}
            className="h-32 text-lg"
            style={{ 
              backgroundColor: !isOnBreak ? '#9CA3AF' : '#8B20EE', 
              color: 'white' 
            }}
          >
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="h-12 w-12" />
              <span>Retorno do Intervalo</span>
            </div>
          </Button>
        </div>

        {/* Today's Summary */}
        {isOnDuty && (
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Resumo do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Entrada</p>
                  <p className="text-xl" style={{ color: '#6400A4' }}>{checkInTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex justify-center mt-1">
                    {getStatusBadge(isOnBreak ? 'on-break' : 'on-duty')}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Intervalo</p>
                  <p className="text-xl text-orange-600">
                    {breakStartTime && breakEndTime ? `${breakStartTime} - ${breakEndTime}` : breakStartTime ? `${breakStartTime} - ...` : '--:--'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tempo Trabalhado</p>
                  <p className="text-xl" style={{ color: '#35BAE6' }}>
                    {(() => {
                      if (!checkInTime) return '--:--';
                      const [hours, minutes] = checkInTime.split(':').map(Number);
                      const checkInDate = new Date();
                      checkInDate.setHours(hours, minutes, 0);
                      const diff = currentTime.getTime() - checkInDate.getTime();
                      const totalMinutes = Math.floor(diff / 60000);
                      const h = Math.floor(totalMinutes / 60);
                      const m = totalMinutes % 60;
                      return `${h}h ${m}m`;
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Recent History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Últimos Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.slice(0, 5).map((record) => (
                <div 
                  key={record.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5" style={{ color: '#6400A4' }} />
                      <div>
                        <p className="text-black">{record.date}</p>
                        {record.checkInTime && record.checkOutTime && (
                          <p className="text-sm text-gray-600">
                            {record.checkInTime} - {record.checkOutTime} ({record.totalHours})
                          </p>
                        )}
                        {record.breakStartTime && record.breakEndTime && (
                          <p className="text-xs text-orange-600 flex items-center">
                            <Coffee className="h-3 w-3 mr-1" />
                            Intervalo: {record.breakStartTime} - {record.breakEndTime}
                          </p>
                        )}
                        {record.checkInTime && !record.checkOutTime && (
                          <p className="text-sm text-gray-600">Entrada: {record.checkInTime}</p>
                        )}
                        {!record.checkInTime && (
                          <p className="text-sm text-gray-600">Sem registro</p>
                        )}
                      </div>
                    </div>
                    {record.justification && (
                      <p className="text-xs text-gray-500 mt-2 ml-8">
                        Justificado: {record.justification.reason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="border-blue-200" style={{ backgroundColor: 'rgba(53, 186, 230, 0.05)' }}>
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: '#35BAE6' }} />
              <div>
                <p style={{ color: '#35BAE6' }}>Informações Importantes:</p>
                <ul className="text-sm text-gray-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Registre seu ponto dentro do horário estabelecido</li>
                  <li>A localização é capturada automaticamente pelo GPS</li>
                  <li>Registre saída e retorno de intervalo conforme política da empresa</li>
                  <li>Em caso de atrasos ou faltas, seu gestor será notificado</li>
                  <li>Para justificar ausências, entre em contato com seu gestor</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">Histórico de Registros</DialogTitle>
            <DialogDescription>
              Visualize todos os seus registros de ponto
            </DialogDescription>
          </DialogHeader>
          
          {/* Date Filters */}
          <div className="space-y-4 pt-4 pb-2 border-b border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="h-4 w-4" style={{ color: '#6400A4' }} />
              <span className="text-sm" style={{ color: '#6400A4' }}>Filtrar por Período</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="filter-start-date" className="text-sm text-gray-700 mb-1">
                  Data Inicial
                </Label>
                <Input
                  id="filter-start-date"
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label htmlFor="filter-end-date" className="text-sm text-gray-700 mb-1">
                  Data Final
                </Label>
                <Input
                  id="filter-end-date"
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {filteredHistory.length} {filteredHistory.length === 1 ? 'registro encontrado' : 'registros encontrados'}
              </p>
              
              {(filterStartDate || filterEndDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center space-x-1"
                >
                  <X className="h-3 w-3" />
                  <span>Limpar Filtros</span>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3 py-4">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">Nenhum registro encontrado no período selecionado</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              filteredHistory.map((record) => (
              <div 
                key={record.id} 
                className="p-4 bg-gray-50 rounded-lg border-2 border-transparent hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5" style={{ color: '#6400A4' }} />
                    <p className="text-black">{record.date}</p>
                  </div>
                  {getStatusBadge(record.status)}
                </div>

                {record.checkInTime && (
                  <div className="ml-8 space-y-1">
                    <p className="text-sm text-gray-600">
                      <strong>Entrada:</strong> {record.checkInTime}
                    </p>
                    {record.checkInLocation && (
                      <p className="text-xs text-gray-500 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {record.checkInLocation.address}
                      </p>
                    )}
                  </div>
                )}

                {record.breakStartTime && (
                  <div className="ml-8 space-y-1 mt-2">
                    <p className="text-sm text-orange-600 flex items-center">
                      <Coffee className="h-4 w-4 mr-1" />
                      <strong>Intervalo:</strong> {record.breakStartTime} - {record.breakEndTime || '...'}
                    </p>
                  </div>
                )}

                {record.checkOutTime && (
                  <div className="ml-8 space-y-1 mt-2">
                    <p className="text-sm text-gray-600">
                      <strong>Saída:</strong> {record.checkOutTime}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Total:</strong> {record.totalHours}
                    </p>
                  </div>
                )}

                {record.justification && (
                  <div className="ml-8 mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs text-gray-600 mb-1">Justificativa:</p>
                    <p className="text-sm text-black">{record.justification.reason}</p>
                  </div>
                )}


              </div>
            )))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHistoryModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              {confirmAction === 'check-in' && 'Confirmar Entrada'}
              {confirmAction === 'check-out' && 'Confirmar Saída'}
              {confirmAction === 'break-start' && 'Confirmar Saída para Intervalo'}
              {confirmAction === 'break-end' && 'Confirmar Retorno do Intervalo'}
            </DialogTitle>
            <DialogDescription>
              Confirme sua localização antes de registrar o ponto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Map Visualization */}
            <div className="relative rounded-lg h-48 overflow-hidden border-2 border-gray-200" 
                 style={{ background: 'linear-gradient(to bottom right, rgba(100, 0, 164, 0.05), rgba(53, 186, 230, 0.05))' }}>
              <div className="absolute inset-0">
                {/* Map grid lines */}
                <div className="absolute top-8 left-0 right-0 h-px bg-gray-300 opacity-30"></div>
                <div className="absolute bottom-12 left-0 right-0 h-px bg-gray-300 opacity-30"></div>
                <div className="absolute top-0 bottom-0 left-12 w-px bg-gray-300 opacity-30"></div>
                <div className="absolute top-0 bottom-0 right-16 w-px bg-gray-300 opacity-30"></div>
                
                {/* Current location pin */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    {/* Pulsing circle animation */}
                    <div className="absolute w-12 h-12 rounded-full animate-ping" 
                         style={{ backgroundColor: 'rgba(100, 0, 164, 0.3)' }}></div>
                    <div className="relative w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                         style={{ backgroundColor: '#6400A4' }}>
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Location label */}
              <div className="absolute bottom-2 left-2 right-2 bg-white/90 rounded p-2 shadow-sm">
                <p className="text-xs text-gray-600">Sua localização atual:</p>
                <p className="text-sm text-black flex items-center">
                  <MapPin className="h-3 w-3 mr-1" style={{ color: '#6400A4' }} />
                  {pendingLocation.address}
                </p>
              </div>
            </div>

            {/* Time display */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Horário do registro</p>
              <p className="text-2xl" style={{ color: '#6400A4' }}>
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>

            {/* Confirmation message */}
            <div className="p-4 rounded-lg border-2" style={{ 
              backgroundColor: 'rgba(100, 0, 164, 0.05)', 
              borderColor: '#6400A4' 
            }}>
              <p className="text-center" style={{ color: '#6400A4' }}>
                <strong>Confirme sua localização</strong>
              </p>
              <p className="text-sm text-center text-gray-600 mt-1">
                Tem certeza que quer registrar seu ponto neste local?
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              onClick={() => {
                if (confirmAction === 'check-in') handleConfirmCheckIn();
                else if (confirmAction === 'check-out') handleConfirmCheckOut();
                else if (confirmAction === 'break-start') handleConfirmBreakStart();
                else if (confirmAction === 'break-end') handleConfirmBreakEnd();
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
