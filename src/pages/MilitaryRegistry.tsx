import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { militaryApi, type Personnel } from '@/lib/militaryApi';
import * as XLSX from 'xlsx';

const MilitaryRegistry = () => {
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['military-personnel', search, unitFilter, statusFilter],
    queryFn: () => militaryApi.getPersonnel(search, unitFilter, statusFilter),
  });

  const handleExport = async () => {
    const exportData = await militaryApi.exportData();
    const worksheet = XLSX.utils.json_to_sheet(exportData.map(p => ({
      'Личный номер': p.personal_number,
      'ФИО': p.full_name,
      'Звание': p.rank || '',
      'Подразделение': p.unit || '',
      'Телефон': p.phone || '',
      'Статус': p.current_status,
      'Категория': p.fitness_category || '',
      'Дата категории': p.fitness_category_date || ''
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Военнослужащие');
    XLSX.writeFile(workbook, `Реестр_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      'в_пвд': { variant: 'default', label: 'В ПВД' },
      'в_строю': { variant: 'secondary', label: 'В строю' },
      'госпитализация': { variant: 'destructive', label: 'Госпитализация' },
      'отпуск': { variant: 'outline', label: 'Отпуск' },
      'убыл': { variant: 'outline', label: 'Убыл' }
    };
    const config = statusConfig[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  const personnel = data?.personnel || [];
  const units = data?.units || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Реестр военнослужащих</h1>
          <div className="flex gap-3">
            <Button onClick={handleExport} variant="outline">
              <Icon name="Download" size={18} className="mr-2" />
              Экспорт в Excel
            </Button>
            <a href="/military">
              <Button variant="outline">
                <Icon name="BarChart3" size={18} className="mr-2" />
                Статистика
              </Button>
            </a>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Поиск</label>
                <div className="relative">
                  <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="ФИО или личный номер"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Подразделение</label>
                <select
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Все подразделения</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Статус</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Все статусы</option>
                  <option value="в_пвд">В ПВД</option>
                  <option value="в_строю">В строю</option>
                  <option value="госпитализация">Госпитализация</option>
                  <option value="отпуск">Отпуск</option>
                  <option value="убыл">Убыл</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Всего найдено: {personnel.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Личный номер</th>
                    <th className="text-left py-3 px-4">ФИО</th>
                    <th className="text-left py-3 px-4">Звание</th>
                    <th className="text-left py-3 px-4">Подразделение</th>
                    <th className="text-left py-3 px-4">Телефон</th>
                    <th className="text-left py-3 px-4">Статус</th>
                    <th className="text-left py-3 px-4">Категория</th>
                    <th className="text-right py-3 px-4">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {personnel.map((person) => (
                    <tr key={person.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{person.personal_number}</td>
                      <td className="py-3 px-4 font-medium">{person.full_name}</td>
                      <td className="py-3 px-4 text-sm">{person.rank || '-'}</td>
                      <td className="py-3 px-4 text-sm">{person.unit || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        {person.phone ? (
                          <a href={`tel:${person.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <Icon name="Phone" size={14} />
                            {person.phone}
                          </a>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(person.current_status)}</td>
                      <td className="py-3 px-4 text-sm">
                        {person.fitness_category || '-'}
                        {person.fitness_category_date && (
                          <div className="text-xs text-gray-500">{person.fitness_category_date}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a href={`/military/personnel/${person.id}`}>
                          <Button variant="ghost" size="sm">
                            <Icon name="Eye" size={16} />
                          </Button>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {personnel.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Icon name="Users" size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>Военнослужащие не найдены</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MilitaryRegistry;
