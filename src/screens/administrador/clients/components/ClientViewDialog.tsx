import { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Star, Building2, Plus, Edit, Trash2, X } from 'lucide-react';
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
  
  // Estados locais para gestão de unidades
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ClientLocation | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<ClientLocation | null>(null);
  
  // Form da Unidade
  const [unitForm, setUnitForm] = useState({
    name: '',
    address: { street: '', number: '', complement: '', zipCode: '', neighborhood: '', city: '', state: '' },
    area: 'centro',
    isPrimary: false
  });

  const getInitials = (n: string) => n ? n.substring(0, 2).toUpperCase() : '??';
  
  const formatAddress = (addr: any) => {
    if(!addr) return 'Endereço não informado';
    return [addr.street, addr.number, addr.neighborhood, addr.city, addr.state]
      .filter(Boolean).join(', ');
  };

  // --- AÇÕES DE UNIDADE ---
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
            id: `temp-${Date.now()}`,
            ...unitForm
        };
        if (unitForm.isPrimary) {
            newLocations = newLocations.map(l => ({ ...l, isPrimary: false }));
        }
        newLocations.push(newUnit);
    }

    if (onUpdateClientLocations) {
        await onUpdateClientLocations(client.id, newLocations);
    } else {
        toast.warning("Função de salvar unidades não conectada nesta tela.");
    }
    setIsAddUnitOpen(false);
  };

  const handleConfirmDeleteUnit = async () => {
    if (!unitToDelete) return;
    if (onUpdateClientLocations) {
        const newLocations = client.locations?.filter(l => l.id !== unitToDelete.id) || [];
        await onUpdateClientLocations(client.id, newLocations);
    }
    setUnitToDelete(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* CORREÇÃO AQUI:
         - max-w-3xl: Reduz a largura (antes era 4xl) para ficar igual ao protótipo.
         - !top-[10%] !translate-y-0: Fixa o modal no topo da tela, impedindo que ele pule/centralize.
      */}
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col !top-[10%] !translate-y-0" style={{ padding: 0, gap: 0 }}>
        
        {/* CABEÇALHO GERAL */}
        <div className="p-6 pb-2">
            <DialogHeader className="mb-4">
                <DialogTitle style={{ color: '#6400A4', fontSize: '1.25rem', fontWeight: '600' }}>Detalhes do Cliente</DialogTitle>
                <DialogDescription>Informações completas do cliente e unidades.</DialogDescription>
            </DialogHeader>

            {/* CARD DE IDENTIFICAÇÃO (Fundo Lilás) */}
            <div className="flex items-center space-x-4 p-4 rounded-xl border border-purple-100" 
                style={{ backgroundColor: 'rgba(100, 0, 164, 0.05)' }}> 
                
                <Avatar className="h-16 w-16 border-4 border-white shadow-sm" style={{ backgroundColor: '#6400A4' }}>
                    <AvatarFallback style={{ backgroundColor: '#6400A4', color: 'white', fontWeight: '500', fontSize: '1.5rem' }}>
                    {getInitials(client.name)}
                    </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-semibold" style={{ color: '#6400A4' }}>{client.name}</h3>
                        <Badge style={{ 
                            backgroundColor: client.status === 'active' ? '#10B981' : '#9CA3AF',
                            color: 'white', border: 'none', height: '20px', fontWeight: 500
                        }}>
                            {client.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <div className="flex items-center font-medium text-sm" style={{ color: '#FBBF24' }}>
                            <Star size={16} fill="currentColor" className="mr-1"/> 4.8
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">{client.cnpj}</p>
                </div>
            </div>
        </div>

        {/* ABAS (TOGGLE ESTILO IOS/PÍLULA) */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="px-6 mb-2">
            <TabsList className="grid w-full grid-cols-2 p-1.5 h-auto rounded-full" 
                style={{ backgroundColor: 'rgba(100, 0, 164, 0.08)' }}> {/* Fundo Lilás do Container */}
                
                <TabsTrigger 
                    value="info" 
                    className="rounded-full py-2 font-medium transition-all"
                    style={{ 
                        color: activeTab === 'info' ? '#6400A4' : '#6B7280',
                        backgroundColor: activeTab === 'info' ? 'white' : 'transparent',
                        boxShadow: activeTab === 'info' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' // Sombra na pílula ativa
                    }}
                >
                    Informações Gerais
                </TabsTrigger>
                
                <TabsTrigger 
                    value="units" 
                    className="rounded-full py-2 font-medium transition-all"
                    style={{ 
                        color: activeTab === 'units' ? '#6400A4' : '#6B7280',
                        backgroundColor: activeTab === 'units' ? 'white' : 'transparent',
                        boxShadow: activeTab === 'units' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' // Sombra na pílula ativa
                    }}
                >
                    <Building2 className="h-4 w-4 mr-2"/> 
                    Unidades ({client.locations?.length || 0})
                </TabsTrigger>
            </TabsList>
          </div>

          {/* --- CONTEÚDO: INFO --- */}
          <TabsContent value="info" className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            
            {/* 1. Contato */}
            <div>
                <h4 className="mb-3 font-medium" style={{ color: '#6400A4' }}>Informações de Contato</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="p-3 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
                        <div className="p-2 bg-purple-50 rounded-lg"><Mail size={18} style={{ color: '#6400A4' }}/></div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                            <p className="text-sm font-medium text-gray-700 truncate" title={client.email}>{client.email}</p>
                        </div>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-xl flex items-center gap-3 bg-white shadow-sm">
                        <div className="p-2 bg-purple-50 rounded-lg"><Phone size={18} style={{ color: '#6400A4' }}/></div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Telefone</p>
                            <p className="text-sm font-medium text-gray-700">{client.phone}</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-xl flex items-start gap-3 bg-white shadow-sm">
                    <div className="p-2 bg-purple-50 rounded-lg mt-0.5"><MapPin size={18} style={{ color: '#8B20EE' }}/></div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Endereço Principal</p>
                        <p className="text-sm font-medium text-gray-700">{formatAddress(client.address)}</p>
                        <p className="text-xs text-gray-400 mt-1">CEP: {client.address.zipCode}</p>
                    </div>
                </div>
            </div>

            {/* 2. Estatísticas (COM SOMBRA E BORDA COLORIDA) */}
            <div>
                <h4 className="mb-3 font-medium" style={{ color: '#6400A4' }}>Estatísticas de Serviços</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl border-2 bg-white shadow-sm" style={{ borderColor: '#6400A4', boxShadow: '0 4px 12px rgba(100, 0, 164, 0.1)' }}>
                        <p className="text-xs text-gray-500 font-medium mb-1">Ativos</p>
                        <p className="text-2xl font-bold" style={{ color: '#6400A4' }}>{client.servicesActive || 0}</p>
                    </div>
                    <div className="p-4 rounded-xl border-2 bg-white shadow-sm" style={{ borderColor: '#10B981', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)' }}>
                        <p className="text-xs text-gray-500 font-medium mb-1">Concluídos</p>
                        <p className="text-2xl font-bold text-green-600">{client.servicesCompleted || 0}</p>
                    </div>
                    <div className="p-4 rounded-xl border-2 bg-white shadow-sm" style={{ borderColor: '#FBBF24', boxShadow: '0 4px 12px rgba(251, 191, 36, 0.1)' }}>
                        <p className="text-xs text-gray-500 font-medium mb-1">Último</p>
                        <p className="text-sm font-bold text-gray-700 mt-1">{client.lastService || '-'}</p>
                    </div>
                    <div className="p-4 rounded-xl border-2 bg-white shadow-sm" style={{ borderColor: '#35BAE6', boxShadow: '0 4px 12px rgba(53, 186, 230, 0.1)' }}>
                        <p className="text-xs text-gray-500 font-medium mb-1">Total</p>
                        <p className="text-sm font-bold" style={{ color: '#35BAE6' }}>
                             {client.totalValue && client.totalValue.includes('R$') ? client.totalValue : `R$ ${client.totalValue || '0,00'}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Observações */}
            <div>
                <h4 className="mb-2 font-medium" style={{ color: '#6400A4' }}>Observações</h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600 leading-relaxed shadow-inner">
                    {client.notes ? client.notes : <span className="text-gray-400 italic">Nenhuma observação registrada.</span>}
                </div>
            </div>

            <div className="pb-4 text-center">
                {client.createdAt && (
                    <div className="inline-flex items-center space-x-2 text-xs text-gray-400 px-3 py-1 bg-gray-100 rounded-full">
                        <Calendar className="h-3 w-3" />
                        <span>Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                )}
            </div>
          </TabsContent>

          {/* --- CONTEÚDO: UNIDADES --- */}
          <TabsContent value="units" className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
             <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium" style={{ color: '#6400A4' }}>Filiais Cadastradas</h4>
                <Button size="sm" onClick={() => handleOpenUnitForm()} style={{ backgroundColor: '#6400A4' }} className="text-white hover:opacity-90 rounded-full px-4">
                    <Plus className="h-4 w-4 mr-2"/> Nova Unidade
                </Button>
             </div>

             <div className="space-y-3">
                {client.locations?.map(loc => (
                    <div key={loc.id} 
                         className="p-4 border rounded-xl bg-white shadow-sm relative overflow-hidden hover:shadow-md transition-shadow"
                         style={{ borderLeft: `5px solid ${loc.isPrimary ? '#6400A4' : '#35BAE6'}` }}>
                        
                        <div className="pl-2"> 
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <h5 className="font-bold text-gray-800 text-lg">{loc.name}</h5>
                                    {loc.isPrimary && <Badge style={{ backgroundColor: '#6400A4', color: 'white', border: 'none' }}>Principal</Badge>}
                                    <Badge variant="outline" className="capitalize text-gray-500 border-gray-300">{loc.area}</Badge>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenUnitForm(loc)} 
                                        className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50 rounded-full">
                                        <Edit size={16}/>
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setUnitToDelete(loc)}
                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 rounded-full">
                                        <Trash2 size={16}/>
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <MapPin size={16} className="text-[#8B20EE] mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">{formatAddress(loc.address)}</p>
                                    <p className="text-xs text-gray-400 mt-1 font-mono">CEP: {loc.address.zipCode}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {(!client.locations || client.locations.length === 0) && (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Building2 className="h-10 w-10 mx-auto mb-2 text-gray-300"/>
                        <p className="text-gray-500 text-sm">Nenhuma unidade adicional.</p>
                    </div>
                )}
             </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="p-4 border-t bg-gray-50 mt-auto">
           <Button variant="outline" onClick={onClose}>Fechar</Button>
           {activeTab === 'info' && (
               <Button style={{ backgroundColor: '#6400A4', color: 'white' }} onClick={() => { onClose(); onEdit(client); }}>
                   <Edit className="mr-2 h-4 w-4"/> Editar Cliente
               </Button>
           )}
        </DialogFooter>

        {/* Modais Internos (Unidade e Delete) - Mantidos iguais */}
        <Dialog open={isAddUnitOpen} onOpenChange={setIsAddUnitOpen}>
            <DialogContent className="max-w-2xl">
                <DialogHeader><DialogTitle style={{ color: '#6400A4' }}>{editingUnit ? 'Editar Unidade' : 'Nova Unidade'}</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div><Label style={{ color: '#8B20EE' }}>Nome</Label><Input value={unitForm.name} onChange={e => setUnitForm({...unitForm, name: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-gray-500 text-xs">Rua</Label><Input value={unitForm.address.street} onChange={e => setUnitForm({...unitForm, address: {...unitForm.address, street: e.target.value}})} /></div>
                        <div><Label className="text-gray-500 text-xs">Número</Label><Input value={unitForm.address.number} onChange={e => setUnitForm({...unitForm, address: {...unitForm.address, number: e.target.value}})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label className="text-gray-500 text-xs">Bairro</Label><Input value={unitForm.address.neighborhood} onChange={e => setUnitForm({...unitForm, address: {...unitForm.address, neighborhood: e.target.value}})} /></div>
                        <div><Label className="text-gray-500 text-xs">Cidade</Label><Input value={unitForm.address.city} onChange={e => setUnitForm({...unitForm, address: {...unitForm.address, city: e.target.value}})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div><Label className="text-gray-500 text-xs">Estado</Label><Input maxLength={2} value={unitForm.address.state} onChange={e => setUnitForm({...unitForm, address: {...unitForm.address, state: e.target.value.toUpperCase()}})} /></div>
                         <div><Label className="text-gray-500 text-xs">CEP</Label><Input maxLength={9} value={unitForm.address.zipCode} onChange={e => setUnitForm({...unitForm, address: {...unitForm.address, zipCode: e.target.value}})} /></div>
                    </div>
                    <div className="flex items-center gap-2 mt-2"><Switch checked={unitForm.isPrimary} onCheckedChange={c => setUnitForm({...unitForm, isPrimary: c})} /><Label style={{ color: '#6400A4' }}>Unidade Principal?</Label></div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSaveUnit} style={{ backgroundColor: '#6400A4', color: 'white' }}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <AlertDialog open={!!unitToDelete} onOpenChange={() => setUnitToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle className="text-red-600">Excluir Unidade?</AlertDialogTitle></AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDeleteUnit} className="bg-red-600 border-0">Excluir</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </DialogContent>
    </Dialog>
  );
}