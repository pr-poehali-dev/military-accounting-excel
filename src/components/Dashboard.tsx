import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { militaryApi } from '@/lib/militaryApi';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => militaryApi.getStats(),
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Icon name="Loader2" className="animate-spin" size={48} />
      </div>
    );
  }

  const statCards = [
    { title: 'Всего в базе', value: stats?.total || 0, icon: 'Users', color: 'text-blue-600' },
    { title: 'В ПВД', value: stats?.v_pvd || 0, icon: 'Hospital', color: 'text-purple-600' },
    { title: 'В строю', value: stats?.v_stroyu || 0, icon: 'CheckCircle2', color: 'text-green-600' },
    { title: 'Госпитализация', value: stats?.gospitalizaciya || 0, icon: 'Ambulance', color: 'text-red-600' },
    { title: 'В отпуске', value: stats?.otpusk || 0, icon: 'Plane', color: 'text-orange-600' },
    { title: 'Убыл', value: stats?.ubyl || 0, icon: 'UserMinus', color: 'text-gray-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Панель управления</h1>
        <p className="text-muted-foreground mt-2">Общая статистика по военнослужащим</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon name={stat.icon as any} className={stat.color} size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
