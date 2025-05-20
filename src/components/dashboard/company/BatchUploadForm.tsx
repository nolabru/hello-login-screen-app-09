
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';

interface BatchUploadFormProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
}

const BatchUploadForm: React.FC<BatchUploadFormProps> = ({ onUpload, isLoading }) => {
  const [batchFile, setBatchFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBatchFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-md p-4 bg-gray-50">
        <h4 className="font-medium mb-2">Formato do arquivo CSV</h4>
        <p className="text-sm text-gray-500 mb-2">
          O arquivo deve ter as seguintes colunas:
        </p>
        <code className="text-xs block bg-gray-100 p-2 rounded">
          nome,email,cpf,senha
        </code>
        <div className="mt-3 p-2 bg-gray-100 rounded border border-gray-200">
          <h5 className="text-xs font-medium text-gray-700 mb-1">Exemplo de planilha:</h5>
          <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 p-1">A</th>
                  <th className="border border-gray-300 p-1">B</th>
                  <th className="border border-gray-300 p-1">C</th>
                  <th className="border border-gray-300 p-1">D</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-blue-50">
                  <td className="border border-gray-300 p-1 font-medium">nome</td>
                  <td className="border border-gray-300 p-1 font-medium">email</td>
                  <td className="border border-gray-300 p-1 font-medium">cpf</td>
                  <td className="border border-gray-300 p-1 font-medium">senha</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-1">João Silva</td>
                  <td className="border border-gray-300 p-1">joao@gmail.com</td>
                  <td className="border border-gray-300 p-1">12345678900</td>
                  <td className="border border-gray-300 p-1">senha123</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-1">Maria Oliveira</td>
                  <td className="border border-gray-300 p-1">maria@gmail.com</td>
                  <td className="border border-gray-300 p-1">98765432100</td>
                  <td className="border border-gray-300 p-1">senha456</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Salve sua planilha como um arquivo CSV (valores separados por vírgula) antes de fazer o upload.
          </p>
        </div>
      </div>
                
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file">Arquivo CSV</Label>
        <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
      </div>
              
      <Button 
        onClick={() => batchFile && onUpload(batchFile)} 
        className="w-full"
        disabled={!batchFile || isLoading}
      >
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? 'Processando...' : 'Importar Funcionários'}
      </Button>
    </div>
  );
};

export default BatchUploadForm;
