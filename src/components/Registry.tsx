import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { militaryApi, Personnel } from '@/lib/militaryApi';
import { useNavigate } from 'react-router-dom';

const Registry = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
    }
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['personnel', search, unitFilter, statusFilter],
    queryFn: () => militaryApi.getPersonnel(search, unitFilter, statusFilter),
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

  const handleExport = async () => {
    try {
      const result = await militaryApi.exportData(unitFilter, statusFilter);
      const csv = convertToCSV(result.data);
      downloadCSV(csv, 'personnel.csv');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const convertToCSV = (data: Personnel[]) => {
    const headers = ['Личный номер', 'ФИО', 'Звание', 'Подразделение', 'Телефон', 'Статус', 'Категория', 'Дата категории'];
    const rows = data.map(p => [
      p.personal_number,
      p.full_name,
      p.rank || '',
      p.unit || '',
      p.phone || '',
      getStatusLabel(p.current_status),
      p.fitness_category || '',
      p.fitness_category_date || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(';')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Реестр военнослужащих</h1>
          <p className="text-muted-foreground mt-2">Полный список с возможностью фильтрации</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Icon name="FileDown" size={16} className="mr-2" />
            Экспорт в Excel
          </Button>
          <Button onClick={() => navigate('/personnel/new')}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              placeholder="Поиск по ФИО или личному номеру..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={unitFilter || 'all'} onValueChange={(value) => setUnitFilter(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Все подразделения" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все подразделения</SelectItem>
                {data?.units.map((unit) => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter || 'all'} onValueChange={(value) => setStatusFilter(value === 'all' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Все статусы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="в_строю">В строю</SelectItem>
                <SelectItem value="в_пвд">В ПВД</SelectItem>
                <SelectItem value="госпитализация">Госпитализация</SelectItem>
                <SelectItem value="отпуск">В отпуске</SelectItem>
                <SelectItem value="ввк">ВВК</SelectItem>
                <SelectItem value="амбулаторное_лечение">Амбулаторное лечение</SelectItem>
                <SelectItem value="увольнение">Увольнение</SelectItem>
                <SelectItem value="убыл">Убыл</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" className="animate-spin" size={48} />
        </div>
      ) : (
        <div className="grid gap-4">
          {data?.personnel.map((person) => (
            <Card 
              key={person.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/personnel/${person.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{person.full_name}</h3>
                      <Badge className={getStatusColor(person.current_status)}>
                        {getStatusLabel(person.current_status)}
                      </Badge>
                      {person.fitness_category && (
                        <Badge variant="outline">Категория: {person.fitness_category}</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <Icon name="Hash" size={14} className="inline mr-1" />
                        {person.personal_number}
                      </div>
                      {person.rank && (
                        <div>
                          <Icon name="Award" size={14} className="inline mr-1" />
                          {person.rank}
                        </div>
                      )}
                      {person.unit && (
                        <div>
                          <Icon name="Users" size={14} className="inline mr-1" />
                          {person.unit}
                        </div>
                      )}
                      {person.phone && (
                        <div>
                          <Icon name="Phone" size={14} className="inline mr-1" />
                          {person.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={24} className="text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.personnel.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Нет данных для отображения
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Registry;