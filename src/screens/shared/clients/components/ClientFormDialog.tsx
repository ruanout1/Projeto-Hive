// /shared/clients/components/ClientFormDialog.tsx - VERSÃO FIEL AO PROTÓTIPO
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
        setLocations([{
          id: 'temp-1',
          name: 'Unidade Principal',
          address: { street: '', number: '', complement: '', zipCode: '', neighborhood: '', city: '', state: '' },
          area: 'centro',
          isPrimary: true
        }]);
      }
    }
  }, [isOpen, editingClient]);

  const formatCNPJ = (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  const formatPhone = (v: string) => {
    const r = v.replace(/\D/g, '');
    return r.length > 10 ? r.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : r.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };
  const formatZip = (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');

  const validateCNPJ = (cnpj: string) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  if (cleanCNPJ.length !== 14) return false;
  
  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false;
  
  // Valida dígitos verificadores
  let tamanho = cleanCNPJ.length - 2;
  let numeros = cleanCNPJ.substring(0, tamanho);
  let digitos = cleanCNPJ.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  tamanho = tamanho + 1;
  numeros = cleanCNPJ.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;
  
  return true;
};


  const handleAddLocation = () => {
    setLocations([...locations, {
      id: `temp-${Date.now()}`, 
      name: `Unidade ${locations.length + 1}`, 
      isPrimary: false, 
      area: 'centro',
      address: { street: '', number: '', complement: '', zipCode: '', neighborhood: '', city: '', state: '' }
    }]);
  };

  const handleRemoveLocation = (id: string) => {
    if (locations.length === 1) {
      toast.error('O cliente deve ter pelo menos uma unidade!');
      return;
    }
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!formData.name || !formData.cnpj || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    // Validar CNPJ
    const cleanCNPJ = formData.cnpj.replace(/\D/g, '');
    if (!validateCNPJ(cleanCNPJ)) {
      toast.error('CNPJ inválido!');
    return;
    }

    // Validar endereço principal
    if (!formData.address.street || !formData.address.number || !formData.address.zipCode || 
        !formData.address.neighborhood || !formData.address.city || !formData.address.state) {
      toast.error('Preencha todos os campos obrigatórios do endereço principal!');
      return;
    }

    const success = await onSave({ ...formData, locations }, !!editingClient, editingClient?.id);
    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle style={{ color: '#6400A4', fontSize: '1.25rem', fontWeight: 'bold' }}>
            {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {editingClient 
              ? 'Atualize as informações do cliente abaixo.'
              : 'Preencha os dados do novo cliente para cadastro no sistema.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Nome/Razão Social */}
          <div className="col-span-2">
            <Label htmlFor="name" style={{ color: '#8B20EE' }}>Nome/Razão Social *</Label>
            <Input
              id="name"
              placeholder="Digite o nome do cliente"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* CNPJ e Telefone */}
          <div>
            <Label htmlFor="cnpj" style={{ color: '#8B20EE' }}>CNPJ *</Label>
            <Input
              id="cnpj"
              placeholder="00.000.000/0000-00"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
              maxLength={18}
            />
          </div>

          <div>
            <Label htmlFor="phone" style={{ color: '#8B20EE' }}>Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 00000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              maxLength={15}
            />
          </div>

          {/* Email */}
          <div className="col-span-2">
            <Label htmlFor="email" style={{ color: '#8B20EE' }}>Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="cliente@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* Endereço Principal - ESTILO DO PROTÓTIPO */}
          <div className="col-span-2">
            <Label style={{ color: '#8B20EE' }}>Endereço Principal *</Label>
            <div className="space-y-3 mt-2 p-4 rounded-lg border-2" style={{ borderColor: 'rgba(100, 0, 164, 0.2)', backgroundColor: 'rgba(100, 0, 164, 0.02)' }}>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label className="text-sm text-gray-600">Logradouro/Rua *</Label>
                  <Input
                    placeholder="Nome da rua"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Número *</Label>
                  <Input
                    placeholder="123"
                    value={formData.address.number}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, number: e.target.value } })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-gray-600">Complemento</Label>
                  <Input
                    placeholder="Sala, Bloco, etc."
                    value={formData.address.complement}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, complement: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">CEP *</Label>
                  <Input
                    placeholder="00000-000"
                    value={formData.address.zipCode}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: formatZip(e.target.value) } })}
                    maxLength={9}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm text-gray-600">Setor/Bairro *</Label>
                  <Input
                    placeholder="Nome do bairro"
                    value={formData.address.neighborhood}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, neighborhood: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Cidade *</Label>
                  <Input
                    placeholder="Nome da cidade"
                    value={formData.address.city}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                  />
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Estado *</Label>
                  <Input
                    placeholder="UF (ex: SP)"
                    maxLength={2}
                    value={formData.address.state}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value.toUpperCase() } })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm text-gray-600">Área Geográfica Principal *</Label>
                <Select value={formData.area} onValueChange={(value: any) => setFormData({ ...formData, area: value })}>
                  <SelectTrigger>
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
            </div>
          </div>

          {/* Unidades Adicionais - ESTILO DO PROTÓTIPO */}
          <div className="col-span-2">
            <div className="flex items-center justify-between mb-3">
              <Label style={{ color: '#8B20EE' }}>Unidades/Localizações Adicionais</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLocation}
                style={{ borderColor: '#6400A4', color: '#6400A4' }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Unidade
              </Button>
            </div>
            
            <div className="space-y-3">
              {locations.map((location, index) => (
                <div 
                  key={location.id} 
                  className="p-4 border rounded-lg space-y-3"
                  style={{ 
                    backgroundColor: location.isPrimary ? 'rgba(100, 0, 164, 0.05)' : 'white',
                    borderColor: location.isPrimary ? '#6400A4' : '#e5e7eb'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <Label className="text-sm" style={{ color: '#6400A4' }}>
                      Unidade {index + 1} {location.isPrimary && '(Principal)'}
                    </Label>
                    {!location.isPrimary && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLocation(location.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <Input
                    placeholder="Nome da unidade (ex: Matriz, Filial Centro)"
                    value={location.name}
                    onChange={(e) => handleUpdateLocation(location.id, 'name', e.target.value)}
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Logradouro"
                      value={location.address.street}
                      onChange={(e) => handleUpdateLocation(location.id, 'address.street', e.target.value)}
                      className="col-span-2"
                    />
                    <Input
                      placeholder="Número"
                      value={location.address.number}
                      onChange={(e) => handleUpdateLocation(location.id, 'address.number', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Complemento"
                      value={location.address.complement}
                      onChange={(e) => handleUpdateLocation(location.id, 'address.complement', e.target.value)}
                    />
                    <Input
                      placeholder="CEP"
                      value={location.address.zipCode}
                      onChange={(e) => handleUpdateLocation(location.id, 'address.zipCode', formatZip(e.target.value))}
                      maxLength={9}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Setor/Bairro"
                      value={location.address.neighborhood}
                      onChange={(e) => handleUpdateLocation(location.id, 'address.neighborhood', e.target.value)}
                    />
                    <Input
                      placeholder="Cidade"
                      value={location.address.city}
                      onChange={(e) => handleUpdateLocation(location.id, 'address.city', e.target.value)}
                    />
                    <Input
                      placeholder="UF"
                      value={location.address.state}
                      onChange={(e) => handleUpdateLocation(location.id, 'address.state', e.target.value.toUpperCase())}
                      maxLength={2}
                    />
                  </div>
                  
                  <Select 
                    value={location.area} 
                    onValueChange={(value: any) => handleUpdateLocation(location.id, 'area', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Área Geográfica" />
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
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="col-span-2">
            <Label htmlFor="notes" style={{ color: '#8B20EE' }}>Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações importantes sobre o cliente"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="col-span-2 flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
            />
            <Label htmlFor="status" style={{ color: '#8B20EE' }}>Cliente Ativo</Label>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            style={{ backgroundColor: '#6400A4', color: 'white' }}
          >
            {editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}