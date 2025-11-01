import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import HospitalizationDialog from './HospitalizationDialog';
import { toast } from 'sonner';

interface Hospitalization {
  id: number;
  personnel_id: number;
  full_name: string;
  unit: string;
  rank: string;
  personal_number: string;
  medical_facility: string;
  admission_date: string;
  days_in_hospital: number;
  comment: string;
  problem_resolved: boolean;
}

const Hospitalizations = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedHospitalization, setSelectedHospitalization] = useState<Hospitalization | null>(null);
  const queryClient = useQueryClient();

  const { data: hospitalizations, isLoading } = useQuery<Hospitalization[]>({
    queryKey: ['hospitalizations'],
    queryFn: async () => {
      const response = await fetch('/api/military/hospitalizations');
      if (!response.ok) throw new Error('Failed to fetch hospitalizations');
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/military/hospitalizations/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitalizations'] });
      toast.success('Запись удалена');
    },
  });

  const handleEdit = (hospitalization: Hospitalization) => {
    setSelectedHospitalization(hospitalization);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedHospitalization(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Госпитализация</h2>
          <p className="text-muted-foreground">Учёт военнослужащих в ВМО</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Icon name="Plus" size={16} />
          Добавить
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Текущие госпитализации</CardTitle>
          <CardDescription>
            Всего записей: {hospitalizations?.length || 0}
            {hospitalizations && hospitalizations.filter(h => h.days_in_hospital > 30).length > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                | Более 30 дней: {hospitalizations.filter(h => h.days_in_hospital > 30).length}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : !hospitalizations || hospitalizations.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Hospital" className="mx-auto mb-4 text-muted-foreground" size={48} />
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
                    <th className="text-left p-3 font-semibold text-sm">ВМО</th>
                    <th className="text-left p-3 font-semibold text-sm">Дата госпитализации</th>
                    <th className="text-left p-3 font-semibold text-sm">Дней в ВМО</th>
                    <th className="text-left p-3 font-semibold text-sm">Комментарий</th>
                    <th className="text-left p-3 font-semibold text-sm">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitalizations.map((hosp, idx) => (
                    <tr
                      key={hosp.id}
                      className={`border-b hover:bg-muted/50 ${
                        hosp.days_in_hospital > 30 ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="p-3 text-sm">{idx + 1}</td>
                      <td className="p-3 text-sm">{hosp.unit}</td>
                      <td className="p-3 text-sm">{hosp.rank}</td>
                      <td className="p-3 text-sm font-medium">{hosp.full_name}</td>
                      <td className="p-3 text-sm">{hosp.medical_facility}</td>
                      <td className="p-3 text-sm">
                        {new Date(hosp.admission_date).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-3">
                        <Badge className={hosp.days_in_hospital > 30 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                          {hosp.days_in_hospital}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm max-w-xs truncate">{hosp.comment}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(hosp)}
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(hosp.id)}
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

      <HospitalizationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        hospitalization={selectedHospitalization}
      />
    </div>
  );
};

export default Hospitalizations;
