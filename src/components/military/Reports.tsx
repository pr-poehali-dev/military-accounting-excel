import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportData {
  byStatus: { name: string; value: number }[];
  byUnit: { name: string; total: number; active: number; problems: number }[];
  byTreatmentPeriod: { name: string; value: number }[];
  timeline: { date: string; added: number; returned: number }[];
}

const COLORS = ['#16a34a', '#2563eb', '#9333ea', '#ea580c', '#6b7280', '#dc2626'];

const Reports = () => {
  const { data: reportData, isLoading } = useQuery<ReportData>({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await fetch('/api/military/reports');
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    },
  });

  const handleExport = async (format: string) => {
    const response = await fetch(`/api/military/export?format=${format}`);
    if (!response.ok) return;
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `military_report_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка отчётов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Отчёты и аналитика</h2>
          <p className="text-muted-foreground">Статистика и визуализация данных</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('xlsx')} className="gap-2">
            <Icon name="FileSpreadsheet" size={16} />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
            <Icon name="FileText" size={16} />
            PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
            <CardDescription>Общая картина учёта военнослужащих</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData?.byStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData?.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Статистика по подразделениям</CardTitle>
            <CardDescription>Сравнение численности и проблем</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.byUnit || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#2563eb" name="Всего" />
                <Bar dataKey="active" fill="#16a34a" name="В строю" />
                <Bar dataKey="problems" fill="#dc2626" name="Проблемы" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Сроки излечения</CardTitle>
            <CardDescription>Распределение по длительности лечения</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.byTreatmentPeriod || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#9333ea" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Динамика по времени</CardTitle>
            <CardDescription>Поступления и возвращения в строй</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData?.timeline || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="added" fill="#ea580c" name="Прибыло" />
                <Bar dataKey="returned" fill="#16a34a" name="Вернулось" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Сводная информация</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="TrendingUp" className="text-blue-600" size={24} />
                <div className="text-sm text-muted-foreground">Средний срок в ПВД</div>
              </div>
              <div className="text-2xl font-bold">18 дней</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Users" className="text-green-600" size={24} />
                <div className="text-sm text-muted-foreground">Возвращений в этом месяце</div>
              </div>
              <div className="text-2xl font-bold">42</div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Calendar" className="text-orange-600" size={24} />
                <div className="text-sm text-muted-foreground">В отпуске сейчас</div>
              </div>
              <div className="text-2xl font-bold">15</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
