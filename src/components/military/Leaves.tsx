import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import LeaveDialog from './LeaveDialog';
import { toast } from 'sonner';

interface Leave {
  id: number;
  personnel_id: number;
  full_name: string;
  unit: string;
  rank: string;
  personal_number: string;
  leave_type: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  is_overdue: boolean;
  comment: string;
  problem_resolved: boolean;
}

const Leaves = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const queryClient = useQueryClient();

  const { data: leaves, isLoading } = useQuery<Leave[]>({
    queryKey: ['leaves'],
    queryFn: async () => {
      const response = await fetch('/api/military/leaves');
      if (!response.ok) throw new Error('Failed to fetch leaves');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/military/leaves/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Отпуск удалён');
    },
  });

  const handleEdit = (leave: Leave) => {
    setSelectedLeave(leave);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedLeave(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Учёт отпусков</h2>
          <p className="text-muted-foreground">Контроль сроков и возвращений из отпусков</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Icon name="Plus" size={16} />
          Добавить отпуск
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Текущие отпуска</CardTitle>
          <CardDescription>
            Всего записей: {leaves?.length || 0}
            {leaves && leaves.filter(l => l.is_overdue).length > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                | Просрочено: {leaves.filter(l => l.is_overdue).length}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : !leaves || leaves.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Calendar" className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Нет записей</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-sm">№</th>
                    <th className="text-left p-3 font-semibold text-sm">Подразделение</th>
                    <th className="text-left p-3 font-semibold text-sm">Звание</th>
                    <th className="text-left p-3 font-semibold text-sm">ФИО</th>
                    <th className="text-left p-3 font-semibold text-sm">Вид</th>
                    <th className="text-left p-3 font-semibold text-sm">Срок (дней)</th>
                    <th className="text-left p-3 font-semibold text-sm">Начало</th>
                    <th className="text-left p-3 font-semibold text-sm">Окончание</th>
                    <th className="text-left p-3 font-semibold text-sm">Статус</th>
                    <th className="text-left p-3 font-semibold text-sm">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave, idx) => (
                    <tr
                      key={leave.id}
                      className={`border-b hover:bg-muted/50 ${
                        leave.is_overdue ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="p-3 text-sm">{idx + 1}</td>
                      <td className="p-3 text-sm">{leave.unit}</td>
                      <td className="p-3 text-sm">{leave.rank}</td>
                      <td className="p-3 text-sm font-medium">{leave.full_name}</td>
                      <td className="p-3 text-sm">{leave.leave_type}</td>
                      <td className="p-3 text-sm">{leave.duration_days}</td>
                      <td className="p-3 text-sm">
                        {new Date(leave.start_date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-3 text-sm">
                        {new Date(leave.end_date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-3">
                        {leave.is_overdue ? (
                          <Badge className="bg-red-100 text-red-800 border-red-300">
                            Просрочен
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            В срок
                          </Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(leave)}
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(leave.id)}
                          >
                            <Icon name="Trash2" size={16} className="text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <LeaveDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        leave={selectedLeave}
      />
    </div>
  );
};

export default Leaves;
