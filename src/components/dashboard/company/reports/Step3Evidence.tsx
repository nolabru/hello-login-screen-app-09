import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload,
  FileText,
  Image,
  X,
  FileCheck,
  Camera,
  BarChart,
  MessageSquare,
  Paperclip,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Step3EvidenceProps {
  reportData: any;
  updateReportData: (data: any) => void;
}

const Step3Evidence: React.FC<Step3EvidenceProps> = ({
  reportData,
  updateReportData
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    const currentFiles = reportData.evidenceFiles || [];
    updateReportData({ 
      evidenceFiles: [...currentFiles, ...newFiles] 
    });
  };

  const removeFile = (index: number) => {
    const newFiles = [...reportData.evidenceFiles];
    newFiles.splice(index, 1);
    updateReportData({ evidenceFiles: newFiles });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const automaticEvidenceOptions = [
    {
      id: 'screenshots',
      label: 'Screenshots do App',
      description: 'Capturas de tela das métricas e uso do app Calma',
      icon: Camera,
      checked: reportData.includeScreenshots
    },
    {
      id: 'charts',
      label: 'Gráficos de Engajamento',
      description: 'Visualizações de dados e tendências de participação',
      icon: BarChart,
      checked: reportData.includeCharts
    },
    {
      id: 'testimonials',
      label: 'Depoimentos Anônimos',
      description: 'Feedback qualitativo dos colaboradores',
      icon: MessageSquare,
      checked: reportData.includeTestimonials
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upload de Documentos */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">
            Anexar Documentos Adicionais
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            Adicione certificados, listas de presença, fotos de eventos ou outros documentos relevantes
          </p>
        </div>

        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
          />
          
          <label
            htmlFor="file-upload"
            className="cursor-pointer"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Upload className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF, Word, Excel, Imagens (máx. 10MB cada)
                </p>
              </div>
              <Button variant="outline" size="sm" type="button">
                <Paperclip className="h-4 w-4 mr-2" />
                Selecionar Arquivos
              </Button>
            </div>
          </label>
        </div>
      </div>

      {/* Arquivos Anexados */}
      {reportData.evidenceFiles && reportData.evidenceFiles.length > 0 && (
        <div className="space-y-3">
          <Label className="text-base font-semibold">
            Documentos Anexados ({reportData.evidenceFiles.length})
          </Label>
          <div className="space-y-2">
            {reportData.evidenceFiles.map((file: File, index: number) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      {getFileIcon(file.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Evidências Automáticas */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">
            Evidências Automáticas
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            Selecione as evidências que serão geradas automaticamente do sistema
          </p>
        </div>

        <div className="space-y-3">
          {automaticEvidenceOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Card 
                key={option.id}
                className={`p-4 cursor-pointer transition-all ${
                  option.checked ? 'bg-blue-50 border-blue-300' : 'hover:shadow-sm'
                }`}
                onClick={() => {
                  const key = `include${option.id.charAt(0).toUpperCase() + option.id.slice(1)}`;
                  updateReportData({ [key]: !option.checked });
                }}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={option.checked}
                    onCheckedChange={(checked) => {
                      const key = `include${option.id.charAt(0).toUpperCase() + option.id.slice(1)}`;
                      updateReportData({ [key]: checked });
                    }}
                  />
                  <div className={`p-2 rounded-lg ${
                    option.checked ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${
                      option.checked ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Resumo de Evidências */}
      <Card className="bg-green-50 border-green-200">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <FileCheck className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">
                Resumo de Evidências
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    {reportData.evidenceFiles?.length || 0} documentos anexados
                  </span>
                </div>
                {reportData.includeScreenshots && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Screenshots do app serão incluídos
                    </span>
                  </div>
                )}
                {reportData.includeCharts && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Gráficos de engajamento serão gerados
                    </span>
                  </div>
                )}
                {reportData.includeTestimonials && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Depoimentos anônimos serão incluídos
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Nota sobre evidências */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Importante sobre evidências</p>
            <p>
              As evidências são fundamentais para comprovar o cumprimento dos requisitos de compliance. 
              Quanto mais documentação você fornecer, mais completo e convincente será o relatório final.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3Evidence;
