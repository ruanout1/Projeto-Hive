// /shared/clients/components/ClientStats.tsx - VERSÃO CORRIGIDA
import { Building, Check, Power, TrendingUp } from 'lucide-react';

interface ClientStatsProps {
  total: number;
  active: number;
  inactive: number;
  revenue: number;
}

export function ClientStats({ total, active, inactive, revenue }: ClientStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total - IDÊNTICO AO PROTÓTIPO */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total de Clientes</p>
            <p className="text-2xl" style={{ color: '#6400A4' }}>{total}</p>
          </div>
          <Building className="h-8 w-8" style={{ color: '#6400A4', opacity: 0.5 }} />
        </div>
      </div>

      {/* Ativos - IDÊNTICO AO PROTÓTIPO */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Clientes Ativos</p>
            <p className="text-2xl text-green-600">{active}</p>
          </div>
          <Check className="h-8 w-8 text-green-500 opacity-50" />
        </div>
      </div>

      {/* Inativos - IDÊNTICO AO PROTÓTIPO */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border-2 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Clientes Inativos</p>
            <p className="text-2xl text-red-600">{inactive}</p>
          </div>
          <Power className="h-8 w-8 text-red-500 opacity-50" />
        </div>
      </div>

      {/* Receita - IDÊNTICO AO PROTÓTIPO */}
      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFFF20' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Receita Total</p>
            <p className="text-2xl text-gray-800">
              R$ {revenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-gray-600 opacity-50" />
        </div>
      </div>
    </div>
  );
}