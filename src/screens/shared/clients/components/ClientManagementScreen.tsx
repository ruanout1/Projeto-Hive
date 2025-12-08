// src\screens\shared\clients\components\ClientManagementScreen.tsx - VERSÃO CORRIGIDA
import { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, Phone, Mail, MapPin, FileText, ArrowLeft, Building2, Star, CheckCircle, Save, X, Power } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../../components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Client, ClientLocation } from '../types/client';

interface ClientManagementScreenProps {
  client: Client;
  onBack: () => void;
  onSaveClient: (clientData: any) => Promise<boolean>;
  onAddLocation: (clientId: number, locationData: any) => Promise<boolean>;
  onUpdateLocation: (clientId: number, locationId: string, locationData: any) => Promise<boolean>;
  onDeleteLocation: (clientId: number, locationId: string) => Promise<void>;
  onToggleClientStatus: (id: number, currentStatus: string) => Promise<boolean>;
  userRole?: 'admin' | 'manager';
}

const BR_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export function ClientManagementScreen({ 
  client, 
  onBack, 
  onSaveClient, 
  onAddLocation, 
  onUpdateLocation, 
  onDeleteLocation,
  onToggleClientStatus,
  userRole = 'admin'
}: ClientManagementScreenProps) {
  const [currentClient, setCurrentClient] = useState<Client>(client);
  const [editedClient, setEditedClient] = useState<Client>(client);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editingLocation, setEditingLocation] = useState<ClientLocation | null>(null);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const [newLocation, setNewLocation] = useState<Omit<ClientLocation, 'id'>>({
    name: '',
    cnpj: '',
    email: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      zipCode: '',
      neighborhood: '',
      city: '',
      state: ''
    },
    area: 'centro',
    isPrimary: false
  });

  const canEditClient = userRole === 'admin' || userRole === 'manager';
  const canDeleteLocation = userRole === 'admin';
  const canAddLocation = userRole === 'admin' || userRole === 'manager';

  useEffect(() => {
    setCurrentClient(client);
    setEditedClient(client);
  }, [client]);

  const refreshClientData = () => {
    return;
  };

  const handleSaveClient = async () => {
    try {
      const clientData = {
        name: editedClient.name,
        cnpj: editedClient.cnpj,
        email: editedClient.email,
        phone: editedClient.phone,
        address: editedClient.address,
        area: editedClient.area,
        notes: editedClient.notes || '',
        status: editedClient.status
      };

      const success = await onSaveClient(clientData);
      if (success) {
        setCurrentClient(editedClient);
        setIsEditing(false);
        toast.success('Dados do cliente atualizados com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar alterações do cliente');
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.name.trim()) {
      toast.error('Nome da unidade é obrigatório');
      return;
    }

    if (!newLocation.address.street || !newLocation.address.number || !newLocation.address.zipCode || 
        !newLocation.address.neighborhood || !newLocation.address.city || !newLocation.address.state) {
      toast.error('Preencha todos os campos obrigatórios do endereço');
      return;
    }

    try {
      const success = await onAddLocation(currentClient.id, {
        ...newLocation,
        isPrimary: newLocation.isPrimary
      });

      if (success) {
        if (newLocation.isPrimary) {
          const updatedLocations = currentClient.locations?.map(loc => ({
            ...loc,
            isPrimary: false
          })) || [];
          
          setCurrentClient({
            ...currentClient,
            locations: [
              ...updatedLocations,
              {
                id: `temp-${Date.now()}`,
                ...newLocation,
                isPrimary: true
              }
            ]
          });
        } else {
          setCurrentClient({
            ...currentClient,
            locations: [
              ...(currentClient.locations || []),
              {
                id: `temp-${Date.now()}`,
                ...newLocation,
                isPrimary: false
              }
            ]
          });
        }

        setNewLocation({
          name: '',
          cnpj: '',
          email: '',
          phone: '',
          address: {
            street: '',
            number: '',
            complement: '',
            zipCode: '',
            neighborhood: '',
            city: '',
            state: ''
          },
          area: 'centro',
          isPrimary: false
        });
        
        setIsAddingLocation(false);
        toast.success('Unidade adicionada com sucesso!');
        refreshClientData();
      }
    } catch (error) {
      console.error('Erro ao adicionar unidade:', error);
      toast.error('Erro ao adicionar unidade');
    }
  };

  const handleEditLocation = (location: ClientLocation) => {
    setEditingLocation({ ...location });
  };

  const handleSaveEditedLocation = async () => {
    if (!editingLocation) return;

    try {
      const success = await onUpdateLocation(currentClient.id, editingLocation.id, {
        name: editingLocation.name,
        cnpj: editingLocation.cnpj,
        email: editingLocation.email,
        phone: editingLocation.phone,
        address: editingLocation.address,
        area: editingLocation.area,
        isPrimary: editingLocation.isPrimary
      });

      if (success) {
        const updatedLocations = currentClient.locations?.map(loc => {
          if (loc.id === editingLocation.id) {
            return editingLocation;
          }
          if (editingLocation.isPrimary && loc.id !== editingLocation.id) {
            return { ...loc, isPrimary: false };
          }
          return loc;
        }) || [];

        setCurrentClient({
          ...currentClient,
          locations: updatedLocations
        });

        setEditingLocation(null);
        toast.success('Unidade atualizada com sucesso!');
        refreshClientData();
      }
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      toast.error('Erro ao atualizar unidade');
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!locationId) return;

    try {
      await onDeleteLocation(currentClient.id, locationId);
      
      const updatedLocations = currentClient.locations?.filter(loc => loc.id !== locationId) || [];
      setCurrentClient({
        ...currentClient,
        locations: updatedLocations
      });

      toast.success('Unidade removida com sucesso!');
      setLocationToDelete(null);
      refreshClientData();
    } catch (error) {
      console.error('Erro ao remover unidade:', error);
      toast.error('Erro ao remover unidade');
    }
  };

  const handleSetPrimaryLocation = async (location: ClientLocation) => {
    try {
      const updatedLocations = currentClient.locations?.map(loc => ({
        ...loc,
        isPrimary: loc.id === location.id
      })) || [];

      setCurrentClient({
        ...currentClient,
        locations: updatedLocations
      });

      const success = await onUpdateLocation(currentClient.id, location.id, {
        ...location,
        isPrimary: true
      });

      if (!success) {
        toast.error('Erro ao definir unidade principal');
      } else {
        toast.success('Unidade principal atualizada!');
      }
      
      refreshClientData();
    } catch (error) {
      console.error('Erro ao definir unidade principal:', error);
      toast.error('Erro ao definir unidade principal');
    }
  };

  const handleToggleStatus = async () => {
    try {
      setIsSavingStatus(true);
      const success = await onToggleClientStatus(currentClient.id, currentClient.status);
      
      if (success) {
        const newStatus = currentClient.status === 'active' ? 'inactive' : 'active';
        setCurrentClient({
          ...currentClient,
          status: newStatus
        });
        setEditedClient({
          ...editedClient,
          status: newStatus
        });
        
        toast.success(`Cliente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do cliente');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatZipCode = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const areaColors = {
    norte: '#EF4444',
    sul: '#10B981',
    leste: '#F59E0B',
    oeste: '#3B82F6',
    centro: '#8B5CF6'
  };

  const areaLabels = {
    norte: 'Norte',
    sul: 'Sul',
    leste: 'Leste',
    oeste: 'Oeste',
    centro: 'Centro'
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const ScreenHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold" style={{ color: '#6400A4' }}>{title}</h1>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <ScreenHeader 
        title={`Gestão de unidades`}
        onBack={onBack}
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: areaColors[currentClient.area] }}
                >
                  <Building className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl mb-2" style={{ color: '#6400A4' }}>{currentClient.name}</h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{currentClient.cnpj}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <span>{currentClient.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{currentClient.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge style={{ backgroundColor: areaColors[currentClient.area], color: 'white' }}>
                      {areaLabels[currentClient.area]}
                    </Badge>
                    <Badge 
                      variant={currentClient.status === 'active' ? 'default' : 'secondary'}
                      style={currentClient.status === 'active' ? { backgroundColor: '#10B981', color: 'white' } : { backgroundColor: '#9CA3AF', color: 'white' }}
                    >
                      {currentClient.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {currentClient.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{currentClient.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <p className="text-sm text-gray-600">Total de Unidades</p>
                <p className="text-3xl" style={{ color: '#6400A4' }}>{currentClient.locations?.length || 0}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleStatus}
                  disabled={isSavingStatus}
                  style={{
                    borderColor: currentClient.status === 'active' ? '#EF4444' : '#10B981',
                    color: currentClient.status === 'active' ? '#EF4444' : '#10B981'
                  }}
                  className="mt-2"
                >
                  <Power className="h-4 w-4 mr-2" />
                  {isSavingStatus ? 'Processando...' : 
                   currentClient.status === 'active' ? 'Desativar Cliente' : 'Ativar Cliente'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações Gerais</TabsTrigger>
            <TabsTrigger value="locations">Unidades ({currentClient.locations?.length || 0})</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg" style={{ color: '#6400A4' }}>Dados do Cliente</h3>
                  {canEditClient && (
                    !isEditing ? (
                      <Button
                        onClick={() => setIsEditing(true)}
                        style={{ backgroundColor: '#6400A4', color: 'white' }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditedClient(currentClient);
                            setIsEditing(false);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveClient}
                          style={{ backgroundColor: '#10B981', color: 'white' }}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Salvar
                        </Button>
                      </div>
                    )
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Nome do Cliente *</Label>
                    <Input
                      value={editedClient.name}
                      onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label>CNPJ Principal *</Label>
                    <Input
                      value={editedClient.cnpj}
                      onChange={(e) => setEditedClient({ ...editedClient, cnpj: formatCNPJ(e.target.value) })}
                      disabled={!isEditing}
                      maxLength={18}
                    />
                  </div>

                  <div>
                    <Label>Email Principal *</Label>
                    <Input
                      type="email"
                      value={editedClient.email}
                      onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <Label>Telefone Principal</Label>
                    <Input
                      value={editedClient.phone}
                      onChange={(e) => setEditedClient({ ...editedClient, phone: formatPhone(e.target.value) })}
                      disabled={!isEditing}
                      maxLength={15}
                    />
                  </div>

                  <div>
                    <Label>Área Principal</Label>
                    <Select
                      value={editedClient.area}
                      onValueChange={(value: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro') => 
                        setEditedClient({ ...editedClient, area: value })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
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

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={editedClient.status}
                      onValueChange={(value: 'active' | 'inactive') => 
                        setEditedClient({ ...editedClient, status: value })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={editedClient.notes || ''}
                      onChange={(e) => setEditedClient({ ...editedClient, notes: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Observações adicionais sobre o cliente..."
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="mb-4" style={{ color: '#6400A4' }}>Endereço Principal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label>Logradouro/Rua *</Label>
                      <Input
                        value={editedClient.address.street}
                        onChange={(e) => setEditedClient({
                          ...editedClient,
                          address: { ...editedClient.address, street: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>Número *</Label>
                      <Input
                        value={editedClient.address.number}
                        onChange={(e) => setEditedClient({
                          ...editedClient,
                          address: { ...editedClient.address, number: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>CEP *</Label>
                      <Input
                        value={editedClient.address.zipCode}
                        onChange={(e) => setEditedClient({
                          ...editedClient,
                          address: { ...editedClient.address, zipCode: formatZipCode(e.target.value) }
                        })}
                        disabled={!isEditing}
                        maxLength={9}
                      />
                    </div>

                    <div>
                      <Label>Setor/Bairro *</Label>
                      <Input
                        value={editedClient.address.neighborhood}
                        onChange={(e) => setEditedClient({
                          ...editedClient,
                          address: { ...editedClient.address, neighborhood: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>Complemento</Label>
                      <Input
                        value={editedClient.address.complement || ''}
                        onChange={(e) => setEditedClient({
                          ...editedClient,
                          address: { ...editedClient.address, complement: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>Cidade *</Label>
                      <Input
                        value={editedClient.address.city}
                        onChange={(e) => setEditedClient({
                          ...editedClient,
                          address: { ...editedClient.address, city: e.target.value }
                        })}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label>Estado *</Label>
                      <Select
                        value={editedClient.address.state}
                        onValueChange={(value) => setEditedClient({
                          ...editedClient,
                          address: { ...editedClient.address, state: value }
                        })}
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            
            {canAddLocation && (
                <Button
                onClick={() => setIsAddingLocation(true)}
                style={{ backgroundColor: '#6400A4', color: 'white' }}
                >
                <Plus className="h-4 w-4 mr-2" />
                Nova Unidade
                </Button>
            )}
            </div>

            {isAddingLocation && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 style={{ color: '#6400A4' }}>Adicionar Nova Unidade</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingLocation(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome da Unidade *</Label>
                        <Input
                          value={newLocation.name}
                          onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                          placeholder="Ex: Matriz, Filial Centro, etc"
                        />
                      </div>

                      <div>
                        <Label>CNPJ da Unidade</Label>
                        <Input
                          value={newLocation.cnpj}
                          onChange={(e) => setNewLocation({ ...newLocation, cnpj: formatCNPJ(e.target.value) })}
                          placeholder="00.000.000/0000-00"
                          maxLength={18}
                        />
                      </div>

                      <div>
                        <Label>Email da Unidade</Label>
                        <Input
                          type="email"
                          value={newLocation.email}
                          onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                          placeholder="email@unidade.com"
                        />
                      </div>

                      <div>
                        <Label>Telefone da Unidade</Label>
                        <Input
                          value={newLocation.phone}
                          onChange={(e) => setNewLocation({ ...newLocation, phone: formatPhone(e.target.value) })}
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                        />
                      </div>

                      <div>
                        <Label>Área *</Label>
                        <Select
                          value={newLocation.area}
                          onValueChange={(value: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro') => 
                            setNewLocation({ ...newLocation, area: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
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

                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          id="isPrimary"
                          checked={newLocation.isPrimary}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setNewLocation({ ...newLocation, isPrimary: isChecked });
                            if (isChecked) {
                              toast.info('As outras unidades serão desmarcadas como principal automaticamente.');
                            }
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <Label htmlFor="isPrimary" className="cursor-pointer font-medium">
                          Definir como unidade principal
                        </Label>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h5 className="mb-4 text-sm" style={{ color: '#6400A4' }}>Endereço da Unidade</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <Label>Logradouro/Rua *</Label>
                          <Input
                            value={newLocation.address.street}
                            onChange={(e) => setNewLocation({
                              ...newLocation,
                              address: { ...newLocation.address, street: e.target.value }
                            })}
                          />
                        </div>

                        <div>
                          <Label>Número *</Label>
                          <Input
                            value={newLocation.address.number}
                            onChange={(e) => setNewLocation({
                              ...newLocation,
                              address: { ...newLocation.address, number: e.target.value }
                            })}
                          />
                        </div>

                        <div>
                          <Label>CEP *</Label>
                          <Input
                            value={newLocation.address.zipCode}
                            onChange={(e) => setNewLocation({
                              ...newLocation,
                              address: { ...newLocation.address, zipCode: formatZipCode(e.target.value) }
                            })}
                            maxLength={9}
                          />
                        </div>

                        <div>
                          <Label>Setor/Bairro *</Label>
                          <Input
                            value={newLocation.address.neighborhood}
                            onChange={(e) => setNewLocation({
                              ...newLocation,
                              address: { ...newLocation.address, neighborhood: e.target.value }
                            })}
                          />
                        </div>

                        <div>
                          <Label>Complemento</Label>
                          <Input
                            value={newLocation.address.complement || ''}
                            onChange={(e) => setNewLocation({
                              ...newLocation,
                              address: { ...newLocation.address, complement: e.target.value }
                            })}
                          />
                        </div>

                        <div>
                          <Label>Cidade *</Label>
                          <Input
                            value={newLocation.address.city}
                            onChange={(e) => setNewLocation({
                              ...newLocation,
                              address: { ...newLocation.address, city: e.target.value }
                            })}
                          />
                        </div>

                        <div>
                          <Label>Estado *</Label>
                          <Select
                            value={newLocation.address.state}
                            onValueChange={(value) => setNewLocation({
                              ...newLocation,
                              address: { ...newLocation.address, state: value }
                            })}
                          >
                            <SelectTrigger>
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

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingLocation(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddLocation}
                        style={{ backgroundColor: '#10B981', color: 'white' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Unidade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentClient.locations && currentClient.locations.length > 0 ? (
              <div className="space-y-6">
                {currentClient.locations.filter(location => location.isPrimary).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <h4 className="text-lg font-semibold" style={{ color: '#6400A4' }}>
                            Unidade Principal
                        </h4>
                        </div>
                    
                    {currentClient.locations
                      .filter(location => location.isPrimary)
                      .map((location) => (
                        <Card key={location.id} className="border-2" style={{ borderColor: '#6400A4', backgroundColor: 'rgba(100, 0, 164, 0.02)' }}>
                          <CardContent className="pt-6">
                            <div>
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                  <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: areaColors[location.area] }}
                                  >
                                    <Building2 className="h-6 w-6 text-white" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 style={{ color: '#6400A4' }}>{location.name}</h4>
                                      <Badge style={{ backgroundColor: '#6400A4', color: 'white' }}>
                                        <Star className="h-3 w-3 mr-1" />
                                        Principal
                                      </Badge>
                                      <Badge style={{ backgroundColor: areaColors[location.area], color: 'white' }}>
                                        {areaLabels[location.area]}
                                      </Badge>
                                    </div>
                                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                                      {location.cnpj && (
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-3 w-3" />
                                          <span>{location.cnpj}</span>
                                        </div>
                                      )}
                                      {location.email && (
                                        <div className="flex items-center gap-2">
                                          <Mail className="h-3 w-3" />
                                          <span>{location.email}</span>
                                        </div>
                                      )}
                                      {location.phone && (
                                        <div className="flex items-center gap-2">
                                          <Phone className="h-3 w-3" />
                                          <span>{location.phone}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2">
                                        <MapPin className="h-3 w-3" />
                                        <span className="text-sm">
                                          {location.address.street}, {location.address.number}
                                          {location.address.complement && `, ${location.address.complement}`} - {location.address.neighborhood}, {location.address.city}/{location.address.state} - CEP: {location.address.zipCode}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {canAddLocation && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditLocation(location)}
                                      style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}

                {currentClient.locations.filter(location => !location.isPrimary).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <h4 className="text-lg font-semibold" style={{ color: '#6400A4' }}>
                            Outras Unidades
                        </h4>
                        <span className="text-sm text-gray-500">
                            ({currentClient.locations.filter(location => !location.isPrimary).length})
                        </span>
                        </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {currentClient.locations
                        .filter(location => !location.isPrimary)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((location) => (
                          <Card key={location.id}>
                            <CardContent className="pt-6">
                              {editingLocation?.id === location.id ? (
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <h4 style={{ color: '#6400A4' }}>Editar Unidade</h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingLocation(null)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label>Nome da Unidade *</Label>
                                      <Input
                                        value={editingLocation.name}
                                        onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                                      />
                                    </div>

                                    <div>
                                      <Label>CNPJ</Label>
                                      <Input
                                        value={editingLocation.cnpj}
                                        onChange={(e) => setEditingLocation({ ...editingLocation, cnpj: formatCNPJ(e.target.value) })}
                                        maxLength={18}
                                      />
                                    </div>

                                    <div>
                                      <Label>Email</Label>
                                      <Input
                                        type="email"
                                        value={editingLocation.email}
                                        onChange={(e) => setEditingLocation({ ...editingLocation, email: e.target.value })}
                                      />
                                    </div>

                                    <div>
                                      <Label>Telefone</Label>
                                      <Input
                                        value={editingLocation.phone}
                                        onChange={(e) => setEditingLocation({ ...editingLocation, phone: formatPhone(e.target.value) })}
                                        maxLength={15}
                                      />
                                    </div>

                                    <div>
                                      <Label>Área *</Label>
                                      <Select
                                        value={editingLocation.area}
                                        onValueChange={(value: 'norte' | 'sul' | 'leste' | 'oeste' | 'centro') => 
                                          setEditingLocation({ ...editingLocation, area: value })
                                        }
                                      >
                                        <SelectTrigger>
                                          <SelectValue />
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

                                    {canAddLocation && (
                                      <div className="flex items-center space-x-2 pt-2">
                                        <input
                                          type="checkbox"
                                          id="editIsPrimary"
                                          checked={editingLocation.isPrimary}
                                          onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setEditingLocation({ 
                                              ...editingLocation, 
                                              isPrimary: isChecked 
                                            });
                                            if (isChecked) {
                                              toast.info('As outras unidades serão desmarcadas como principal.');
                                            }
                                          }}
                                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <Label htmlFor="editIsPrimary" className="cursor-pointer font-medium">
                                          Unidade principal
                                        </Label>
                                      </div>
                                    )}
                                  </div>

                                  <div className="pt-4 border-t">
                                    <h5 className="mb-4 text-sm" style={{ color: '#6400A4' }}>Endereço</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      <div className="md:col-span-2">
                                        <Label>Logradouro/Rua *</Label>
                                        <Input
                                          value={editingLocation.address.street}
                                          onChange={(e) => setEditingLocation({
                                            ...editingLocation,
                                            address: { ...editingLocation.address, street: e.target.value }
                                          })}
                                        />
                                      </div>

                                      <div>
                                        <Label>Número *</Label>
                                        <Input
                                          value={editingLocation.address.number}
                                          onChange={(e) => setEditingLocation({
                                            ...editingLocation,
                                            address: { ...editingLocation.address, number: e.target.value }
                                          })}
                                        />
                                      </div>

                                      <div>
                                        <Label>CEP *</Label>
                                        <Input
                                          value={editingLocation.address.zipCode}
                                          onChange={(e) => setEditingLocation({
                                            ...editingLocation,
                                            address: { ...editingLocation.address, zipCode: formatZipCode(e.target.value) }
                                          })}
                                          maxLength={9}
                                        />
                                      </div>

                                      <div>
                                        <Label>Setor/Bairro *</Label>
                                        <Input
                                          value={editingLocation.address.neighborhood}
                                          onChange={(e) => setEditingLocation({
                                            ...editingLocation,
                                            address: { ...editingLocation.address, neighborhood: e.target.value }
                                          })}
                                        />
                                      </div>

                                      <div>
                                        <Label>Complemento</Label>
                                        <Input
                                          value={editingLocation.address.complement || ''}
                                          onChange={(e) => setEditingLocation({
                                            ...editingLocation,
                                            address: { ...editingLocation.address, complement: e.target.value }
                                          })}
                                        />
                                      </div>

                                      <div>
                                        <Label>Cidade *</Label>
                                        <Input
                                          value={editingLocation.address.city}
                                          onChange={(e) => setEditingLocation({
                                            ...editingLocation,
                                            address: { ...editingLocation.address, city: e.target.value }
                                          })}
                                        />
                                      </div>

                                      <div>
                                        <Label>Estado *</Label>
                                        <Select
                                          value={editingLocation.address.state}
                                          onValueChange={(value) => setEditingLocation({
                                            ...editingLocation,
                                            address: { ...editingLocation.address, state: value }
                                          })}
                                        >
                                          <SelectTrigger>
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

                                  <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => setEditingLocation(null)}
                                    >
                                      Cancelar
                                    </Button>
                                    <Button
                                      onClick={handleSaveEditedLocation}
                                      style={{ backgroundColor: '#10B981', color: 'white' }}
                                    >
                                      <Save className="h-4 w-4 mr-2" />
                                      Salvar Alterações
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3">
                                      <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: areaColors[location.area] }}
                                      >
                                        <Building2 className="h-6 w-6 text-white" />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h4 style={{ color: '#6400A4' }}>{location.name}</h4>
                                          <Badge style={{ backgroundColor: areaColors[location.area], color: 'white' }}>
                                            {areaLabels[location.area]}
                                          </Badge>
                                        </div>
                                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                                          {location.cnpj && (
                                            <div className="flex items-center gap-2">
                                              <FileText className="h-3 w-3" />
                                              <span>{location.cnpj}</span>
                                            </div>
                                          )}
                                          {location.email && (
                                            <div className="flex items-center gap-2">
                                              <Mail className="h-3 w-3" />
                                              <span>{location.email}</span>
                                            </div>
                                          )}
                                          {location.phone && (
                                            <div className="flex items-center gap-2">
                                              <Phone className="h-3 w-3" />
                                              <span>{location.phone}</span>
                                            </div>
                                          )}
                                          <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3" />
                                            <span className="text-sm">
                                              {location.address.street}, {location.address.number}
                                              {location.address.complement && `, ${location.address.complement}`} - {location.address.neighborhood}, {location.address.city}/{location.address.state} - CEP: {location.address.zipCode}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      {canAddLocation && (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetPrimaryLocation(location)}
                                            title="Definir como principal"
                                            style={{ borderColor: '#F59E0B', color: '#F59E0B' }}
                                          >
                                            <Star className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEditLocation(location)}
                                            style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                      {canDeleteLocation && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setLocationToDelete(location.id)}
                                          style={{ borderColor: '#EF4444', color: '#EF4444' }}
                                          title="Excluir unidade"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 mb-4">Nenhuma unidade cadastrada</p>
                    {canAddLocation && (
                      <Button
                        onClick={() => setIsAddingLocation(true)}
                        style={{ backgroundColor: '#6400A4', color: 'white' }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Primeira Unidade
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6400A4' }}>
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Serviços Ativos</p>
                      <p className="text-2xl" style={{ color: '#6400A4' }}>{currentClient.servicesActive}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10B981' }}>
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Serviços Concluídos</p>
                      <p className="text-2xl" style={{ color: '#10B981' }}>{currentClient.servicesCompleted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F59E0B' }}>
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avaliação</p>
                      <p className="text-2xl" style={{ color: '#F59E0B' }}>{currentClient.rating.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#35BAE6' }}>
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Unidades</p>
                      <p className="text-2xl" style={{ color: '#35BAE6' }}>{currentClient.locations?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h4 className="mb-4" style={{ color: '#6400A4' }}>Informações Adicionais</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Último Serviço:</span>
                    <span>{currentClient.lastService}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-600">Valor Total:</span>
                    <span style={{ color: '#10B981' }}>{currentClient.totalValue}</span>
                  </div>
                  {currentClient.createdAt && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Data de Cadastro:</span>
                      <span>{formatDate(currentClient.createdAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!locationToDelete} onOpenChange={() => setLocationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta unidade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => locationToDelete && handleDeleteLocation(locationToDelete)}
              style={{ backgroundColor: '#EF4444', color: 'white' }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}