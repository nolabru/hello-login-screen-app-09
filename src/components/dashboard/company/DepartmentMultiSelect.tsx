import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { 
  ChevronDown, 
  Search, 
  Building2, 
  Users, 
  X,
  Check
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  status: string;
}

interface DepartmentSelection {
  isAllDepartments: boolean;
  selectedDepartments: Department[];
}

interface DepartmentMultiSelectProps {
  companyId: string;
  value: DepartmentSelection;
  onChange: (selection: DepartmentSelection) => void;
  placeholder?: string;
  disabled?: boolean;
}

const DepartmentMultiSelect: React.FC<DepartmentMultiSelectProps> = ({
  companyId,
  value,
  onChange,
  placeholder = "Selecionar departamentos...",
  disabled = false
}) => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Buscar departamentos da empresa
  useEffect(() => {
    if (companyId) {
      fetchDepartments();
    }
  }, [companyId]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('company_departments')
        .select('id, name, status')
        .eq('company_id', companyId)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      setDepartments(data || []);
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar departamentos',
        description: 'Não foi possível carregar a lista de departamentos.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar departamentos por termo de busca
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle da seleção "Todos os Departamentos"
  const handleAllDepartmentsChange = (checked: boolean) => {
    if (checked) {
      onChange({
        isAllDepartments: true,
        selectedDepartments: []
      });
    } else {
      onChange({
        isAllDepartments: false,
        selectedDepartments: []
      });
    }
  };

  // Handle da seleção de departamento específico
  const handleDepartmentChange = (department: Department, checked: boolean) => {
    let newSelectedDepartments = [...value.selectedDepartments];
    
    if (checked) {
      // Adicionar departamento se não existir
      if (!newSelectedDepartments.find(d => d.id === department.id)) {
        newSelectedDepartments.push(department);
      }
    } else {
      // Remover departamento
      newSelectedDepartments = newSelectedDepartments.filter(d => d.id !== department.id);
    }

    onChange({
      isAllDepartments: false,
      selectedDepartments: newSelectedDepartments
    });
  };

  // Remover departamento específico (usado nos badges)
  const removeDepartment = (departmentId: string) => {
    const newSelectedDepartments = value.selectedDepartments.filter(d => d.id !== departmentId);
    onChange({
      ...value,
      selectedDepartments: newSelectedDepartments
    });
  };

  // Verificar se departamento está selecionado
  const isDepartmentSelected = (departmentId: string) => {
    return value.selectedDepartments.some(d => d.id === departmentId);
  };

  // Gerar texto do placeholder baseado na seleção
  const getDisplayText = () => {
    if (value.isAllDepartments) {
      return "Todos os Setores";
    } else if (value.selectedDepartments.length === 0) {
      return placeholder;
    } else if (value.selectedDepartments.length === 1) {
      return value.selectedDepartments[0].name;
    } else {
      return `${value.selectedDepartments.length} departamentos selecionados`;
    }
  };

  // Validar se há pelo menos uma seleção
  const hasSelection = value.isAllDepartments || value.selectedDepartments.length > 0;

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
            disabled={disabled}
          >
            <span className={hasSelection ? "text-foreground" : "text-muted-foreground"}>
              {getDisplayText()}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3">
            {/* Campo de busca */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar departamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <ScrollArea className="h-64">
              {/* Opção "Todos os Departamentos" */}
              <div className="mb-2">
                <div className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                  <Checkbox
                    id="all-departments"
                    checked={value.isAllDepartments}
                    onCheckedChange={handleAllDepartmentsChange}
                  />
                  <Label 
                    htmlFor="all-departments"
                    className="flex items-center gap-2 font-medium text-primary cursor-pointer"
                  >
                    <Building2 className="h-4 w-4" />
                    Todos os Setores
                  </Label>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Lista de departamentos */}
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Carregando departamentos...
                </div>
              ) : filteredDepartments.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? 'Nenhum departamento encontrado' : 'Nenhum departamento cadastrado'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredDepartments.map((department) => (
                    <div 
                      key={department.id}
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md"
                    >
                      <Checkbox
                        id={`dept-${department.id}`}
                        checked={isDepartmentSelected(department.id)}
                        onCheckedChange={(checked) => handleDepartmentChange(department, !!checked)}
                        disabled={value.isAllDepartments}
                      />
                      <Label 
                        htmlFor={`dept-${department.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Users className="h-4 w-4" />
                        {department.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer com contador */}
            <div className="mt-3 pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                {value.isAllDepartments ? 
                  'Todos os departamentos selecionados' : 
                  `${value.selectedDepartments.length} de ${departments.length} departamentos selecionados`
                }
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Badges dos departamentos selecionados */}
      {!value.isAllDepartments && value.selectedDepartments.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.selectedDepartments.map((department) => (
            <Badge key={department.id} variant="secondary" className="text-xs">
              {department.name}
              <button
                type="button"
                onClick={() => removeDepartment(department.id)}
                className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-sm"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Badge para "Todos os Departamentos" */}
      {value.isAllDepartments && (
        <div className="flex flex-wrap gap-1">
          <Badge variant="default" className="text-xs bg-primary">
            <Building2 className="h-3 w-3 mr-1" />
            Todos os Setores
            {!disabled && (
              <button
                type="button"
                onClick={() => handleAllDepartmentsChange(false)}
                className="ml-1 hover:bg-primary-foreground hover:text-primary rounded-sm"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        </div>
      )}

      {/* Aviso se nenhuma seleção */}
      {!hasSelection && (
        <p className="text-xs text-muted-foreground">
          Selecione pelo menos um departamento ou "Todos os Setores"
        </p>
      )}
    </div>
  );
};

export default DepartmentMultiSelect;
