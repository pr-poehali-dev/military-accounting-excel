import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { militaryApi } from '@/lib/militaryApi';
import { toast } from 'sonner';

const PersonnelCard = () => {
  const { id } = useParams<{ id: string }>();
  const personnelId = parseInt(id || '0');
  const queryClient = useQueryClient();

  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['personnel-detail', personnelId],
    queryFn: () => militaryApi.getPersonnelDetail(personnelId),
  });

  const movementMutation = useMutation({
    mutationFn: (formData: any) => militaryApi.addMovement(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel-detail', personnelId] });
      queryClient.invalidateQueries({ queryKey: ['military-stats'] });
      queryClient.invalidateQueries({ queryKey: ['military-personnel'] });
      setShowMovementForm(false);
      toast.success('Движение добавлено');
    },
  });

  const medicalMutation = useMutation({
    mutationFn: (formData: any) => militaryApi.addMedicalVisit(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personnel-detail', personnelId] });
      queryClient.invalidateQueries({ queryKey: ['military-personnel'] });
      setShowMedicalForm(false);
      toast.success('Визит к врачу добавлен');
    },
  });

  const handleMovementSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    movementMutation.mutate({
      personnel_id: personnelId,
      movement_type: formData.get('movement_type'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date') || undefined,
      destination: formData.get('destination') || undefined,
      notes: formData.get('notes') || undefined,
    });
  };

  const handleMedicalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    medicalMutation.mutate({
      personnel_id: personnelId,
      visit_date: formData.get('visit_date'),
      doctor_specialty: formData.get('doctor_specialty'),
      diagnosis: formData.get('diagnosis') || undefined,
      recommendations: formData.get('recommendations') || undefined,
      fitness_category: formData.get('fitness_category') || undefined,
    });
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  const { personnel, movements, medical_visits } = data;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Карточка военнослужащего</h1>
          <a href="/military/registry">
            <Button variant="outline">
              <Icon name="ArrowLeft" size={18} className="mr-2" />
              Назад
            </Button>
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{personnel.full_name}</span>
              <Badge variant="default">{personnel.current_status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Личный номер</div>
                <div className="font-mono font-medium">{personnel.personal_number}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Звание</div>
                <div className="font-medium">{personnel.rank || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Подразделение</div>
                <div className="font-medium">{personnel.unit || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Телефон</div>
                {personnel.phone ? (
                  <a href={`tel:${personnel.phone}`} className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                    <Icon name="Phone" size={14} />
                    {personnel.phone}
                  </a>
                ) : (
                  <div className="font-medium">-</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">Категория годности</div>
                <div className="font-medium">{personnel.fitness_category || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Дата категории</div>
                <div className="font-medium">{personnel.fitness_category_date || '-'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon name="Route" size={20} />
                  История движений
                </span>
                <Button size="sm" onClick={() => setShowMovementForm(!showMovementForm)}>
                  <Icon name="Plus" size={16} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showMovementForm && (
                <form onSubmit={handleMovementSubmit} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <select name="movement_type" required className="w-full px-3 py-2 border rounded-md">
                    <option value="">Тип движения</option>
                    <option value="в_пвд">В ПВД</option>
                    <option value="в_строю">В строю</option>
                    <option value="госпитализация">Госпитализация</option>
                    <option value="отпуск">Отпуск</option>
                    <option value="убыл">Убыл</option>
                  </select>
                  <Input name="start_date" type="date" required placeholder="Дата начала" />
                  <Input name="end_date" type="date" placeholder="Дата окончания" />
                  <Input name="destination" placeholder="Место назначения" />
                  <Input name="notes" placeholder="Примечания" />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1">Добавить</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowMovementForm(false)}>Отмена</Button>
                  </div>
                </form>
              )}

              {movements.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Icon name="Route" size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Нет записей о движении</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {movements.map((movement) => (
                    <div key={movement.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="font-medium">{movement.movement_type}</div>
                      <div className="text-gray-600">
                        {movement.start_date} {movement.end_date && `— ${movement.end_date}`}
                      </div>
                      {movement.destination && <div className="text-gray-600">{movement.destination}</div>}
                      {movement.notes && <div className="text-gray-500 text-xs mt-1">{movement.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Icon name="Stethoscope" size={20} />
                  Медосмотры
                </span>
                <Button size="sm" onClick={() => setShowMedicalForm(!showMedicalForm)}>
                  <Icon name="Plus" size={16} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {showMedicalForm && (
                <form onSubmit={handleMedicalSubmit} className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <Input name="visit_date" type="date" required placeholder="Дата визита" />
                  <Input name="doctor_specialty" required placeholder="Специальность врача" />
                  <Input name="diagnosis" placeholder="Диагноз" />
                  <Input name="recommendations" placeholder="Рекомендации" />
                  <select name="fitness_category" className="w-full px-3 py-2 border rounded-md">
                    <option value="">Категория годности (опционально)</option>
                    <option value="А">А</option>
                    <option value="Б">Б</option>
                    <option value="В">В</option>
                    <option value="Г">Г</option>
                    <option value="Д">Д</option>
                  </select>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="flex-1">Добавить</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowMedicalForm(false)}>Отмена</Button>
                  </div>
                </form>
              )}

              {medical_visits.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Icon name="Stethoscope" size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Нет записей о визитах</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {medical_visits.map((visit) => (
                    <div key={visit.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">{visit.doctor_specialty}</div>
                        <div className="text-gray-500 text-xs">{visit.visit_date}</div>
                      </div>
                      {visit.diagnosis && <div className="text-gray-600">Диагноз: {visit.diagnosis}</div>}
                      {visit.recommendations && <div className="text-gray-500 text-xs mt-1">{visit.recommendations}</div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonnelCard;
