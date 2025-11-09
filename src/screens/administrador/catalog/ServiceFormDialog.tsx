import { Check } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Service, ServiceFormData, Category, emptyFormData } from './types';

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingService: Service | null;
  formData: ServiceFormData;
  onFormDataChange: (data: ServiceFormData) => void;
  categories: Category[];
  onSave: () => void;
  loading: boolean;
  hasChanges: boolean;
}

export default function ServiceFormDialog({
  open,
  onOpenChange,
  editingService,
  formData,
  onFormDataChange,
  categories,
  onSave,
  loading,
  hasChanges
}: ServiceFormDialogProps) {
  const handleInputChange = (field: keyof ServiceFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const isFormValid = formData.name && formData.category_id && formData.price && formData.duration_value;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="modal-title-purple">
            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
          <DialogDescription>
            {editingService ? 'Atualize as informações do serviço' : 'Adicione um novo serviço ao catálogo'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campo Nome */}
          <div>
            <Label htmlFor="serviceName" style={{ color: '#8B20EE' }}>Nome do Serviço *</Label>
            <Input
              id="serviceName"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Limpeza Completa Residencial"
              className={`mt-1 ${!formData.name && 'border-red-300 focus-visible:ring-red-300'}`}
              disabled={loading}
            />
            {!formData.name && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                Nome do serviço é obrigatório
              </p>
            )}
          </div>

          {/* Campo Descrição */}
          <div>
            <Label htmlFor="serviceDescription" style={{ color: '#8B20EE' }}>Descrição</Label>
            <Textarea
              id="serviceDescription"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva os detalhes do serviço..."
              className="mt-1"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campo Categoria */}
            <div>
              <Label htmlFor="serviceCategory" style={{ color: '#8B20EE' }}>Categoria *</Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value: string) => handleInputChange('category_id', value)}
                disabled={loading}
              >
                <SelectTrigger className={`mt-1 ${!formData.category_id && 'border-red-300 focus-visible:ring-red-300'}`}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.category_id && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                  Selecione uma categoria
                </p>
              )}
            </div>

            {/* Campo Preço */}
            <div>
              <Label htmlFor="servicePrice" style={{ color: '#8B20EE' }}>Preço (R$) *</Label>
              <Input
                id="servicePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0,00"
                className={`mt-1 ${!formData.price && 'border-red-300 focus-visible:ring-red-300'}`}
                disabled={loading}
              />
              {!formData.price && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                  Preço é obrigatório
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campo Tipo de Duração */}
            <div>
              <Label htmlFor="serviceDurationType" style={{ color: '#8B20EE' }}>Tipo de Duração *</Label>
              <Select 
                value={formData.duration_type} 
                onValueChange={(value: 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'anual' | 'horas') => 
                  handleInputChange('duration_type', value)
                }
                disabled={loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diaria">Diária</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="horas">Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo Quantidade de Duração */}
            <div>
              <Label htmlFor="serviceDuration" style={{ color: '#8B20EE' }}>
                {formData.duration_type === 'horas' ? 'Quantidade de Horas *' : 'Quantidade *'}
              </Label>
              <Input
                id="serviceDuration"
                type="number"
                step={formData.duration_type === 'horas' ? '0.5' : '1'}
                min="0"
                value={formData.duration_value}
                onChange={(e) => handleInputChange('duration_value', e.target.value)}
                placeholder={formData.duration_type === 'horas' ? 'Ex: 4' : 'Ex: 1'}
                className={`mt-1 ${!formData.duration_value && 'border-red-300 focus-visible:ring-red-300'}`}
                disabled={loading}
              />
              {!formData.duration_value && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-1"></span>
                  {formData.duration_type === 'horas' ? 'Quantidade de horas é obrigatória' : 'Quantidade é obrigatória'}
                </p>
              )}
            </div>
          </div>

          {/* Mensagem de campos obrigatórios */}
          {(!formData.name || !formData.category_id || !formData.price || !formData.duration_value) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 text-sm flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                Preencha todos os campos obrigatórios marcados com *
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
            className="sm:order-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={!isFormValid || !hasChanges || loading}
            style={{ backgroundColor: '#8B20EE', color: 'white' }}
            className="hover:opacity-90 sm:order-2"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {editingService ? 'Salvando...' : 'Criando...'}
              </div>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {editingService ? 'Salvar Alterações' : 'Criar Serviço'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}