import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Shield" className="text-white" size={40} />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Система учёта военнослужащих ПВД
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Полный контроль и учёт военнослужащих, движений и медицинских осмотров
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/military">
            <Button size="lg" className="flex items-center gap-2">
              <Icon name="BarChart3" size={20} />
              Перейти к статистике
            </Button>
          </a>
          <a href="/military/registry">
            <Button size="lg" variant="outline" className="flex items-center gap-2">
              <Icon name="List" size={20} />
              Открыть реестр
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
