import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import { checkLicenseAvailability } from '@/services/licenseService';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
interface BulkEmployeeUploadProps {
  companyId: number;
  onComplete: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}
interface CsvEmployee {
  nome: string;
  email: string;
  cpf: string;
  senha: string;
}
const BulkEmployeeUpload: React.FC<BulkEmployeeUploadProps> = ({
  companyId,
  onComplete,
  isSubmitting,
  setIsSubmitting
}) => {
  const {
    toast
  } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CsvEmployee[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{
    total: number;
    success: number;
    failed: number;
    inProgress: boolean;
  }>({
    total: 0,
    success: 0,
    failed: 0,
    inProgress: false
  });
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast({
          variant: 'destructive',
          title: 'Formato inválido',
          description: 'Por favor, selecione um arquivo CSV válido.'
        });
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };
  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());

        // Validate required headers
        const requiredHeaders = ['nome', 'email', 'cpf', 'senha'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
          toast({
            variant: 'destructive',
            title: 'Cabeçalhos ausentes',
            description: `O CSV deve conter os cabeçalhos: ${missingHeaders.join(', ')}`
          });
          return;
        }
        const employees: CsvEmployee[] = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines

          const values = lines[i].split(',').map(value => value.trim());
          if (values.length !== headers.length) continue; // Skip malformed lines

          const employee: any = {};
          headers.forEach((header, index) => {
            employee[header] = values[index];
          });
          employees.push(employee as CsvEmployee);
        }
        setParsedData(employees);
        setPreviewMode(true);
        setUploadStatus({
          total: employees.length,
          success: 0,
          failed: 0,
          inProgress: false
        });
      } catch (error) {
        console.error('Erro ao processar CSV:', error);
        toast({
          variant: 'destructive',
          title: 'Erro ao processar arquivo',
          description: 'Não foi possível ler o arquivo CSV. Verifique o formato.'
        });
      }
    };
    reader.readAsText(file);
  };
  const handleUpload = async () => {
    if (!parsedData.length) return;
    try {
      // Verificar licenças disponíveis
      const {
        available
      } = await checkLicenseAvailability(companyId);
      if (available < parsedData.length) {
        toast({
          variant: 'destructive',
          title: 'Licenças insuficientes',
          description: `Você tem apenas ${available} licenças disponíveis, mas está tentando adicionar ${parsedData.length} funcionários.`
        });
        return;
      }
      setIsSubmitting(true);
      setUploadStatus(prev => ({
        ...prev,
        inProgress: true
      }));
      let successCount = 0;
      let failedCount = 0;
      for (let i = 0; i < parsedData.length; i++) {
        const employee = parsedData[i];
        try {
          // Inserir novo funcionário
          const {
            error
          } = await supabase.from('user_profiles').insert({
            nome: employee.nome,
            email: employee.email,
            cpf: employee.cpf,
            senha: employee.senha,
            id_empresa: companyId,
            status: false,
            license_status: 'active' // Definir como active para consumir uma licença
          });
          if (error) throw error;
          successCount++;
        } catch (err) {
          console.error('Erro ao adicionar funcionário:', err);
          failedCount++;
        }

        // Atualizar progresso
        const newProgress = Math.round((i + 1) / parsedData.length * 100);
        setProgress(newProgress);
        setUploadStatus({
          total: parsedData.length,
          success: successCount,
          failed: failedCount,
          inProgress: true
        });

        // Pequena pausa para não sobrecarregar o banco de dados
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      setUploadStatus({
        total: parsedData.length,
        success: successCount,
        failed: failedCount,
        inProgress: false
      });
      if (successCount > 0) {
        toast({
          title: "Funcionários adicionados",
          description: `${successCount} funcionários foram adicionados com sucesso. ${failedCount > 0 ? `${failedCount} falhas.` : ''}`
        });
        onComplete();
      } else {
        toast({
          variant: 'destructive',
          title: "Falha ao adicionar funcionários",
          description: "Não foi possível adicionar os funcionários. Verifique os dados e tente novamente."
        });
      }
    } catch (error) {
      console.error('Erro ao processar upload:', error);
      toast({
        variant: 'destructive',
        title: "Erro",
        description: "Ocorreu um erro ao processar o upload."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    setFile(null);
    setParsedData([]);
    setPreviewMode(false);
    setProgress(0);
    setUploadStatus({
      total: 0,
      success: 0,
      failed: 0,
      inProgress: false
    });
  };
  if (previewMode) {
    return <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">Prévia dos dados ({parsedData.length} funcionários)</h3>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="max-h-64 overflow-y-auto border rounded-md">
          <Table>
            <TableHeader className="bg-gray-50 sticky top-0">
              <TableRow>
                <TableHead className="font-medium text-xs text-gray-500 uppercase">Nome</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase">Email</TableHead>
                <TableHead className="font-medium text-xs text-gray-500 uppercase">CPF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedData.map((employee, index) => <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <TableCell className="text-sm">{employee.nome}</TableCell>
                  <TableCell className="text-sm">{employee.email}</TableCell>
                  <TableCell className="text-sm">{employee.cpf}</TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </div>
        
        {uploadStatus.inProgress ? <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso: {progress}%</span>
              <span>
                {uploadStatus.success} sucesso / {uploadStatus.failed} falhas
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div> : uploadStatus.success > 0 || uploadStatus.failed > 0 ? <div className="p-4 border rounded-md bg-gray-50">
            <div className="flex items-center gap-2">
              {uploadStatus.success > 0 && <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{uploadStatus.success} adicionados com sucesso</span>
                </div>}
              {uploadStatus.failed > 0 && <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadStatus.failed} falhas</span>
                </div>}
            </div>
          </div> : <Button onClick={handleUpload} className="w-full bg-indigo-900 hover:bg-indigo-800" disabled={isSubmitting}>
            Importar {parsedData.length} funcionários
          </Button>}
      </div>;
  }
  return <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center">
        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="mb-2 text-sm text-gray-600">
          Clique para selecionar um arquivo CSV ou arraste e solte-o aqui
        </p>
        <p className="text-xs text-gray-500 mb-4">O arquivo deve conter as colunas: Nome, Email e CPF</p>
        <Input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-upload" />
        <label htmlFor="csv-upload">
          <Button variant="outline" className="cursor-pointer" asChild>
            <span>Selecionar arquivo CSV</span>
          </Button>
        </label>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="font-medium mb-2">Formato do CSV</h4>
        <p className="text-sm text-gray-600 mb-2">
          O arquivo CSV deve ter os seguintes cabeçalhos:
        </p>
        
        <div className="overflow-hidden rounded-md border mb-3">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="text-xs font-medium text-gray-600">nome</TableHead>
                <TableHead className="text-xs font-medium text-gray-600">email</TableHead>
                <TableHead className="text-xs font-medium text-gray-600">cpf</TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-white">
                <TableCell className="text-xs py-2">João Silva</TableCell>
                <TableCell className="text-xs py-2">joao@email.com</TableCell>
                <TableCell className="text-xs py-2">12345678901</TableCell>
                
              </TableRow>
              <TableRow className="bg-gray-50">
                <TableCell className="text-xs py-2">Maria Oliveira</TableCell>
                <TableCell className="text-xs py-2">maria@email.com</TableCell>
                <TableCell className="text-xs py-2">98765432109</TableCell>
                
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Formato da linha CSV: <span className="font-mono bg-gray-100 px-1 rounded">João Silva, joao@email.com 12345678901</span>
        </p>
      </div>
    </div>;
};
export default BulkEmployeeUpload;