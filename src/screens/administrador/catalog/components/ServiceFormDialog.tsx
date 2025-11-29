import { Check } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Service, ServiceFormData, Category } from '../types';

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
    if (field === 'price' || field === 'duration_value') {
      // Converte para número. Se for string vazia, vira 0.
      const parsed = value === '' ? 0 : Number(value);
      onFormDataChange({ ...formData, [field]: parsed } as ServiceFormData);
    } else {
      onFormDataChange({ ...formData, [field]: value } as ServiceFormData);
    }
  };

  // Validação: Checa se campos obrigatórios têm valor válido
  const isFormValid =
    !!formData.name &&
    !!formData.category_id &&
    typeof formData.price === 'number' &&
    typeof formData.duration_value === 'number' &&
    formData.duration_value > 0; // Duração tem que ser maior que 0

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
          {/* Nome */}
          <div>
            <Label htmlFor="serviceName" style={{ color: '#8B20EE' }}>Nome do Serviço *</Label>
            <Input
              id="serviceName"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Limpeza Completa Residencial"
              className="mt-1"
              disabled={loading}
            />
          </div>

          {/* Descrição */}
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
            {/* Categoria */}
            <div>
              <Label htmlFor="serviceCategory" style={{ color: '#8B20EE' }}>Categoria *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value: string) => handleInputChange('category_id', value)}
                disabled={loading}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preço */}
            <div>
              <Label htmlFor="servicePrice" style={{ color: '#8B20EE' }}>Preço (R$) *</Label>
              <Input
                id="servicePrice"
                type="number"
                step="0.01"
                min="0"
                // LÓGICA DO ZERO OCULTO: Se for 0, mostra vazio.
                value={formData.price === 0 ? '' : formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0,00"
                className="mt-1"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo Duração */}
            <div>
              <Label htmlFor="serviceDurationType" style={{ color: '#8B20EE' }}>Tipo de Duração *</Label>
              <Select
                value={formData.duration_type}
                onValueChange={(value: any) => handleInputChange('duration_type', value)}
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

            {/* Quantidade Duração */}
            <div>
              <Label htmlFor="serviceDuration" style={{ color: '#8B20EE' }}>
                {formData.duration_type === 'horas' ? 'Quantidade de Horas *' : 'Quantidade *'}
              </Label>
              <Input
                id="serviceDuration"
                type="number"
                step={formData.duration_type === 'horas' ? '0.5' : '1'}
                min="0"
                // LÓGICA DO ZERO OCULTO
                value={formData.duration_value === 0 ? '' : formData.duration_value}
                onChange={(e) => handleInputChange('duration_value', e.target.value)}
                placeholder={formData.duration_type === 'horas' ? 'Ex: 4' : 'Ex: 1'}
                className="mt-1"
                disabled={loading}
              />
            </div>
          </div>
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
          
          {/* BOTÃO DE SALVAR: CORRIGIDO */}
          <Button
            onClick={onSave}
            // Se o form não for válido OU (estiver editando E não tiver mudanças) OU carregando -> DESABILITA
            disabled={!isFormValid || (!!editingService && !hasChanges) || loading} 
            style={{ backgroundColor: '#8B20EE', color: 'white' }}
            className="hover:opacity-90 sm:order-2"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Salvar
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