import { useState } from 'react';
import { Package, Plus, Edit, Search, Trash2, Check, Shield, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { HighlightText } from './ui/search-highlight';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { toast } from 'sonner';
import React from 'react';


interface Equipment {
  id: string;
  name: string;
  description: string;
  type: 'equipment' | 'epi';
  category: string;
  quantity: number;
  minQuantity: number;
  status: 'available' | 'low' | 'out';
  createdAt: string;
}

// Mock data
const mockEquipments: Equipment[] = [
  {
    id: '1',
    name: 'Aspirador de Pó Profissional',
    description: 'Aspirador industrial de alta potência',
    type: 'equipment',
    category: 'Limpeza',
    quantity: 15,
    minQuantity: 5,
    status: 'available',
    createdAt: '10/01/2025'
  },
  {
    id: '2',
    name: 'Luvas de Proteção',
    description: 'Luvas de látex descartáveis - tamanho M',
    type: 'epi',
    category: 'Proteção',
    quantity: 200,
    minQuantity: 50,
    status: 'available',
    createdAt: '08/01/2025'
  },
  {
    id: '3',
    name: 'Óculos de Proteção',
    description: 'Óculos de segurança com proteção UV',
    type: 'epi',
    category: 'Proteção',
    quantity: 30,
    minQuantity: 20,
    status: 'low',
    createdAt: '05/01/2025'
  },
  {
    id: '4',
    name: 'Máscara PFF2',
    description: 'Máscara de proteção respiratória',
    type: 'epi',
    category: 'Proteção',
    quantity: 0,
    minQuantity: 100,
    status: 'out',
    createdAt: '03/01/2025'
  },
  {
    id: '5',
    name: 'Escada de Alumínio 6m',
    description: 'Escada profissional dobrável',
    type: 'equipment',
    category: 'Acesso',
    quantity: 8,
    minQuantity: 3,
    status: 'available',
    createdAt: '01/01/2025'
  },
  {
    id: '6',
    name: 'Botina de Segurança',
    description: 'Calçado de segurança com bico de aço',
    type: 'epi',
    category: 'Proteção',
    quantity: 25,
    minQuantity: 15,
    status: 'available',
    createdAt: '28/12/2024'
  }
];

const categories = ['Todas', 'Limpeza', 'Proteção', 'Acesso', 'Manutenção', 'Jardinagem'];


export default function EquipmentScreen() {
  const [equipments, setEquipments] = useState<Equipment[]>(mockEquipments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deleteConfirmEquipment, setDeleteConfirmEquipment] = useState<Equipment | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'equipment' as 'equipment' | 'epi',
    category: '',
    quantity: '',
    minQuantity: ''
  });

  const availableCount = equipments.filter(e => e.status === 'available').length;
  const lowCount = equipments.filter(e => e.status === 'low').length;
  const outCount = equipments.filter(e => e.status === 'out').length;
  const epiCount = equipments.filter(e => e.type === 'epi').length;

  const filteredEquipments = equipments.filter(equipment => {
    const matchesSearch = 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'todos' || equipment.type === filterType;
    const matchesStatus = filterStatus === 'todos' || equipment.status === filterStatus;
    const matchesCategory = filterCategory === 'Todas' || equipment.category === filterCategory;
    
    return matchesSearch && matchesType && matchesStatus && matchesCategory;
  });

  const handleOpenDialog = (equipment?: Equipment) => {
    if (equipment) {
      setEditingEquipment(equipment);
      setFormData({
        name: equipment.name,
        description: equipment.description,
        type: equipment.type,
        category: equipment.category,
        quantity: equipment.quantity.toString(),
        minQuantity: equipment.minQuantity.toString()
      });
    } else {
      setEditingEquipment(null);
      setFormData({
        name: '',
        description: '',
        type: 'equipment',
        category: '',
        quantity: '',
        minQuantity: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEquipment(null);
  };

  const getStatus = (quantity: number, minQuantity: number): 'available' | 'low' | 'out' => {
    if (quantity === 0) return 'out';
    if (quantity <= minQuantity) return 'low';
    return 'available';
  };

  const handleSaveEquipment = () => {
    if (!formData.name || !formData.category || !formData.quantity || !formData.minQuantity) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const quantity = parseInt(formData.quantity);
    const minQuantity = parseInt(formData.minQuantity);
    const status = getStatus(quantity, minQuantity);

    if (editingEquipment) {
      setEquipments(equipments.map(e => 
        e.id === editingEquipment.id 
          ? { 
              ...e, 
              name: formData.name,
              description: formData.description,
              type: formData.type,
              category: formData.category,
              quantity,
              minQuantity,
              status
            }
          : e
      ));
      toast.success('Equipamento atualizado com sucesso!', {
        description: `O item "${formData.name}" foi atualizado.`
      });
    } else {
      const newEquipment: Equipment = {
        id: (equipments.length + 1).toString(),
        name: formData.name,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        quantity,
        minQuantity,
        status,
        createdAt: new Date().toLocaleDateString('pt-BR')
      };
      setEquipments([...equipments, newEquipment]);
      toast.success('Equipamento cadastrado com sucesso!', {
        description: `O item "${formData.name}" foi adicionado ao estoque.`
      });
    }
    handleCloseDialog();
  };

  const handleDeleteEquipment = (equipment: Equipment) => {
    setDeleteConfirmEquipment(equipment);
  };

  const confirmDeleteEquipment = () => {
    if (deleteConfirmEquipment) {
      setEquipments(equipments.filter(e => e.id !== deleteConfirmEquipment.id));
      toast.success('Equipamento excluído com sucesso!', {
        description: `O item "${deleteConfirmEquipment.name}" foi removido do estoque.`
      });
      setDeleteConfirmEquipment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge style={{ backgroundColor: '#10B981', color: 'white' }}>Disponível</Badge>;
      case 'low':
        return <Badge style={{ backgroundColor: '#F59E0B', color: 'white' }}>Estoque Baixo</Badge>;
      case 'out':
        return <Badge style={{ backgroundColor: '#EF4444', color: 'white' }}>Esgotado</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'epi' ? (
      <Badge style={{ backgroundColor: '#35BAE6', color: 'white' }}>
        <Shield className="h-3 w-3 mr-1" />
        EPI
      </Badge>
    ) : (
      <Badge style={{ backgroundColor: '#8B20EE', color: 'white' }}>
        <Package className="h-3 w-3 mr-1" />
        Equipamento
      </Badge>
    );
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                <Package className="h-6 w-6" style={{ color: '#8B20EE' }} />
              </div>
              <div>
                <h1 className="hive-screen-title">Gestão de Equipamentos e EPIs</h1>
                <p className="text-sm text-gray-600">
                  Controle de equipamentos e materiais de proteção individual
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => handleOpenDialog()}
              style={{ backgroundColor: '#6400A4', color: 'white' }}
              className="hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2" style={{ borderColor: '#8B20EE' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Itens</p>
                  <p className="text-2xl" style={{ color: '#8B20EE' }}>{equipments.length}</p>
                </div>
                <Package className="h-8 w-8" style={{ color: '#8B20EE', opacity: 0.5 }} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disponíveis</p>
                  <p className="text-2xl text-green-600">{availableCount}</p>
                </div>
                <Check className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Estoque Baixo</p>
                  <p className="text-2xl text-yellow-600">{lowCount}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2" style={{ borderColor: '#35BAE6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">EPIs</p>
                  <p className="text-2xl" style={{ color: '#35BAE6' }}>{epiCount}</p>
                </div>
                <Shield className="h-8 w-8" style={{ color: '#35BAE6', opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Tabs value={filterType} onValueChange={setFilterType} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
                <TabsTrigger value="epi">EPIs</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Status Filter */}
            <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-auto">
              <TabsList>
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="available">Disponíveis</TabsTrigger>
                <TabsTrigger value="low">Baixos</TabsTrigger>
                <TabsTrigger value="out">Esgotados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Equipments List */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-3">
          {filteredEquipments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-gray-500">Nenhum item encontrado</p>
            </div>
          ) : (
            filteredEquipments.map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white rounded-2xl p-5 hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(139, 32, 238, 0.1)' }}>
                      {equipment.type === 'epi' ? (
                        <Shield className="h-6 w-6" style={{ color: '#35BAE6' }} />
                      ) : (
                        <Package className="h-6 w-6" style={{ color: '#8B20EE' }} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 style={{ color: '#8B20EE' }}>
                          <HighlightText text={equipment.name} searchTerm={searchTerm} highlightClassName="search-highlight" />
                        </h3>
                        {getTypeBadge(equipment.type)}
                        {getStatusBadge(equipment.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{equipment.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-500">
                          Categoria: <span className="text-black">{equipment.category}</span>
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">
                          Quantidade: <span style={{ color: equipment.status === 'out' ? '#EF4444' : equipment.status === 'low' ? '#F59E0B' : '#10B981' }}>
                            {equipment.quantity}
                          </span>
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500">
                          Mínimo: <span className="text-black">{equipment.minQuantity}</span>
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-xs text-gray-400">Cadastrado em {equipment.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(equipment)}
                      style={{ borderColor: '#8B20EE', color: '#8B20EE' }}
                      className="hover:bg-purple-50"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEquipment(equipment)}
                      style={{ borderColor: '#EF4444', color: '#EF4444' }}
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredEquipments.length > 0 && (
          <div className="mt-6 p-4 bg-white rounded-xl text-center">
            <p className="text-sm text-gray-600">
              Exibindo <span style={{ color: '#8B20EE' }}>{filteredEquipments.length}</span> de{' '}
              <span style={{ color: '#8B20EE' }}>{equipments.length}</span> itens
            </p>
          </div>
        )}
      </div>

      {/* Equipment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="modal-title-purple">
              {editingEquipment ? 'Editar Item' : 'Novo Item'}
            </DialogTitle>
            <DialogDescription>
              {editingEquipment ? 'Atualize as informações do item' : 'Cadastre um novo equipamento ou EPI'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="itemName" style={{ color: '#8B20EE' }}>Nome do Item *</Label>
              <Input
                id="itemName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Aspirador de Pó Profissional"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="itemDescription" style={{ color: '#8B20EE' }}>Descrição</Label>
              <Textarea
                id="itemDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o item..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemType" style={{ color: '#8B20EE' }}>Tipo *</Label>
                <Select value={formData.type} onValueChange={(value: 'equipment' | 'epi') => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equipment">Equipamento</SelectItem>
                    <SelectItem value="epi">EPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="itemCategory" style={{ color: '#8B20EE' }}>Categoria *</Label>
                <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemQuantity" style={{ color: '#8B20EE' }}>Quantidade *</Label>
                <Input
                  id="itemQuantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="itemMinQuantity" style={{ color: '#8B20EE' }}>Quantidade Mínima *</Label>
                <Input
                  id="itemMinQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEquipment}
              disabled={!formData.name || !formData.category || !formData.quantity || !formData.minQuantity}
              style={{ backgroundColor: '#8B20EE', color: 'white' }}
              className="hover:opacity-90"
            >
              <Check className="h-4 w-4 mr-2" />
              {editingEquipment ? 'Salvar Alterações' : 'Cadastrar Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmEquipment} onOpenChange={() => setDeleteConfirmEquipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#8B20EE' }}>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#000000' }}>
              Tem certeza que deseja excluir <strong>{deleteConfirmEquipment?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEquipment}
              style={{ backgroundColor: '#EF4444', color: 'white' }}
              className="hover:opacity-90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}