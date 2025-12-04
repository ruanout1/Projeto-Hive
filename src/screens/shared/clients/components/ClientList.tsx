// /shared/clients/components/ClientList.tsx - VERSÃO ATUALIZADA
import { FileText } from 'lucide-react';
import { Client } from '../types/client';
import { ClientCard } from './ClientCard';

interface ClientListProps {
  clients: Client[];
  onView: (c: Client) => void;
  onEdit: (c: Client) => void;
  onDelete?: (c: Client) => void;
  onToggleStatus: (id: number, status: string) => void;
}

export function ClientList({ clients, onView, onEdit, onDelete, onToggleStatus }: ClientListProps) {
  
  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" style={{ color: '#6400A4' }} />
        <p className="text-gray-500 font-medium">Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}