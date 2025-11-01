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

interface MedicalVisitDialogProps {
  open: boolean;
  onClose: () => void;
  personnelId: number;
}

const MedicalVisitDialog = ({ open, onClose, personnelId }: MedicalVisitDialogProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    visit_date: '',
    doctor_specialty: '',
    diagnosis: '',
    recommendations: '',
    fitness_category: '',
  });

  const mutation = useMutation({
    mutationFn: () => militaryApi.addMedicalVisit({
      personnel_id: personnelId,
      ...formData,
    }),
    onSuccess: () => {
      toast.success('Медосмотр добавлен');
      queryClient.invalidateQueries({ queryKey: ['personnel-detail', personnelId.toString()] });
      onClose();
      setFormData({
        visit_date: '',
        doctor_specialty: '',
        diagnosis: '',
        recommendations: '',
        fitness_category: '',
      });
    },
    onError: () => {
      toast.error('Ошибка при добавлении медосмотра');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visit_date || !formData.doctor_specialty) {
      toast.error('Заполните обязательные поля');
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить медосмотр</DialogTitle>
          <DialogDescription>
            Зафиксируйте посещение врача и результаты осмотра
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="visit_date">Дата осмотра *</Label>
            <Input
              id="visit_date"
              type="date"
              value={formData.visit_date}
              onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="doctor_specialty">Специальность врача *</Label>
            <Input
              id="doctor_specialty"
              placeholder="Например: Терапевт"
              value={formData.doctor_specialty}
              onChange={(e) => setFormData({ ...formData, doctor_specialty: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="diagnosis">Диагноз</Label>
            <Textarea
              id="diagnosis"
              placeholder="Поставленный диагноз"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="recommendations">Рекомендации</Label>
            <Textarea
              id="recommendations"
              placeholder="Рекомендации врача"
              value={formData.recommendations}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="fitness_category">Категория годности (если установлена)</Label>
            <Select
              value={formData.fitness_category || 'none'}
              onValueChange={(value) => setFormData({ ...formData, fitness_category: value === 'none' ? '' : value })}
            >
              <SelectTrigger id="fitness_category">
                <SelectValue placeholder="Не установлена" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не установлена</SelectItem>
                <SelectItem value="А">А - годен</SelectItem>
                <SelectItem value="Б">Б - годен с незначительными ограничениями</SelectItem>
                <SelectItem value="В">В - ограниченно годен</SelectItem>
                <SelectItem value="Г">Г - временно не годен</SelectItem>
                <SelectItem value="Д">Д - не годен</SelectItem>
              </SelectContent>
            </Select>
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

export default MedicalVisitDialog;