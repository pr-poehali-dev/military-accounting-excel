import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

interface PersonnelFormData {
  personal_number: string;
  unit: string;
  rank: string;
  full_name: string;
  arrival_date: string;
  treatment_period: string;
  status: string;
  diagnosis: string;
  notes: string;
}

interface PersonnelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personnel: any;
}

const TREATMENT_PERIODS = [
  'Менее 1 недели',
  '2 недели',
  '3 недели',
  'месяц',
  'более месяца',
];

const STATUSES = [
  'Амбулаторное лечение',
  'проходит ВВК',
  'годен в строй',
  'категория В',
  'Категория Д',
  'отпуск',
  'госпитализация',
];

const PersonnelDialog = ({ open, onOpenChange, personnel }: PersonnelDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PersonnelFormData>();

  useEffect(() => {
    if (personnel) {
      reset({
        personal_number: personnel.personal_number,
        unit: personnel.unit,
        rank: personnel.rank,
        full_name: personnel.full_name,
        arrival_date: personnel.arrival_date,
        treatment_period: personnel.treatment_period || '',
        status: personnel.status,
        diagnosis: personnel.diagnosis,
        notes: personnel.notes || '',
      });
    } else {
      reset({
        personal_number: '',
        unit: '',
        rank: '',
        full_name: '',
        arrival_date: new Date().toISOString().split('T')[0],
        treatment_period: '',
        status: 'Амбулаторное лечение',
        diagnosis: '',
        notes: '',
      });
    }
  }, [personnel, reset]);

  const mutation = useMutation({
    mutationFn: async (data: PersonnelFormData) => {
      const url = personnel
        ? `/api/military/personnel/${personnel.id}`
        : '/api/military/personnel';
      const method = personnel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(personnel ? 'Запись обновлена' : 'Запись добавлена');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Ошибка при сохранении');
    },
  });

  const onSubmit = (data: PersonnelFormData) => {
    mutation.mutate(data);
  };

  const status = watch('status');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{personnel ? 'Редактировать запись' : 'Добавить военнослужащего'}</DialogTitle>
          <DialogDescription>
            Заполните все обязательные поля
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit" className="text-purple-600">
                Подразделение *
              </Label>
              <Input
                id="unit"
                {...register('unit', { required: 'Обязательное поле' })}
                className={errors.unit ? 'border-red-500' : ''}
              />
              {errors.unit && (
                <span className="text-xs text-red-600">{errors.unit.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rank" className="text-purple-600">
                Звание *
              </Label>
              <Input
                id="rank"
                {...register('rank', { required: 'Обязательное поле' })}
                className={errors.rank ? 'border-red-500' : ''}
              />
              {errors.rank && (
                <span className="text-xs text-red-600">{errors.rank.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-purple-600">
              ФИО *
            </Label>
            <Input
              id="full_name"
              {...register('full_name', { required: 'Обязательное поле' })}
              className={errors.full_name ? 'border-red-500' : ''}
            />
            {errors.full_name && (
              <span className="text-xs text-red-600">{errors.full_name.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="personal_number" className="text-purple-600">
                Личный номер *
              </Label>
              <Input
                id="personal_number"
                {...register('personal_number', { required: 'Обязательное поле' })}
                className={errors.personal_number ? 'border-red-500' : ''}
              />
              {errors.personal_number && (
                <span className="text-xs text-red-600">{errors.personal_number.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="arrival_date">Дата прибытия</Label>
              <Input
                id="arrival_date"
                type="date"
                {...register('arrival_date')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="treatment_period">Срок излечения</Label>
              <Select
                value={watch('treatment_period')}
                onValueChange={(value) => setValue('treatment_period', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите срок" />
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_PERIODS.map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis" className="text-purple-600">
              Диагноз *
            </Label>
            <Textarea
              id="diagnosis"
              {...register('diagnosis', { required: 'Обязательное поле' })}
              className={errors.diagnosis ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.diagnosis && (
              <span className="text-xs text-red-600">{errors.diagnosis.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечание</Label>
            <Textarea id="notes" {...register('notes')} rows={2} />
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

export default PersonnelDialog;
