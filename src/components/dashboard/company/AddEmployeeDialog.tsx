
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AddSingleEmployeeFormValues, LinkEmployeeFormValues } from './schemas/employeeSchema';
import { addSingleEmployee, linkEmployee, processBatchUpload } from './utils/employeeUtils';
import AddSingleEmployeeForm from './AddSingleEmployeeForm';
import LinkEmployeeForm from './LinkEmployeeForm';
import BatchUploadForm from './BatchUploadForm';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeAdded: () => void;
  companyId: number;
}

const AddEmployeeDialog: React.FC<AddEmployeeDialogProps> = ({ 
  open, 
  onOpenChange, 
  onEmployeeAdded,
  companyId
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('add');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddSingleEmployee = async (values: AddSingleEmployeeFormValues) => {
    setIsLoading(true);
    try {
      const success = await addSingleEmployee(values, companyId);
      if (success) {
        onEmployeeAdded();
        onOpenChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkEmployee = async (values: LinkEmployeeFormValues) => {
    setIsLoading(true);
    try {
      const success = await linkEmployee(values, companyId);
      if (success) {
        onEmployeeAdded();
        onOpenChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const success = await processBatchUpload(file, companyId);
      if (success) {
        onEmployeeAdded();
        onOpenChange(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Funcionário</DialogTitle>
          <DialogDescription>
            Adicione funcionários individualmente ou em lote à sua empresa.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Adicionar Novo</TabsTrigger>
            <TabsTrigger value="link">Vincular Existente</TabsTrigger>
          </TabsList>

          <TabsContent value="add" className="mt-4 space-y-4">
            <Tabs defaultValue="single">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Individual</TabsTrigger>
                <TabsTrigger value="batch">Em Lote</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="mt-4 space-y-4">
                <AddSingleEmployeeForm 
                  onSubmit={handleAddSingleEmployee} 
                  isLoading={isLoading} 
                />
              </TabsContent>

              <TabsContent value="batch" className="mt-4 space-y-4">
                <BatchUploadForm 
                  onUpload={handleBatchUpload}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="space-y-4">
              <LinkEmployeeForm 
                onSubmit={handleLinkEmployee}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeDialog;
