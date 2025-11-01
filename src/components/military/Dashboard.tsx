import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';

interface Stats {
  total: number;
  active: number;
  onLeave: number;
  hospitalized: number;
  categoryDV: number;
  problems: number;
  longTreatment: number;
  overdueLeaves: number;
}

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getStats(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Загрузка статистики...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Всего в учёте',
      value: stats?.total || 0,
      icon: 'Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'В строю',
      value: stats?.active || 0,
      icon: 'UserCheck',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'В отпуске',
      value: stats?.onLeave || 0,
      icon: 'Calendar',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Госпитализировано',
      value: stats?.hospitalized || 0,
      icon: 'Hospital',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Категории Д и В',
      value: stats?.categoryDV || 0,
      icon: 'FileText',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
    },
    {
      title: 'Проблемных вопросов',
      value: stats?.problems || 0,
      icon: 'AlertTriangle',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const alerts = [
    {
      title: 'Длительное излечение',
      count: stats?.longTreatment || 0,
      description: 'Военнослужащих в ПВД более 30 суток',
      icon: 'Clock',
      severity: 'high',
    },
    {
      title: 'Просроченные отпуска',
      count: stats?.overdueLeaves || 0,
      description: 'Отпусков с истекшим сроком',
      icon: 'CalendarX',
      severity: 'high',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Панель управления</h2>
        <p className="text-muted-foreground">Общая статистика и ключевые показатели</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded`}>
                <Icon name={stat.icon} className={stat.color} size={20} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="AlertTriangle" className="text-red-600" size={20} />
            Критические уведомления
          </CardTitle>
          <CardDescription>Требуют немедленного внимания</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.title}
                className="flex items-start justify-between p-4 border rounded-lg bg-red-50 border-red-200"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded">
                    <Icon name={alert.icon} className="text-red-600" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-red-900">{alert.title}</div>
                    <div className="text-sm text-red-700">{alert.description}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">{alert.count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;