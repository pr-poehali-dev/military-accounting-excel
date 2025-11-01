import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { militaryApi } from '@/lib/militaryApi';
import MovementDialog from '@/components/MovementDialog';
import MedicalVisitDialog from '@/components/MedicalVisitDialog';
import { toast } from 'sonner';

const PersonnelCard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [medicalDialogOpen, setMedicalDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['personnel-detail', id],
    queryFn: () => militaryApi.getPersonnelDetail(Number(id)),
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'в_строю': 'bg-green-500',
      'в_пвд': 'bg-purple-500',
      'госпитализация': 'bg-red-500',
      'отпуск': 'bg-orange-500',
      'убыл': 'bg-gray-500',
      'ввк': 'bg-yellow-500',
      'амбулаторное_лечение': 'bg-teal-500',
      'увольнение': 'bg-pink-500',
    };
    return colors[status] || 'bg-blue-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'в_строю': 'В строю',
      'в_пвд': 'В ПВД',
      'госпитализация': 'Госпитализация',
      'отпуск': 'В отпуске',
      'убыл': 'Убыл',
      'ввк': 'ВВК',
      'амбулаторное_лечение': 'Амбулаторное',
      'увольнение': 'Увольнение',
    };
    return labels[status] || status;
  };

  const getMovementTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'госпитализация': 'Госпитализация',
      'отпуск': 'Отпуск',
      'убыл': 'Убыл',
      'прибыл': 'Прибыл в ПВД',
      'в_строй': 'Возвращение в строй',
      'ввк': 'ВВК на изменение категории',
      'амбулаторное_лечение': 'Амбулаторное лечение',
      'увольнение': 'Увольнение',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Военнослужащий не найден</p>
        <Button onClick={() => navigate('/registry')} className="mt-4">
          Вернуться к реестру
        </Button>
      </div>
    );
  }

  const { personnel, movements, medical_visits } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/registry')}>
          <Icon name="ArrowLeft" size={24} />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{personnel.full_name}</h1>
          <p className="text-muted-foreground mt-1">Личный номер: {personnel.personal_number}</p>
        </div>
        <Badge className={getStatusColor(personnel.current_status)} className="text-lg px-4 py-2">
          {getStatusLabel(personnel.current_status)}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {personnel.rank && (
              <div>
                <p className="text-sm text-muted-foreground">Звание</p>
                <p className="font-medium">{personnel.rank}</p>
              </div>
            )}
            {personnel.unit && (
              <div>
                <p className="text-sm text-muted-foreground">Подразделение</p>
                <p className="font-medium">{personnel.unit}</p>
              </div>
            )}
            {personnel.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Телефон</p>
                <p className="font-medium">{personnel.phone}</p>
              </div>
            )}
            {personnel.fitness_category && (
              <div>
                <p className="text-sm text-muted-foreground">Категория годности</p>
                <p className="font-medium">
                  {personnel.fitness_category}
                  {personnel.fitness_category_date && (
                    <span className="text-sm text-muted-foreground ml-2">
                      от {new Date(personnel.fitness_category_date).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="movements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="movements">
            <Icon name="MapPin" size={16} className="mr-2" />
            Движения
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Icon name="Stethoscope" size={16} className="mr-2" />
            Медосмотры
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setMovementDialogOpen(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить движение
            </Button>
          </div>

          <div className="space-y-3">
            {movements.map((movement) => (
              <Card key={movement.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{getMovementTypeLabel(movement.movement_type)}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Icon name="Calendar" size={14} className="inline mr-1" />
                        {new Date(movement.start_date).toLocaleDateString('ru-RU')}
                        {movement.end_date && (
                          <> - {new Date(movement.end_date).toLocaleDateString('ru-RU')}</>
                        )}
                      </p>
                      {movement.vmo && (
                        <p className="text-sm text-muted-foreground">
                          <Icon name="Hospital" size={14} className="inline mr-1" />
                          ВМО: {movement.vmo}
                        </p>
                      )}
                      {movement.destination && (
                        <p className="text-sm text-muted-foreground">
                          <Icon name="MapPin" size={14} className="inline mr-1" />
                          {movement.destination}
                        </p>
                      )}
                      {movement.leave_days && (
                        <p className="text-sm text-muted-foreground">
                          <Icon name="Clock" size={14} className="inline mr-1" />
                          {movement.leave_days} суток
                          {movement.expected_return_date && (
                            <span> (возвращение: {new Date(movement.expected_return_date).toLocaleDateString('ru-RU')})</span>
                          )}
                        </p>
                      )}
                      {movement.notes && (
                        <p className="text-sm mt-2">{movement.notes}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {movements.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Нет записей о движениях
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setMedicalDialogOpen(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить осмотр
            </Button>
          </div>

          <div className="space-y-3">
            {medical_visits.map((visit) => (
              <Card key={visit.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{visit.doctor_specialty}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Icon name="Calendar" size={14} className="inline mr-1" />
                        {new Date(visit.visit_date).toLocaleDateString('ru-RU')}
                      </p>
                      {visit.diagnosis && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Диагноз:</span> {visit.diagnosis}
                        </p>
                      )}
                      {visit.recommendations && (
                        <p className="text-sm mt-1 text-muted-foreground">
                          {visit.recommendations}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {medical_visits.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Нет записей о медосмотрах
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <MovementDialog
        open={movementDialogOpen}
        onClose={() => setMovementDialogOpen(false)}
        personnelId={personnel.id}
      />
      
      <MedicalVisitDialog
        open={medicalDialogOpen}
        onClose={() => setMedicalDialogOpen(false)}
        personnelId={personnel.id}
      />
    </div>
  );
};

export default PersonnelCard;