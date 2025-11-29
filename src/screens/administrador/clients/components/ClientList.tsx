import { Eye, Edit, Trash2, Power, MapPin, Phone, Mail, FileText, Calendar, Star } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../../../components/ui/avatar';
import { Client } from '../types/client';

interface ClientListProps {
  clients: Client[];
  onView: (c: Client) => void;
  onEdit: (c: Client) => void;
  onDelete?: (c: Client) => void; // Opcional para Gestor
  onToggleStatus: (id: number, status: string) => void;
}

export function ClientList({ clients, onView, onEdit, onDelete, onToggleStatus }: ClientListProps) {
  
  const getInitials = (n: string) => n ? n.substring(0, 2).toUpperCase() : '??';

  const formatAddress = (addr: any) => {
    if (!addr) return 'Endereço não informado';
    return [addr.street, addr.number, addr.neighborhood, addr.city, addr.state]
        .filter(Boolean).join(', ');
  };

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-200">
        <FileText className="h-12 w-12 mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium">Nenhum cliente encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map(client => (
        <div 
          key={client.id} 
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
          style={{ padding: '20px' }}
        >
          {/* LINHA SUPERIOR */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            
            {/* 1. AVATAR */}
            <Avatar className="h-14 w-14 border-2 border-white shadow-sm shrink-0" style={{ backgroundColor: '#6400A4' }}>
              <AvatarFallback style={{ color: 'white', fontWeight: '500', fontSize: '1.1rem', backgroundColor: '#6400A4' }}>
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            
            {/* 2. CONTEÚDO CENTRAL */}
            <div style={{ flex: 1, minWidth: 0 }}>
              
              {/* Título + Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <h3 style={{ color: '#6400A4', fontWeight: 600, fontSize: '1.125rem', lineHeight: 1, margin: 0 }}>
                  {client.name}
                </h3>
                <Badge style={{ 
                    backgroundColor: client.status === 'active' ? '#10B981' : '#9CA3AF',
                    color: 'white', border: 'none', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px'
                }}>
                  {client.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
                <div style={{ display: 'flex', alignItems: 'center', color: '#FBBF24', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  <Star size={12} fill="currentColor" style={{ marginRight: '4px' }}/> 
                  {client.rating ? client.rating.toFixed(1) : '5.0'}
                </div>
              </div>

              {/* --- CONTATOS ALINHADOS (Correção Aqui) --- */}
              <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', fontSize: '0.875rem', color: '#4B5563', marginBottom: '8px' }}>
                
                {/* CNPJ: Largura mínima fixa de 180px */}
                <div style={{ minWidth: '180px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={15} style={{ color: '#6400A4', flexShrink: 0 }} /> 
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.cnpj}
                  </span>
                </div>
                
                {/* Email: Largura mínima fixa de 250px */}
                <div style={{ minWidth: '250px', display: 'flex', alignItems: 'center', gap: '6px', marginRight: '16px' }}>
                  <Mail size={15} style={{ color: '#6400A4', flexShrink: 0 }} /> 
                  <span style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={client.email}>
                    {client.email || '-'}
                  </span>
                </div>

                {/* Telefone: O resto do espaço */}
                <div style={{ minWidth: '140px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={15} style={{ color: '#6400A4', flexShrink: 0 }} /> 
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.phone || '-'}
                  </span>
                </div>
              </div>
              
              {/* Endereço */}
              <div style={{ display: 'flex', alignItems: 'start', gap: '6px', color: '#6B7280', fontSize: '0.85rem' }}>
                <MapPin size={15} style={{ color: '#8B20EE', marginTop: '2px', flexShrink: 0 }} /> 
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {formatAddress(client.address)}
                </span>
              </div>

            </div>

            {/* 3. BOTÕES */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button variant="outline" size="sm" onClick={() => onView(client)} 
                style={{ borderColor: '#35BAE6', color: '#35BAE6', height: '32px' }}
                className="hover:bg-blue-50">
                <Eye size={15} style={{ marginRight: '6px' }}/> Ver
              </Button>

              <Button variant="outline" size="sm" onClick={() => onEdit(client)} 
                style={{ borderColor: '#6400A4', color: '#6400A4', height: '32px' }}
                className="hover:bg-purple-50">
                <Edit size={15} style={{ marginRight: '6px' }}/> Editar
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onToggleStatus(client.id, client.status)}
                style={{ 
                  borderColor: client.status === 'active' ? '#F97316' : '#10B981', 
                  color: client.status === 'active' ? '#F97316' : '#10B981',
                  height: '32px'
                }}
                className={client.status === 'active' ? "hover:bg-orange-50" : "hover:bg-green-50"}
              >
                <Power size={15} style={{ marginRight: '6px' }}/> 
                {client.status === 'active' ? 'Desativar' : 'Ativar'}
              </Button>

              {/* Botão Excluir Condicional (Só Admin) */}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={() => onDelete(client)} 
                  style={{ borderColor: '#EF4444', color: '#EF4444', width: '32px', height: '32px', padding: 0 }}
                  className="hover:bg-red-50 flex items-center justify-center">
                  <Trash2 size={15}/>
                </Button>
              )}
            </div>
          </div>
          
          {/* --- RODAPÉ --- */}
          <div style={{ 
              marginTop: '16px', 
              paddingTop: '12px', 
              borderTop: '1px solid #F3F4F6', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: '#6B7280',
              fontWeight: 500
          }}>
             <div style={{ display: 'flex', gap: '30px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Serviços Ativos: <span style={{ color: '#6400A4', fontWeight: 'bold', fontSize: '0.85rem' }}>{client.servicesActive || 0}</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Concluídos: <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.85rem' }}>{client.servicesCompleted || 0}</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9CA3AF' }}>
                  <Calendar size={12} /> Último: {client.lastService || '-'}
               </div>
             </div>

             <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                Total: <span style={{ color: '#6400A4', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {client.totalValue && client.totalValue.includes('R$') ? client.totalValue : `R$ ${client.totalValue || '0,00'}`}
                </span>
             </div>
          </div>

        </div>
      ))}
    </div>
  );
}