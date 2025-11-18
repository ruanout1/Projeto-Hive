import { useState } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Allocation } from './types';
import { getStatusBadge, getInitials, formatDateRange, formatWorkDays } from './utils';

interface AllocationCardProps {
  allocation: Allocation;
  onEdit: (allocation: Allocation) => void;
  onDelete: (id: number) => void;
}

export default function AllocationCard({ allocation, onEdit, onDelete }: AllocationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card key={allocation.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" style={{ color: '#6400A4' }} />
                ) : (
                  <ChevronRight className="h-5 w-5" style={{ color: '#6400A4' }} />
                )}
              </div>

              <Avatar className="h-12 w-12" style={{ backgroundColor: '#6400A4' }}>
                <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white' }}>
                  {getInitials(allocation.collaboratorName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 style={{ color: '#6400A4' }}>{allocation.collaboratorName}</h3>
                  <span className="text-gray-400">→</span>
                  <p className="text-gray-700">{allocation.clientName}</p>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span>{allocation.collaboratorPosition}</span>
                  <span>•</span>
                  <span>Área {allocation.clientArea}</span>
                  <span>•</span>
                  <span>{formatDateRange(allocation.startDate, allocation.endDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-4">
              {getStatusBadge(allocation.status)}
              
              {allocation.status !== 'cancelled' && allocation.status !== 'completed' && (
                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(allocation)}
                    style={{ borderColor: '#6400A4', color: '#6400A4' }}
                    className="hover:bg-purple-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(allocation.id)}
                    style={{ borderColor: '#EF4444', color: '#EF4444' }}
                    className="hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <>
            <Separator />
            <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-2">Período</p>
                <div className="space-y-1">
                  <p className="text-sm" style={{ color: '#6400A4' }}>
                    <strong>Início:</strong> {new Date(allocation.startDate).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-sm" style={{ color: '#6400A4' }}>
                    <strong>Término:</strong> {new Date(allocation.endDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Dias de Trabalho</p>
                <p className="text-sm" style={{ color: '#6400A4' }}>
                  {formatWorkDays(allocation.workDays)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Horário</p>
                <p className="text-sm" style={{ color: '#6400A4' }}>
                  {allocation.startTime} - {allocation.endTime}
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
