import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface HospitalizationFormData {
  personnel_id: number;
  medical_facility: string;
  admission_date: string;
  comment: string;
}

interface HospitalizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalization: any;
}

const HospitalizationDialog = ({ open, onOpenChange, hospitalization }: HospitalizationDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<HospitalizationFormData>();

  const { data: personnel } = useQuery({
    queryKey: ['personnel-list'],
    queryFn: async () => {
      const response = await fetch('/api/military/personnel?status=active');
      if (!response.ok) throw new Error('Failed to fetch personnel');
      return response.json();
    },
    enabled: open,
  });

  useEffect(() => {
    if (hospitalization) {
      reset({
        personnel_id: hospitalization.personnel_id,
        medical_facility: hospitalization.medical_facility,
        admission_date: hospitalization.admission_date,
        comment: hospitalization.comment || '',
      });
    } else {
      reset({
        personnel_id: 0,
        medical_facility: '',
        admission_date: new Date().toISOString().split('T')[0],
        comment: '',
      });
    }
  }, [hospitalization, reset]);

  const mutation = useMutation({
    mutationFn: async (data: HospitalizationFormData) => {
      const url = hospitalization
        ? `/api/military/hospitalizations/${hospitalization.id}`
        : '/api/military/hospitalizations';
      const method = hospitalization ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitalizations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(hospitalization ? 'Запись обновлена' : 'Запись добавлена');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Ошибка при сохранении');
    },
  });

  const onSubmit = (data: HospitalizationFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {hospitalization ? 'Редактировать госпитализацию' : 'Добавить госпитализацию'}
          </DialogTitle>
          <DialogDescription>
            Укажите данные госпитализации военнослужащего
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personnel_id">Военнослужащий</Label>
            <Select
              value={watch('personnel_id')?.toString()}
              onValueChange={(value) => setValue('personnel_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите военнослужащего" />
              </SelectTrigger>
              <SelectContent>
                {personnel?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.rank} {p.full_name} ({p.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_facility">ВМО</Label>
            <Input
              id="medical_facility"
              {...register('medical_facility', { required: true })}
              placeholder="Наименование военно-медицинской организации"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admission_date">Дата госпитализации</Label>
            <Input
              id="admission_date"
              type="date"
              {...register('admission_date')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий</Label>
            <Textarea id="comment" {...register('comment')} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HospitalizationDialog;
