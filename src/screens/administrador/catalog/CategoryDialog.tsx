import { Check, Edit } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { CategoryDialogProps } from './types';

export default function CategoryDialog({
  open,
  onOpenChange,
  categoryFormData,
  onCategoryFormDataChange,
  onSave,
  loading,
  editingCategory
}: CategoryDialogProps) {
  const handleInputChange = (field: 'name' | 'color', value: string) => {
    onCategoryFormDataChange({ ...categoryFormData, [field]: value });
  };

  const colorOptions = ['#6400A4', '#8B20EE', '#10B981', '#35BAE6', '#F59E0B', '#EF4444'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="modal-title-purple">
            {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {editingCategory ? 'Atualize as informações da categoria' : 'Adicione uma nova categoria de serviços'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="categoryName" style={{ color: '#8B20EE' }}>Nome da Categoria *</Label>
            <Input
              id="categoryName"
              value={categoryFormData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Limpeza Residencial"
              className="mt-1"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="categoryColor" style={{ color: '#8B20EE' }}>Cor</Label>
            <div className="flex space-x-2 mt-1">
              {colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => handleInputChange('color', color)}
                  className={`w-10 h-10 rounded-lg transition-transform ${categoryFormData.color === color ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ backgroundColor: color }}
                  disabled={loading}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={onSave}
            disabled={!categoryFormData.name || loading}
            style={{ backgroundColor: '#8B20EE', color: 'white' }}
            className="hover:opacity-90"
          >
            {loading ? (
              <>Carregando...</>
            ) : (
              <>
                {editingCategory ? <Edit className="h-4 w-4 mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
