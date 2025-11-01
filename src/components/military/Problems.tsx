import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Problem {
  id: number;
  personnel_id: number;
  full_name: string;
  unit: string;
  rank: string;
  issue_type: string;
  description: string;
  severity: string;
  resolved: boolean;
  created_at: string;
}

const Problems = () => {
  const queryClient = useQueryClient();

  const { data: problems, isLoading } = useQuery<Problem[]>({
    queryKey: ['problems'],
    queryFn: async () => {
      const response = await fetch('/api/military/problems');
      if (!response.ok) throw new Error('Failed to fetch problems');
      return response.json();
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/military/problems/${id}/resolve`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to resolve');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Проблема отмечена как решённая');
    },
  });

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-800 border-red-300';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-blue-100 text-blue-800 border-blue-300';
  };

  const getSeverityLabel = (severity: string) => {
    if (severity === 'high') return 'Высокий';
    if (severity === 'medium') return 'Средний';
    return 'Низкий';
  };

  const getIssueIcon = (issueType: string) => {
    if (issueType.includes('ПВД')) return 'Clock';
    if (issueType.includes('отпуск')) return 'CalendarX';
    if (issueType.includes('госпитализация')) return 'Hospital';
    if (issueType.includes('документы')) return 'FileX';
    if (issueType.includes('активность')) return 'AlertCircle';
    return 'AlertTriangle';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Проблемные вопросы</h2>
        <p className="text-muted-foreground">
          Автоматически формируемый список требующих внимания ситуаций
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Текущие проблемы</CardTitle>
          <CardDescription>
            Всего проблем: {problems?.length || 0}
            {problems && problems.filter(p => p.severity === 'high').length > 0 && (
              <span className="ml-2 text-red-600 font-semibold">
                | Критичных: {problems.filter(p => p.severity === 'high').length}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
          ) : !problems || problems.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="CheckCircle" className="mx-auto mb-4 text-green-500" size={48} />
              <p className="text-lg font-semibold mb-2">Проблем не обнаружено</p>
              <p className="text-muted-foreground">Все показатели в норме</p>
            </div>
          ) : (
            <div className="space-y-4">
              {problems.map((problem) => (
                <div
                  key={problem.id}
                  className={`p-4 border rounded-lg ${
                    problem.severity === 'high'
                      ? 'bg-red-50 border-red-200'
                      : problem.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-2 rounded ${
                          problem.severity === 'high'
                            ? 'bg-red-100'
                            : problem.severity === 'medium'
                            ? 'bg-yellow-100'
                            : 'bg-blue-100'
                        }`}
                      >
                        <Icon
                          name={getIssueIcon(problem.issue_type)}
                          className={
                            problem.severity === 'high'
                              ? 'text-red-600'
                              : problem.severity === 'medium'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                          }
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{problem.issue_type}</h3>
                          <Badge variant="outline" className={getSeverityColor(problem.severity)}>
                            {getSeverityLabel(problem.severity)}
                          </Badge>
                        </div>
                        <div className="text-sm mb-2">
                          <span className="font-medium">{problem.rank} {problem.full_name}</span>
                          <span className="text-muted-foreground"> · {problem.unit}</span>
                        </div>
                        <p className="text-sm">{problem.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Создано: {new Date(problem.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => resolveMutation.mutate(problem.id)}
                      className="gap-2"
                    >
                      <Icon name="Check" size={16} />
                      Решено
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Problems;
