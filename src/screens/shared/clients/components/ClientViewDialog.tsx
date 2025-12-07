import { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Star, Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { Avatar, AvatarFallback } from '../../../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/tabs';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Switch } from '../../../../components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Client, ClientLocation } from '../types/client';

// Lista de Estados Brasileiros - ADIÇÃO
const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface ClientViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  
  // Props para gestão de unidades - ATUALIZADO
  canDelete?: boolean;
  onAddLocation?: (clientId: number, data: any) => Promise<boolean>;
  onUpdateLocation?: (clientId: number, locationId: string, data: any) => Promise<boolean>;
  onDeleteLocation?: (locationId: string) => Promise<void>;
  
  // Mantido por compatibilidade se algo ainda usar
  onUpdateClientLocations?: (clientId: number, locations: ClientLocation[]) => Promise<void>;
}

export function ClientViewDialog({ 
    isOpen, onClose, client, onEdit, onUpdateClientLocations,
    canDelete = false, // Padrão false (segurança)
    onDeleteLocation, onAddLocation, onUpdateLocation // Novas props
}: ClientViewDialogProps) {
  
  if (!client) return null;

  const [activeTab, setActiveTab] = useState('info');
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ClientLocation | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<ClientLocation | null>(null);
  
  // ESTADO ATUALIZADO COM OS NOVOS CAMPOS
  const [unitForm, setUnitForm] = useState({
    name: '',
    email: '', // NOVO
    phone: '', // NOVO
    cnpj: '',  // NOVO
    address: { street: '', number: '', complement: '', zipCode: '', neighborhood: '', city: '', state: '' },
    area: 'centro',
    isPrimary: false
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const formatAddress = (addr: any) => {
    if(!addr) return 'Endereço não informado';
    return [addr.street, addr.number, addr.neighborhood, addr.city, addr.state]
      .filter(Boolean).join(', ');
  };

  // FUNÇÃO ATUALIZADA PARA PREENCHER OS NOVOS CAMPOS
  const handleOpenUnitForm = (unit?: ClientLocation) => {
    if (unit) {
      console.log("🔍 DEBUG - Editando unidade:", unit); // ADICIONE ESTE LOG
    console.log("🔍 DEBUG - Email da unidade:", unit.email); // ADICIONE ESTE LOG
    console.log("🔍 DEBUG - Telefone da unidade:", unit.phone); // ADICIONE ESTE LOG
    console.log("🔍 DEBUG - CNPJ da unidade:", unit.cnpj); // ADICIONE ESTE LOG
      setEditingUnit(unit);
      setUnitForm({
        name: unit.name,
        email: unit.email || '', // NOVO
        phone: unit.phone || '', // NOVO
        cnpj: unit.cnpj || '',   // NOVO
        address: { ...unit.address },
        area: unit.area,
        isPrimary: unit.isPrimary
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        name: '',
        email: '', // NOVO
        phone: '', // NOVO
        cnpj: '',  // NOVO
        address: { street: '', number: '', complement: '', zipCode: '', neighborhood: '', city: '', state: '' },
        area: 'centro',
        isPrimary: false
      });
    }
    setIsAddUnitOpen(true);
  };

  // --- LÓGICA DE SALVAR SIMPLIFICADA ---
const handleSaveUnit = async () => {
  console.log("💾 Salvando unidade com dados:", unitForm); // <-- ADICIONE
  console.log("É principal?", unitForm.isPrimary); // <-- ADICIONE
  if (!unitForm.name || !unitForm.address.street) {
    toast.error("Preencha os campos obrigatórios");
    return;
  }

  try {
    // Se é EDIÇÃO (tem ID) e temos a função específica
    if (editingUnit && onUpdateLocation) {
      // AGORA SIMPLIFICADO: O backend deve cuidar de desmarcar outras unidades principais
      await onUpdateLocation(client.id, editingUnit.id, unitForm);
      toast.success("Unidade atualizada com sucesso!");
    } 
    // Se é CRIAÇÃO (Novo) e temos a função específica
    else if (onAddLocation) {
      // O backend deve cuidar de verificar se já existe uma principal
      await onAddLocation(client.id, unitForm);
      toast.success("Unidade criada com sucesso!");
    }
    // Fallback para lógica antiga se as novas funções não existirem
    else if (onUpdateClientLocations) {
      let newLocations = [...(client.locations || [])];

      if (editingUnit) {
        newLocations = newLocations.map(loc => 
          loc.id === editingUnit.id 
          ? { ...loc, ...unitForm, id: loc.id }
          : unitForm.isPrimary ? { ...loc, isPrimary: false } : loc
        );
      } else {
        const newUnit: ClientLocation = {
          id: `loc-${Date.now()}`,
          ...unitForm
        };
        if (unitForm.isPrimary) {
          newLocations = newLocations.map(l => ({ ...l, isPrimary: false }));
        }
        newLocations.push(newUnit);
      }

      await onUpdateClientLocations(client.id, newLocations);
      toast.success("Unidade salva com sucesso!");
    }

    setIsAddUnitOpen(false);
  } catch (error: any) {
    console.error("Erro ao salvar unidade:", error);
    toast.error(`Erro ao salvar unidade: ${error.message || 'Erro desconhecido'}`);
  }
};

  const handleConfirmDeleteUnit = async () => {
    if (!unitToDelete) return;
    
    try {
      // SE TIVERMOS A FUNÇÃO DE DELETE DIRETO (CORRETO), USAMOS ELA
      if (onDeleteLocation) {
          await onDeleteLocation(unitToDelete.id);
          toast.success("Unidade excluída com sucesso!");
      } 
      // FALLBACK PARA O UPDATE DA LISTA (LEGADO)
      else if (onUpdateClientLocations) {
          const newLocations = client.locations?.filter(l => l.id !== unitToDelete.id) || [];
          await onUpdateClientLocations(client.id, newLocations);
          toast.success("Unidade excluída com sucesso!");
      }
      
      setUnitToDelete(null);
    } catch (error: any) {
      console.error("Erro ao excluir unidade:", error);
      toast.error(`Erro ao excluir unidade: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Helper para máscara de CEP - ADIÇÃO
  const handleZipCodeChange = (value: string) => {
      // Remove tudo que não é dígito
      let v = value.replace(/\D/g, "");
      // Limita a 8 dígitos
      if (v.length > 8) v = v.slice(0, 8);
      // Aplica máscara XXXXX-XXX
      if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, "$1-$2");
      
      setUnitForm({ ...unitForm, address: { ...unitForm.address, zipCode: v }});
  };

  // Helper para máscara de CNPJ - NOVO
  const handleCnpjChange = (value: string) => {
    // Remove tudo que não é dígito
    let v = value.replace(/\D/g, "");
    // Limita a 14 dígitos
    if (v.length > 14) v = v.slice(0, 14);
    // Aplica máscara XX.XXX.XXX/XXXX-XX
    if (v.length > 12) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, "$1.$2.$3/$4-$5");
    else if (v.length > 8) v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4}).*/, "$1.$2.$3/$4");
    else if (v.length > 5) v = v.replace(/^(\d{2})(\d{3})(\d{1,3}).*/, "$1.$2.$3");
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{1,3}).*/, "$1.$2");
    
    setUnitForm({ ...unitForm, cnpj: v });
  };

  // Helper para máscara de Telefone - NOVO
  const handlePhoneChange = (value: string) => {
    // Remove tudo que não é dígito
    let v = value.replace(/\D/g, "");
    
    // Aplica máscara baseada no tamanho
    if (v.length <= 10) { // Telefone fixo (XX) XXXX-XXXX
      if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,4}).*/, "($1) $2");
      else if (v.length > 0) v = v.replace(/^(\d{0,2}).*/, "($1");
    } else { // Celular (XX) 9XXXX-XXXX
      v = v.substring(0, 11);
      if (v.length > 7) v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{0,4}).*/, "($1) $2 $3-$4");
      else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,1})(\d{0,4}).*/, "($1) $2 $3");
    }
    
    setUnitForm({ ...unitForm, phone: v });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4', fontSize: '1.25rem', fontWeight: '600' }}>Detalhes do Cliente</DialogTitle>
            <DialogDescription className="text-sm">
              Informações completas do cliente, unidades e histórico de serviços
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center space-x-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}>
            <Avatar className="h-16 w-16" style={{ backgroundColor: '#6400A4' }}>
              <AvatarFallback style={{ 
                backgroundColor: '#6400A4', 
                color: 'white', 
                fontSize: '1.25rem', 
                fontWeight: 'bold' 
              }}>
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold" style={{ color: '#6400A4' }}>{client.name}</h3>
              <p className="text-sm text-gray-600">{client.cnpj}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  style={client.status === 'active' 
                    ? { backgroundColor: '#10B981', color: 'white' } 
                    : { backgroundColor: '#9CA3AF', color: 'white' }}
                >
                  {client.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
                {client.rating > 0 && (
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{client.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2" style={{ backgroundColor: 'rgba(100, 0, 164, 0.1)' }}>
              <TabsTrigger 
                value="info"
                style={{ 
                  color: activeTab === 'info' ? '#6400A4' : '#6B7280',
                  borderBottom: activeTab === 'info' ? '2px solid #6400A4' : 'none'
                }}
              >
                Informações Gerais
              </TabsTrigger>
              <TabsTrigger 
                value="units"
                style={{ 
                  color: activeTab === 'units' ? '#6400A4' : '#6B7280',
                  borderBottom: activeTab === 'units' ? '2px solid #6400A4' : 'none'
                }}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Unidades ({client.locations?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="flex-1 overflow-y-auto space-y-6 py-4">
              <div>
                <h4 className="mb-3 font-medium" style={{ color: '#6400A4' }}>Informações de Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5" style={{ color: '#6400A4' }} />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{client.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5" style={{ color: '#6400A4' }} />
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="text-sm font-medium text-gray-900">{client.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg mt-4">
                  <MapPin className="h-5 w-5 mt-0.5" style={{ color: '#8B20EE' }} />
                  <div>
                    <p className="text-xs text-gray-500">Endereço Principal</p>
                    <p className="text-sm font-medium text-gray-900">{formatAddress(client.address)}</p>
                    <p className="text-xs text-gray-500 mt-1">CEP: {client.address.zipCode}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-medium" style={{ color: '#6400A4' }}>Estatísticas de Serviços</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#6400A4' }}>
                    <p className="text-xs text-gray-500">Serviços Ativos</p>
                    <p className="text-2xl font-bold" style={{ color: '#6400A4' }}>{client.servicesActive || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
                    <p className="text-xs text-gray-500">Concluídos</p>
                    <p className="text-2xl font-bold text-green-600">{client.servicesCompleted || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2" style={{ borderColor: '#FFFF20' }}>
                    <p className="text-xs text-gray-500">Último Serviço</p>
                    <p className="text-sm font-bold text-gray-800">{client.lastService || '-'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
                    <p className="text-xs text-gray-500">Receita Total</p>
                    <p className="text-sm font-bold" style={{ color: '#35BAE6' }}>
                      {client.totalValue && client.totalValue.includes('R$') ? client.totalValue : `R$ ${client.totalValue || '0,00'}`}
                    </p>
                  </div>
                </div>
              </div>

              {client.notes && (
                <div>
                  <h4 className="mb-3 font-medium" style={{ color: '#6400A4' }}>Observações</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{client.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" style={{ color: '#8B20EE' }} />
                <span>Cliente desde {client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : 'data não informada'}</span>
              </div>
            </TabsContent>

            <TabsContent value="units" className="flex-1 overflow-y-auto space-y-4 py-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Gerencie as unidades e filiais deste cliente
                </p>
                <Button
                  onClick={() => handleOpenUnitForm()}
                  style={{ backgroundColor: '#6400A4', color: 'white' }}
                  className="hover:opacity-90"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Unidade
                </Button>
              </div>

              {client.locations && client.locations.length > 0 ? (
                <div className="space-y-3">
                  {client.locations.map((location) => (
                    <div 
                      key={location.id} 
                      className="p-4 bg-gray-50 rounded-lg border-l-4 hover:bg-gray-100 transition-colors" 
                      style={{ borderLeftColor: location.isPrimary ? '#6400A4' : '#35BAE6' }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 style={{ color: '#6400A4' }} className="font-semibold">{location.name}</h5>
                            {location.isPrimary && (
                              <Badge style={{ backgroundColor: '#6400A4', color: 'white' }}>Principal</Badge>
                            )}
                            <Badge variant="outline" style={{ borderColor: '#35BAE6', color: '#35BAE6' }}>
                              {location.area.charAt(0).toUpperCase() + location.area.slice(1)}
                            </Badge>
                          </div>
                          {/* MOSTRAR OS NOVOS CAMPOS NA LISTA - NOVO */}
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                            {location.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{location.email}</span>
                              </div>
                            )}
                            {location.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{location.phone}</span>
                              </div>
                            )}
                            {location.cnpj && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">CNPJ:</span>
                                <span>{location.cnpj}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenUnitForm(location)}
                            style={{ borderColor: '#6400A4', color: '#6400A4' }}
                            className="hover:bg-purple-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {/* LÓGICA DA LIXEIRA - ATUALIZADA */}
                          {canDelete && (
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                    // Regra: Se for Principal, avisa. Se for a única, bloqueia.
                                    if (client.locations && client.locations.length === 1) {
                                        toast.error("Você não pode excluir a única unidade do cliente.");
                                        return;
                                    }
                                    
                                    if (location.isPrimary) {
                                        toast.warning("Não é possível excluir a unidade Principal (Matriz).", {
                                            description: "Edite outra unidade e marque-a como 'Principal' antes de excluir esta."
                                        });
                                        return;
                                    }

                                    // Se passou, abre confirmação
                                    setUnitToDelete(location);
                                }} 
                                // Removemos o 'disabled' antigo para permitir o clique e mostrar o aviso
                                className="hover:bg-red-50" 
                                style={{ 
                                    borderColor: '#EF4444', 
                                    color: '#EF4444',
                                    // Opacidade visual para indicar que Matriz é especial, mas clicável para ver o aviso
                                    opacity: location.isPrimary ? 0.6 : 1 
                                }}
                             >
                                <Trash2 className="h-4 w-4" />
                             </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#8B20EE' }} />
                        <div>
                          <p>{formatAddress(location.address)}</p>
                          <p className="text-xs text-gray-500 mt-1">CEP: {location.address.zipCode}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: '#6400A4' }} />
                  <p className="text-gray-500 mb-4">Nenhuma unidade cadastrada</p>
                  <Button
                    onClick={() => handleOpenUnitForm()}
                    style={{ backgroundColor: '#6400A4', color: 'white' }}
                    className="hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Unidade
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            {activeTab === 'info' && (
              <Button
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                onClick={() => { onClose(); onEdit(client); }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Cliente
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

            <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
  <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
    <DialogHeader>
      <DialogTitle style={{ color: '#6400A4' }}>
        {editingUnit ? 'Editar Unidade' : 'Adicionar Nova Unidade'}
      </DialogTitle>
      <DialogDescription>
        {editingUnit ? 'Atualize as informações da unidade' : 'Cadastre uma nova unidade/filial para este cliente'}
      </DialogDescription>
    </DialogHeader>

    <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
      <div>
        <Label htmlFor="unit-name">Nome da Unidade *</Label>
        <Input
          id="unit-name"
          placeholder="Ex: Matriz, Filial Centro, etc."
          value={unitForm.name}
          onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="unit-cnpj">CNPJ da Filial</Label>
        <Input 
          id="unit-cnpj"
          placeholder="XX.XXX.XXX/XXXX-XX"
          value={unitForm.cnpj}
          onChange={e => handleCnpjChange(e.target.value)}
          maxLength={18}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unit-email">Email da Filial</Label>
          <Input 
            id="unit-email"
            type="email"
            placeholder="filial@empresa.com"
            value={unitForm.email}
            onChange={e => setUnitForm({...unitForm, email: e.target.value})}
          />
        </div>
        <div>
          <Label htmlFor="unit-phone">Telefone</Label>
          <Input 
            id="unit-phone"
            placeholder="(XX) X XXXX-XXXX"
            value={unitForm.phone}
            onChange={e => handlePhoneChange(e.target.value)}
            maxLength={15}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="unit-area">Área de Atendimento *</Label>
        <Select
          value={unitForm.area}
          onValueChange={(value: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro') => 
            setUnitForm({ ...unitForm, area: value })
          }
        >
          <SelectTrigger id="unit-area">
            <SelectValue placeholder="Selecione a área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="norte">Norte</SelectItem>
            <SelectItem value="sul">Sul</SelectItem>
            <SelectItem value="leste">Leste</SelectItem>
            <SelectItem value="oeste">Oeste</SelectItem>
            <SelectItem value="centro">Centro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <Switch
          id="unit-primary"
          checked={unitForm.isPrimary}
          onCheckedChange={(checked) => {
            // Aviso se estiver desmarcando uma unidade principal existente
            if (editingUnit?.isPrimary && !checked) {
              toast.warning("Você está desmarcando a unidade principal.", {
                description: "Recomenda-se marcar outra unidade como principal antes de desmarcar esta."
              });
            }
            setUnitForm({ ...unitForm, isPrimary: checked });
          }}
        />
        <Label htmlFor="unit-primary" className="cursor-pointer">
          Definir como unidade principal
          {unitForm.isPrimary && (
            <span className="ml-2 text-xs text-purple-600 font-semibold">
              (Todas as outras unidades serão desmarcadas como principal)
            </span>
          )}
        </Label>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h4 className="text-sm font-medium" style={{ color: '#6400A4' }}>Endereço da Unidade</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="unit-street">Logradouro/Rua *</Label>
            <Input
              id="unit-street"
              placeholder="Nome da rua"
              value={unitForm.address.street}
              onChange={(e) => setUnitForm({
                ...unitForm,
                address: { ...unitForm.address, street: e.target.value }
              })}
            />
          </div>

          <div>
            <Label htmlFor="unit-number">Número *</Label>
            <Input
              id="unit-number"
              placeholder="123"
              value={unitForm.address.number}
              onChange={(e) => setUnitForm({
                ...unitForm,
                address: { ...unitForm.address, number: e.target.value }
              })}
            />
          </div>

          <div>
            <Label htmlFor="unit-complement">Complemento</Label>
            <Input
              id="unit-complement"
              placeholder="Sala, Bloco, etc."
              value={unitForm.address.complement}
              onChange={(e) => setUnitForm({
                ...unitForm,
                address: { ...unitForm.address, complement: e.target.value }
              })}
            />
          </div>

          <div>
            <Label htmlFor="unit-zipCode">CEP *</Label>
            <Input
              id="unit-zipCode"
              placeholder="00000-000"
              value={unitForm.address.zipCode}
              onChange={(e) => handleZipCodeChange(e.target.value)}
              maxLength={9}
            />
          </div>

          <div>
            <Label htmlFor="unit-neighborhood">Setor/Bairro *</Label>
            <Input
              id="unit-neighborhood"
              placeholder="Nome do bairro"
              value={unitForm.address.neighborhood}
              onChange={(e) => setUnitForm({
                ...unitForm,
                address: { ...unitForm.address, neighborhood: e.target.value }
              })}
            />
          </div>

          <div>
            <Label htmlFor="unit-city">Cidade *</Label>
            <Input
              id="unit-city"
              placeholder="Nome da cidade"
              value={unitForm.address.city}
              onChange={(e) => setUnitForm({
                ...unitForm,
                address: { ...unitForm.address, city: e.target.value }
              })}
            />
          </div>

          <div>
            <Label htmlFor="unit-state">Estado *</Label>
            <Select
              value={unitForm.address.state}
              onValueChange={(value) => setUnitForm({
                ...unitForm,
                address: { ...unitForm.address, state: value }
              })}
            >
              <SelectTrigger id="unit-state">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {BR_STATES.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUnitOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveUnit}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
            >
              {editingUnit ? 'Salvar Alterações' : 'Adicionar Unidade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!unitToDelete} onOpenChange={(open: boolean) => !open && setUnitToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#6400A4' }}>Confirmar Exclusão de Unidade</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a unidade <strong>{unitToDelete?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteUnit}
              style={{ backgroundColor: '#EF4444', color: 'white' }}
              className="hover:opacity-90"
            >
              Excluir Unidade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}