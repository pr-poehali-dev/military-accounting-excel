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

interface LeaveFormData {
  personnel_id: number;
  leave_type: string;
  duration_days: number;
  start_date: string;
  comment: string;
}

interface LeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: any;
}

const LEAVE_TYPES = ['по болезни', 'основной', 'ветеранский', 'по семейным'];
const DURATIONS = [15, 30, 45, 60];

const LeaveDialog = ({ open, onOpenChange, leave }: LeaveDialogProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<LeaveFormData>();

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
    if (leave) {
      reset({
        personnel_id: leave.personnel_id,
        leave_type: leave.leave_type,
        duration_days: leave.duration_days,
        start_date: leave.start_date,
        comment: leave.comment || '',
      });
    } else {
      reset({
        personnel_id: 0,
        leave_type: 'основной',
        duration_days: 30,
        start_date: new Date().toISOString().split('T')[0],
        comment: '',
      });
    }
  }, [leave, reset]);

  const mutation = useMutation({
    mutationFn: async (data: LeaveFormData) => {
      const url = leave ? `/api/military/leaves/${leave.id}` : '/api/military/leaves';
      const method = leave ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success(leave ? 'Отпуск обновлён' : 'Отпуск добавлен');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Ошибка при сохранении');
    },
  });

  const onSubmit = (data: LeaveFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{leave ? 'Редактировать отпуск' : 'Добавить отпуск'}</DialogTitle>
          <DialogDescription>
            Укажите данные отпуска военнослужащего
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leave_type">Вид отпуска</Label>
              <Select
                value={watch('leave_type')}
                onValueChange={(value) => setValue('leave_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите вид" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_days">Срок (суток)</Label>
              <Select
                value={watch('duration_days')?.toString()}
                onValueChange={(value) => setValue('duration_days', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите срок" />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={duration.toString()}>
                      {duration} дней
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Дата начала</Label>
            <Input
              id="start_date"
              type="date"
              {...register('start_date')}
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

export default LeaveDialog;
