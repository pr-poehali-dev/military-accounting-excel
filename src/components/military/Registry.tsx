import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import PersonnelDialog from './PersonnelDialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Personnel {
  id: number;
  personal_number: string;
  unit: string;
  rank: string;
  full_name: string;
  arrival_date: string;
  treatment_period: string;
  status: string;
  diagnosis: string;
  notes: string;
  days_in_pvd: number;
  estimated_return_date: string;
  status_date: string;
  last_activity: string;
  problem_resolved: boolean;
}

const Registry = () => {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const queryClient = useQueryClient();

  const { data: personnel, isLoading } = useQuery<Personnel[]>({
    queryKey: ['personnel', search],
    queryFn: () => api.getPersonnel(search),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deletePersonnel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      toast.success('Запись удалена');
    },
  });

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'годен в строй': 'bg-green-100 text-green-800 border-green-300',
      'Амбулаторное лечение': 'bg-blue-100 text-blue-800 border-blue-300',
      'проходит ВВК': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'категория В': 'bg-gray-100 text-gray-800 border-gray-300',
      'Категория Д': 'bg-gray-100 text-gray-800 border-gray-300',
      'отпуск': 'bg-purple-100 text-purple-800 border-purple-300',
      'госпитализация': 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getDaysColor = (days: number) => {
    if (days < 15) return 'bg-green-100 text-green-800';
    if (days <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const handleEdit = (person: Personnel) => {
    setSelectedPersonnel(person);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedPersonnel(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Реестр военнослужащих</h2>
          <p className="text-muted-foreground">Полный список личного состава</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Icon name="Plus" size={16} />
          Добавить
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Поиск по ФИО, личному номеру, подразделению..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Личный состав</CardTitle>
          <CardDescription>Всего записей: {personnel?.length || 0}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : !personnel || personnel.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Users" className="mx-auto mb-4 text-muted-foreground" size={48} />
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
                    <th className="text-left p-3 font-semibold text-sm">Личный номер</th>
                    <th className="text-left p-3 font-semibold text-sm">Статус</th>
                    <th className="text-left p-3 font-semibold text-sm">В ПВД (сутки)</th>
                    <th className="text-left p-3 font-semibold text-sm">Диагноз</th>
                    <th className="text-left p-3 font-semibold text-sm">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel.map((person, idx) => (
                    <tr
                      key={person.id}
                      className={`border-b hover:bg-muted/50 ${
                        person.days_in_pvd > 30 ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="p-3 text-sm">{idx + 1}</td>
                      <td className="p-3 text-sm">{person.unit}</td>
                      <td className="p-3 text-sm">{person.rank}</td>
                      <td className="p-3 text-sm font-medium">{person.full_name}</td>
                      <td className="p-3 text-sm">{person.personal_number}</td>
                      <td className="p-3">
                        <Badge variant="outline" className={getStatusColor(person.status)}>
                          {person.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={getDaysColor(person.days_in_pvd)}>
                          {person.days_in_pvd}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm max-w-xs truncate">{person.diagnosis}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(person)}
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(person.id)}
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

      <PersonnelDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        personnel={selectedPersonnel}
      />
    </div>
  );
};

export default Registry;