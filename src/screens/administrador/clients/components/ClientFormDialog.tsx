import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Switch } from '../../../../components/ui/switch';
import { Textarea } from '../../../../components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { Client, ClientLocation } from '../types/client';
import { toast } from 'sonner';

interface ClientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any, isEditing: boolean, id?: number) => Promise<boolean>;
  editingClient: Client | null;
}

export function ClientFormDialog({ isOpen, onClose, onSave, editingClient }: ClientFormDialogProps) {
  const [formData, setFormData] = useState({
    name: '', cnpj: '', email: '', phone: '',
    address: { street: '', number: '', complement: '', zipCode: '', neighborhood: '', city: '', state: '' },
    area: 'centro', notes: '', status: 'active'
  });

  const [locations, setLocations] = useState<ClientLocation[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editingClient) {
        setFormData({
          name: editingClient.name,
          cnpj: editingClient.cnpj,
          email: editingClient.email,
          phone: editingClient.phone,
          address: { ...editingClient.address, complement: editingClient.address.complement || '' },
          area: editingClient.area || 'centro',
          notes: editingClient.notes || '',
          status: editingClient.status || 'active'
        });
        setLocations(editingClient.locations || []);
      } else {
        setFormData({
          name: '', cnpj: '', email: '', phone: '',
          address: { street: '', number: '', complement: '', zipCode: '', neighborhood: '', city: '', state: '' },
          area: 'centro', notes: '', status: 'active'
        });
        setLocations([]);
      }
    }
  }, [isOpen, editingClient]);

  const formatCNPJ = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  const formatPhone = (v: string) => {
    const r = v.replace(/\D/g, '');
    return r.length > 10 ? r.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : r.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };
  const formatZip = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');

  const handleAddLocation = () => {
    setLocations([...locations, {
      id: `temp-${Date.now()}`, 
      name: `Unidade ${locations.length + 2}`, 
      isPrimary: false, 
      area: 'centro',
      address: { street: '', number: '', complement: '', zipCode: '', neighborhood: '', city: '', state: '' }
    }]);
  };

  const handleRemoveLocation = (id: string) => {
    setLocations(locations.filter(l => l.id !== id));
  };

  const handleUpdateLocation = (id: string, field: string, value: any) => {
    setLocations(locations.map(loc => {
      if (loc.id !== id) return loc;
      if (field.includes('address.')) {
        const addrField = field.split('.')[1];
        return { ...loc, address: { ...loc.address, [addrField]: value } };
      }
      return { ...loc, [field]: value };
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault(); 
    if (!formData.name || !formData.cnpj) return toast.error('Preencha os campos obrigatórios');
    const success = await onSave({ ...formData, locations }, !!editingClient, editingClient?.id);
    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle style={{ color: '#6400A4', fontSize: '1.25rem', fontWeight: 'bold' }}>
            {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente para cadastro no sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          
          {/* --- DADOS GERAIS --- */}
          <div className="space-y-2">
            <Label style={{ color: '#8B20EE' }}>Nome/Razão Social *</Label>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Digite o nome do cliente"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label style={{ color: '#8B20EE' }}>CNPJ *</Label>
              <Input value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: formatCNPJ(e.target.value)})} placeholder="00.000.000/0000-00" maxLength={18}/>
            </div>
            <div className="space-y-2">
              <Label style={{ color: '#8B20EE' }}>Telefone</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: formatPhone(e.target.value)})} placeholder="(11) 00000-0000" maxLength={15}/>
            </div>
          </div>

          <div className="space-y-2">
            <Label style={{ color: '#8B20EE' }}>Email *</Label>
            <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="cliente@email.com"/>
          </div>

          {/* --- ENDEREÇO PRINCIPAL --- */}
          <div className="border rounded-lg p-4 border-purple-100 bg-purple-50/30">
            <h4 className="mb-3 text-sm font-bold" style={{ color: '#6400A4' }}>Unidade 1 (Principal)</h4>
            
            <div className="grid grid-cols-4 gap-4 mb-3">
               <div className="col-span-3 space-y-1">
                 <Label className="text-gray-600 text-xs">Logradouro/Rua</Label>
                 <Input value={formData.address.street} onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} />
               </div>
               <div className="col-span-1 space-y-1">
                 <Label className="text-gray-600 text-xs">Número</Label>
                 <Input value={formData.address.number} onChange={e => setFormData({...formData, address: {...formData.address, number: e.target.value}})} />
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
               <div className="space-y-1">
                 <Label className="text-gray-600 text-xs">Complemento</Label>
                 <Input value={formData.address.complement} onChange={e => setFormData({...formData, address: {...formData.address, complement: e.target.value}})} />
               </div>
               <div className="space-y-1">
                 <Label className="text-gray-600 text-xs">CEP</Label>
                 <Input value={formData.address.zipCode} onChange={e => setFormData({...formData, address: {...formData.address, zipCode: formatZip(e.target.value)}})} maxLength={9} />
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-3">
               <div className="space-y-1">
                 <Label className="text-gray-600 text-xs">Bairro</Label>
                 <Input value={formData.address.neighborhood} onChange={e => setFormData({...formData, address: {...formData.address, neighborhood: e.target.value}})} />
               </div>
               <div className="space-y-1">
                 <Label className="text-gray-600 text-xs">Cidade</Label>
                 <Input value={formData.address.city} onChange={e => setFormData({...formData, address: {...formData.address, city: e.target.value}})} />
               </div>
               <div className="space-y-1">
                 <Label className="text-gray-600 text-xs">UF</Label>
                 <Input value={formData.address.state} maxLength={2} onChange={e => setFormData({...formData, address: {...formData.address, state: e.target.value.toUpperCase()}})} />
               </div>
            </div>
            <div className="space-y-1">
              <Label className="text-gray-600 text-xs">Área Geográfica</Label>
              <Select value={formData.area} onValueChange={v => setFormData({...formData, area: v})}>
                <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="norte">Norte</SelectItem>
                  <SelectItem value="sul">Sul</SelectItem>
                  <SelectItem value="leste">Leste</SelectItem>
                  <SelectItem value="oeste">Oeste</SelectItem>
                  <SelectItem value="centro">Centro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* --- UNIDADES ADICIONAIS --- */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <Label style={{ color: '#8B20EE', fontSize: '1rem' }}>Unidades/Localizações Adicionais</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddLocation} 
                  style={{ borderColor: '#6400A4', color: '#6400A4' }}>
                   <Plus size={16} className="mr-1"/> Adicionar Unidade
                </Button>
             </div>
             
             {locations.map((loc, idx) => (
                <div key={loc.id} className="border rounded-lg p-4 border-gray-200 bg-white">
                   
                   {/* CABEÇALHO DA UNIDADE (FLEX PARA SEPARAR TÍTULO E LIXEIRA) */}
                   <div className="flex justify-between items-center mb-3">
                      {/* Nome da unidade roxo */}
                      <span className="text-sm font-bold" style={{ color: '#6400A4' }}>
                        {loc.name}
                      </span>
                      
                      {/* Botão de lixeira alinhado à direita */}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveLocation(loc.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 text-red-500"
                      >
                        <Trash2 size={18} />
                      </Button>
                   </div>

                   <div className="space-y-3">
                       <div className="space-y-1">
                           <Label className="text-xs text-gray-500">Nome da Unidade</Label>
                           <Input value={loc.name} onChange={e => handleUpdateLocation(loc.id, 'name', e.target.value)} placeholder="Ex: Filial Centro"/>
                       </div>

                       <div className="grid grid-cols-4 gap-4">
                            <div className="col-span-3 space-y-1">
                                <Label className="text-xs text-gray-500">Logradouro</Label>
                                <Input value={loc.address.street} onChange={e => handleUpdateLocation(loc.id, 'address.street', e.target.value)}/>
                            </div>
                            <div className="col-span-1 space-y-1">
                                <Label className="text-xs text-gray-500">Número</Label>
                                <Input value={loc.address.number} onChange={e => handleUpdateLocation(loc.id, 'address.number', e.target.value)}/>
                            </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Complemento</Label>
                                <Input value={loc.address.complement} onChange={e => handleUpdateLocation(loc.id, 'address.complement', e.target.value)}/>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">CEP</Label>
                                <Input value={loc.address.zipCode} onChange={e => handleUpdateLocation(loc.id, 'address.zipCode', formatZip(e.target.value))} maxLength={9}/>
                            </div>
                       </div>

                       <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Bairro</Label>
                                <Input value={loc.address.neighborhood} onChange={e => handleUpdateLocation(loc.id, 'address.neighborhood', e.target.value)}/>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">Cidade</Label>
                                <Input value={loc.address.city} onChange={e => handleUpdateLocation(loc.id, 'address.city', e.target.value)}/>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">UF</Label>
                                <Input value={loc.address.state} maxLength={2} onChange={e => handleUpdateLocation(loc.id, 'address.state', e.target.value.toUpperCase())}/>
                            </div>
                       </div>
                        
                       <div className="space-y-1">
                          <Label className="text-xs text-gray-500">Área</Label>
                          <Select value={loc.area} onValueChange={v => handleUpdateLocation(loc.id, 'area', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="norte">Norte</SelectItem>
                                <SelectItem value="sul">Sul</SelectItem>
                                <SelectItem value="leste">Leste</SelectItem>
                                <SelectItem value="oeste">Oeste</SelectItem>
                                <SelectItem value="centro">Centro</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                   </div>
                </div>
             ))}
          </div>

          {/* Observações e Status */}
          <div className="space-y-2 pt-2">
             <Label style={{ color: '#8B20EE' }}>Observações</Label>
             <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Observações importantes..." rows={3} />
          </div>

          <div className="flex items-center space-x-2">
             <Switch checked={formData.status === 'active'} onCheckedChange={c => setFormData({...formData, status: c ? 'active' : 'inactive'})} />
             <Label style={{ color: '#8B20EE' }}>Cliente Ativo</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="button" onClick={handleSubmit} style={{ backgroundColor: '#6400A4', color: 'white' }}>
            {editingClient ? 'Salvar Alterações' : 'Salvar Cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}