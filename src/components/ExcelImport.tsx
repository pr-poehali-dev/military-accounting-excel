import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

const IMPORT_URL = 'https://functions.poehali.dev/fd0fcc18-9605-4892-9bd4-d7f3eb69010c';

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  total_rows: number;
}

export default function ExcelImport() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast({
          title: 'Ошибка',
          description: 'Пожалуйста, выберите файл Excel (.xlsx или .xls)',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];

        const response = await fetch(IMPORT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64Data,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setResult(data);
          toast({
            title: 'Импорт завершен',
            description: `Успешно импортировано ${data.imported} из ${data.total_rows} записей`,
          });
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          toast({
            title: 'Ошибка импорта',
            description: data.error || 'Произошла ошибка при импорте',
            variant: 'destructive',
          });
        }
        
        setLoading(false);
      };

      reader.onerror = () => {
        toast({
          title: 'Ошибка чтения файла',
          description: 'Не удалось прочитать файл',
          variant: 'destructive',
        });
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Произошла ошибка',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="FileSpreadsheet" size={24} />
          Импорт из Excel
        </CardTitle>
        <CardDescription>
          Загрузите файл Excel с данными о военнослужащих. Система автоматически распознает колонки и создаст карточки.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Icon name="Info" size={16} />
          <AlertDescription>
            <strong>Поддерживаемые колонки:</strong> ФИО, Звание, Дата рождения, Военный билет, Статус, Категория годности, Дата категории, ВМО, Диагноз, Комментарий, Дата прибытия
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                <Icon name="Upload" size={16} />
                Выбрать файл
              </div>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="File" size={16} />
                {file.name}
              </div>
            )}
          </div>

          {file && (
            <Button 
              onClick={handleImport} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Импортирую данные...
                </>
              ) : (
                <>
                  <Icon name="Database" size={16} className="mr-2" />
                  Импортировать
                </>
              )}
            </Button>
          )}

          {result && (
            <Alert className={result.errors.length > 0 ? 'border-yellow-500' : 'border-green-500'}>
              <Icon name="CheckCircle" size={16} />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>Результат импорта:</strong></p>
                  <p>Обработано строк: {result.total_rows}</p>
                  <p>Успешно импортировано: {result.imported}</p>
                  {result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-yellow-600">Ошибки:</p>
                      <ul className="list-disc list-inside text-sm">
                        {result.errors.slice(0, 5).map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                        {result.errors.length > 5 && (
                          <li>... и еще {result.errors.length - 5} ошибок</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
          <p className="font-semibold mb-2">Формат файла Excel:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Первая строка должна содержать заголовки колонок</li>
            <li>Обязательное поле: ФИО</li>
            <li>Даты в формате ДД.ММ.ГГГГ</li>
            <li>Статусы: находится, госпитализация, отпуск, командировка, ВКК, ВВК, ЦВВК, ПВД, увольнение</li>
            <li>Категории годности: А, Б, В, Г, Д</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
