import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { militaryApi } from '@/lib/militaryApi';

const Dashboard = () => {
  const navigate = useNavigate();
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
    { title: 'Всего в базе', value: stats?.total || 0, icon: 'Users', color: 'text-blue-600', status: '' },
    { title: 'В ПВД', value: stats?.v_pvd || 0, icon: 'Hospital', color: 'text-purple-600', status: 'в_пвд' },
    { title: 'В строю', value: stats?.v_stroyu || 0, icon: 'CheckCircle2', color: 'text-green-600', status: 'в_строю' },
    { title: 'Госпитализация', value: stats?.gospitalizaciya || 0, icon: 'Ambulance', color: 'text-red-600', status: 'госпитализация' },
    { title: 'В отпуске', value: stats?.otpusk || 0, icon: 'Plane', color: 'text-orange-600', status: 'отпуск' },
    { title: 'ВВК', value: stats?.vvk || 0, icon: 'ClipboardList', color: 'text-yellow-600', status: 'ввк' },
    { title: 'Амбулаторное', value: stats?.ambulatory || 0, icon: 'Stethoscope', color: 'text-teal-600', status: 'амбулаторное_лечение' },
    { title: 'Увольнение', value: stats?.uvolnenie || 0, icon: 'UserX', color: 'text-pink-600', status: 'увольнение' },
    { title: 'Убыл', value: stats?.ubyl || 0, icon: 'UserMinus', color: 'text-gray-600', status: 'убыл' },
  ];
  
  const handleCardClick = (status: string) => {
    if (status) {
      navigate(`/registry?status=${status}`);
    }
  };

  const alerts = stats?.alerts;
  const hasAlerts = alerts && (alerts.hosp_over_30 > 0 || alerts.pvd_over_30 > 0 || alerts.leave_overdue > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Панель управления</h1>
        <p className="text-muted-foreground mt-2">Общая статистика по военнослужащим</p>
      </div>

      {hasAlerts && (
        <div className="space-y-3">
          {alerts.hosp_over_30 > 0 && (
            <Alert variant="destructive">
              <Icon name="AlertTriangle" size={18} />
              <AlertDescription>
                <strong>{alerts.hosp_over_30}</strong> военнослужащих находятся в госпитале более 30 дней. Необходимо связаться!
              </AlertDescription>
            </Alert>
          )}
          {alerts.pvd_over_30 > 0 && (
            <Alert variant="destructive">
              <Icon name="AlertTriangle" size={18} />
              <AlertDescription>
                <strong>{alerts.pvd_over_30}</strong> военнослужащих находятся в ПВД более 30 дней. Требуется разобраться!
              </AlertDescription>
            </Alert>
          )}
          {alerts.leave_overdue > 0 && (
            <Alert variant="destructive">
              <Icon name="AlertTriangle" size={18} />
              <AlertDescription>
                <strong>{alerts.leave_overdue}</strong> военнослужащих просрочили возвращение из отпуска. Свяжитесь с ними!
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card 
            key={stat.title}
            className={stat.status ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}
            onClick={() => handleCardClick(stat.status)}
          >
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