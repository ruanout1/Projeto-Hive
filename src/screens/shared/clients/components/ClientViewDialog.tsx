// /shared/clients/components/ClientViewDialog.tsx - VERSÃO CORRIGIDA COM TOGGLE IGUAL AO PROTÓTIPO
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

interface ClientViewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onEdit: (client: Client) => void;
  onUpdateClientLocations?: (clientId: number, locations: ClientLocation[]) => Promise<void>;
}

export function ClientViewDialog({ isOpen, onClose, client, onEdit, onUpdateClientLocations }: ClientViewDialogProps) {
  if (!client) return null;

  const [activeTab, setActiveTab] = useState('info');
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ClientLocation | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<ClientLocation | null>(null);
  
  const [unitForm, setUnitForm] = useState({
    name: '',
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

  const handleOpenUnitForm = (unit?: ClientLocation) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        name: unit.name,
        address: { ...unit.address },
        area: unit.area,
        isPrimary: unit.isPrimary
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        name: '',
        address: { street: '', number: '', complement: '', zipCode: '', neighborhood: '', city: '', state: '' },
        area: 'centro',
        isPrimary: false
      });
    }
    setIsAddUnitOpen(true);
  };

  const handleSaveUnit = async () => {
    if (!unitForm.name || !unitForm.address.street) {
        toast.error("Preencha os campos obrigatórios");
        return;
    }

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

    if (onUpdateClientLocations) {
        await onUpdateClientLocations(client.id, newLocations);
    }
    setIsAddUnitOpen(false);
  };

  const handleConfirmDeleteUnit = async () => {
    if (!unitToDelete || !onUpdateClientLocations) return;
    
    const newLocations = client.locations?.filter(l => l.id !== unitToDelete.id) || [];
    await onUpdateClientLocations(client.id, newLocations);
    setUnitToDelete(null);
  };

  return (
    <>
      {/* Dialog Principal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* ✅ TÍTULO CORRIGIDO - MAIS SUAVE */}
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4', fontSize: '1.25rem', fontWeight: '600' }}>Detalhes do Cliente</DialogTitle>
            <DialogDescription className="text-sm">
              Informações completas do cliente, unidades e histórico de serviços
            </DialogDescription>
          </DialogHeader>

          {/* Header do Cliente - MANTIDO IGUAL */}
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

          {/* Tabs - ✅ TOGGLE CORRIGIDO EXATAMENTE COMO NO PROTÓTIPO */}
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

            {/* Conteúdo - Informações Gerais */}
            <TabsContent value="info" className="flex-1 overflow-y-auto space-y-6 py-4">
              {/* Informações de Contato - MANTIDO IGUAL */}
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

              {/* ✅ CARDS DE ESTATÍSTICAS CORRIGIDOS */}
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

              {/* Observações */}
              {client.notes && (
                <div>
                  <h4 className="mb-3 font-medium" style={{ color: '#6400A4' }}>Observações</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{client.notes}</p>
                  </div>
                </div>
              )}

              {/* ✅ "CLIENTE DESDE" - GARANTIR QUE APAREÇA */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" style={{ color: '#8B20EE' }} />
                <span>Cliente desde {client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : 'data não informada'}</span>
              </div>
            </TabsContent>

            {/* Conteúdo - Unidades */}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUnitToDelete(location)}
                            disabled={location.isPrimary && client.locations?.length === 1}
                            className="hover:bg-red-50"
                            style={{ 
                              borderColor: '#EF4444', 
                              color: '#EF4444',
                              opacity: location.isPrimary && client.locations?.length === 1 ? 0.5 : 1
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

      {/* Dialog para Adicionar/Editar Unidade */}
      <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#6400A4' }}>
              {editingUnit ? 'Editar Unidade' : 'Adicionar Nova Unidade'}
            </DialogTitle>
            <DialogDescription>
              {editingUnit ? 'Atualize as informações da unidade' : 'Cadastre uma nova unidade/filial para este cliente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                onCheckedChange={(checked) => setUnitForm({ ...unitForm, isPrimary: checked })}
              />
              <Label htmlFor="unit-primary" className="cursor-pointer">
                Definir como unidade principal
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
                    onChange={(e) => setUnitForm({
                      ...unitForm,
                      address: { ...unitForm.address, zipCode: e.target.value }
                    })}
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
                  <Input
                    id="unit-state"
                    placeholder="UF (ex: SP)"
                    maxLength={2}
                    value={unitForm.address.state}
                    onChange={(e) => setUnitForm({
                      ...unitForm,
                      address: { ...unitForm.address, state: e.target.value.toUpperCase() }
                    })}
                  />
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

      {/* Dialog de Confirmação de Exclusão de Unidade */}
      <AlertDialog open={!!unitToDelete} onOpenChange={(open) => !open && setUnitToDelete(null)}>
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