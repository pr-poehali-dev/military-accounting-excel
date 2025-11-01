import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { militaryApi } from '@/lib/militaryApi';
import { toast } from 'sonner';

interface MovementDialogProps {
  open: boolean;
  onClose: () => void;
  personnelId: number;
}

const MovementDialog = ({ open, onClose, personnelId }: MovementDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    movement_type: '',
    start_date: '',
    end_date: '',
    destination: '',
    notes: '',
  });

  const mutation = useMutation({
    mutationFn: () => militaryApi.addMovement({
      personnel_id: personnelId,
      ...formData,
    }),
    onSuccess: () => {
      toast.success('Движение добавлено');
      queryClient.invalidateQueries({ queryKey: ['personnel-detail', personnelId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onClose();
      setFormData({
        movement_type: '',
        start_date: '',
        end_date: '',
        destination: '',
        notes: '',
      });
    },
    onError: () => {
      toast.error('Ошибка при добавлении движения');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.movement_type || !formData.start_date) {
      toast.error('Заполните обязательные поля');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить движение</DialogTitle>
          <DialogDescription>
            Зафиксируйте изменение местоположения или статуса военнослужащего
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="movement_type">Тип движения *</Label>
            <Select
              value={formData.movement_type}
              onValueChange={(value) => setFormData({ ...formData, movement_type: value })}
            >
              <SelectTrigger id="movement_type">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="прибыл">Прибыл в ПВД</SelectItem>
                <SelectItem value="в_строй">Возвращение в строй</SelectItem>
                <SelectItem value="госпитализация">Госпитализация</SelectItem>
                <SelectItem value="отпуск">Отпуск</SelectItem>
                <SelectItem value="убыл">Убыл</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start_date">Дата начала *</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="end_date">Дата окончания</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="destination">Куда (госпиталь, место отпуска и т.д.)</Label>
            <Input
              id="destination"
              placeholder="Например: ГВКГ им. Бурденко"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="notes">Примечания</Label>
            <Textarea
              id="notes"
              placeholder="Дополнительная информация"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovementDialog;
