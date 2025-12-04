import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Calendar, Users, Eye, UserCog, AlertTriangle } from 'lucide-react';
import { ServiceRequest } from '../types';
import { getStatusConfig, getAreaColor } from '../utils/statusConfig';

interface RequestCardProps {
  request: ServiceRequest;
  onView: (request: ServiceRequest) => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({ request, onView }) => {
  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;
  const areaColor = getAreaColor(request.clientArea);

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => onView(request)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base truncate">{request.clientName}</CardTitle>
            {request.clientLocation && (
              <p className="text-xs text-gray-500 mt-1 truncate">{request.clientLocation}</p>
            )}
          </div>
          <Badge 
            className={`${statusConfig.color} border-none flex items-center gap-1 flex-shrink-0`}
            style={statusConfig.style}
          >
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs text-gray-500">ID da Solicitação</p>
          <p className="text-sm font-mono" style={{ color: '#6400A4' }}>
            {request.id}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500">Tipo de Serviço</p>
          <p className="text-sm">{request.serviceType}</p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Descrição</p>
          <p className="text-sm line-clamp-2">{request.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs text-gray-500 mb-1">Área</p>
            <Badge 
              style={{ 
                backgroundColor: `${areaColor}15`,
                color: areaColor,
                border: `1px solid ${areaColor}40`
              }}
            >
              {request.clientArea.charAt(0).toUpperCase() + request.clientArea.slice(1)}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Data Preferencial</p>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-gray-400" />
              <p className="text-sm">{request.preferredDate}</p>
            </div>
          </div>
        </div>

        {request.assignedTeam && (
          <div className="pt-2 border-t">
            <p className="text-xs text-gray-500 mb-1">Equipe Designada</p>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" style={{ color: '#8B20EE' }} />
              <p className="text-sm" style={{ color: '#8B20EE' }}>
                {request.assignedTeam}
                {request.assignedCollaborator && ` • ${request.assignedCollaborator}`}
              </p>
            </div>
          </div>
        )}

        {request.status === 'delegated' && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'rgba(139, 32, 238, 0.05)' }}>
              <UserCog className="h-4 w-4 flex-shrink-0" style={{ color: '#8B20EE' }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: '#8B20EE' }}>Delegada para você</p>
                <p className="text-xs text-gray-600">Aguardando sua resposta</p>
              </div>
            </div>
          </div>
        )}

        {request.status === 'urgent' && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-red-600">Urgência Sinalizada</p>
                <p className="text-xs text-gray-600">Requer atenção imediata</p>
              </div>
            </div>
          </div>
        )}

        <Button 
          className="w-full mt-2" 
          variant="outline"
          style={{ borderColor: '#6400A4', color: '#6400A4' }}
          onClick={(e) => {
            e.stopPropagation();
            onView(request);
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </CardContent>
    </Card>
  );
};