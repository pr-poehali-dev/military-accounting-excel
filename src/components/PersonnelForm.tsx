import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { militaryApi } from '@/lib/militaryApi';
import { toast } from 'sonner';

const PersonnelForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    personal_number: '',
    full_name: '',
    rank: '',
    unit: '',
    phone: '',
    current_status: 'в_пвд',
    fitness_category: '',
    fitness_category_date: '',
  });

  const mutation = useMutation({
    mutationFn: () => militaryApi.createPersonnel(formData),
    onSuccess: (data) => {
      toast.success('Военнослужащий добавлен');
      queryClient.invalidateQueries({ queryKey: ['personnel'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate(`/personnel/${data.id}`);
    },
    onError: () => {
      toast.error('Ошибка при добавлении');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.personal_number || !formData.full_name) {
      toast.error('Заполните обязательные поля');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/registry')}>
          <Icon name="ArrowLeft" size={24} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Добавить военнослужащего</h1>
          <p className="text-muted-foreground mt-1">Заполните данные нового бойца</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
          <CardDescription>Поля отмеченные * обязательны для заполнения</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="personal_number">Личный номер *</Label>
              <Input
                id="personal_number"
                value={formData.personal_number}
                onChange={(e) => setFormData({ ...formData, personal_number: e.target.value })}
                placeholder="Например: В-123456"
              />
            </div>

            <div>
              <Label htmlFor="full_name">ФИО *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Иванов Иван Иванович"
              />
            </div>

            <div>
              <Label htmlFor="rank">Звание</Label>
              <Input
                id="rank"
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                placeholder="Например: Рядовой"
              />
            </div>

            <div>
              <Label htmlFor="unit">Подразделение</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Например: 1-я рота"
              />
            </div>

            <div>
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+7 (900) 123-45-67"
              />
            </div>

            <div>
              <Label htmlFor="current_status">Текущий статус</Label>
              <Select
                value={formData.current_status}
                onValueChange={(value) => setFormData({ ...formData, current_status: value })}
              >
                <SelectTrigger id="current_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="в_пвд">В ПВД</SelectItem>
                  <SelectItem value="в_строю">В строю</SelectItem>
                  <SelectItem value="госпитализация">Госпитализация</SelectItem>
                  <SelectItem value="отпуск">В отпуске</SelectItem>
                  <SelectItem value="убыл">Убыл</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fitness_category">Категория годности</Label>
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

            {formData.fitness_category && (
              <div>
                <Label htmlFor="fitness_category_date">Дата установления категории</Label>
                <Input
                  id="fitness_category_date"
                  type="date"
                  value={formData.fitness_category_date}
                  onChange={(e) => setFormData({ ...formData, fitness_category_date: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/registry')}>
                Отмена
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonnelForm;