import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { militaryApi, type Stats } from '@/lib/militaryApi';

const MilitaryDashboard = () => {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['military-stats'],
    queryFn: () => militaryApi.getStats(),
    refetchInterval: 30000,
  });

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Всего в ПВД', 
      value: stats.v_pvd, 
      icon: 'Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'В строю', 
      value: stats.v_stroyu, 
      icon: 'CheckCircle',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Госпитализация', 
      value: stats.gospitalizaciya, 
      icon: 'Hospital',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    { 
      title: 'В отпуске', 
      value: stats.otpusk, 
      icon: 'Plane',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    { 
      title: 'Убыл', 
      value: stats.ubyl, 
      icon: 'ArrowRight',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    { 
      title: 'Всего учтено', 
      value: stats.total, 
      icon: 'Database',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Учёт военнослужащих ПВД</h1>
          <div className="flex gap-3">
            <a
              href="/military/registry"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Icon name="List" size={20} />
              Реестр
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon name={stat.icon} className={stat.color} size={24} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Info" size={20} />
              Информация о статусах
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="Users" className="text-blue-600 mt-1" size={18} />
              <div>
                <div className="font-medium">В ПВД</div>
                <div className="text-sm text-gray-600">Военнослужащие, находящиеся в пункте временной дислокации</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="CheckCircle" className="text-green-600 mt-1" size={18} />
              <div>
                <div className="font-medium">В строю</div>
                <div className="text-sm text-gray-600">Годны к несению службы</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Hospital" className="text-red-600 mt-1" size={18} />
              <div>
                <div className="font-medium">Госпитализация</div>
                <div className="text-sm text-gray-600">Находятся в военном госпитале</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="Plane" className="text-orange-600 mt-1" size={18} />
              <div>
                <div className="font-medium">В отпуске</div>
                <div className="text-sm text-gray-600">Находятся в отпуске</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MilitaryDashboard;
