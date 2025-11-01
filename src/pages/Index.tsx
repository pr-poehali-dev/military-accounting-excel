import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/military/Dashboard';
import Registry from '@/components/military/Registry';
import Leaves from '@/components/military/Leaves';
import Hospitalizations from '@/components/military/Hospitalizations';
import Problems from '@/components/military/Problems';
import Reports from '@/components/military/Reports';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <Icon name="Shield" className="text-primary-foreground" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Система учёта военнослужащих</h1>
              <p className="text-xs text-muted-foreground">Автоматизированная система управления</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="dashboard" className="gap-2">
              <Icon name="LayoutDashboard" size={16} />
              <span className="hidden sm:inline">Панель</span>
            </TabsTrigger>
            <TabsTrigger value="registry" className="gap-2">
              <Icon name="Users" size={16} />
              <span className="hidden sm:inline">Реестр</span>
            </TabsTrigger>
            <TabsTrigger value="leaves" className="gap-2">
              <Icon name="Calendar" size={16} />
              <span className="hidden sm:inline">Отпуска</span>
            </TabsTrigger>
            <TabsTrigger value="hospitalizations" className="gap-2">
              <Icon name="Hospital" size={16} />
              <span className="hidden sm:inline">Госпитализация</span>
            </TabsTrigger>
            <TabsTrigger value="problems" className="gap-2">
              <Icon name="AlertTriangle" size={16} />
              <span className="hidden sm:inline">Проблемы</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Icon name="FileText" size={16} />
              <span className="hidden sm:inline">Отчёты</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="registry">
            <Registry />
          </TabsContent>

          <TabsContent value="leaves">
            <Leaves />
          </TabsContent>

          <TabsContent value="hospitalizations">
            <Hospitalizations />
          </TabsContent>

          <TabsContent value="problems">
            <Problems />
          </TabsContent>

          <TabsContent value="reports">
            <Reports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
