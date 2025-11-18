import { Calendar, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Service } from './types';

interface ActiveServicesTableProps {
  services: Service[];
}

interface StatusStyle {
  color: string;
  label: string;
  style?: React.CSSProperties;
}

const getStatusBadge = (status: string) => {
  const statusConfig: Record<string, StatusStyle> = {
    "concluido": { color: "bg-green-100 text-green-800", label: "Concluído" },
    "em-andamento": { color: "", label: "Em Andamento", style: { backgroundColor: 'rgba(53, 186, 230, 0.1)', color: '#35BAE6' } },
    "agendado": { color: "bg-yellow-100 text-yellow-800", label: "Agendado" },
    "pendente": { color: "bg-orange-100 text-orange-800", label: "Pendente" },
    "cancelado": { color: "bg-red-100 text-red-800", label: "Cancelado" }
  };
  const config = statusConfig[status as keyof typeof statusConfig] || { color: "bg-gray-100 text-gray-800", label: "Indefinido" };
  return (
    <Badge className={`${config.color} border-none`} style={config.style}>
      {config.label}
    </Badge>
  );
};

const getStatusIcon = (status: string) => {
  const icons = {
    "concluido": CheckCircle,
    "em-andamento": Clock,
    "agendado": Calendar,
    "pendente": AlertCircle,
    "cancelado": XCircle
  };
  const IconComponent = icons[status as keyof typeof icons];
  return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
};

export const ActiveServicesTable = ({ services }: ActiveServicesTableProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-black">Serviços Ativos</CardTitle>
        <Badge variant="outline" className="text-sm">
          Total: {services.length}
        </Badge>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto scrollbar-hide">
        {services.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum serviço ativo no momento</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-black">OS</TableHead>
                <TableHead className="text-black">Cliente</TableHead>
                <TableHead className="text-black">Serviço</TableHead>
                <TableHead className="text-black">Equipe</TableHead>
                <TableHead className="text-black">Status</TableHead>
                <TableHead className="text-black">Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium text-black">{service.id}</TableCell>
                  <TableCell className="text-black">{service.cliente}</TableCell>
                  <TableCell className="text-black">{service.servico}</TableCell>
                  <TableCell className="text-black">{service.equipe}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.status)}
                      {getStatusBadge(service.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-black">{service.prazo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};