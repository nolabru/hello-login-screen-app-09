
import React from 'react';
import { AIPrompt } from "@/types/ai-prompt";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash2 } from 'lucide-react';

interface PromptTableProps {
  prompts: AIPrompt[];
  isActivating: boolean;
  onEdit: (prompt: AIPrompt) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
}

const PromptTable: React.FC<PromptTableProps> = ({
  prompts,
  isActivating,
  onEdit,
  onDelete,
  onActivate
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Conteúdo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prompts.map(prompt => (
          <TableRow key={prompt.id}>
            <TableCell className="font-medium">{prompt.title}</TableCell>
            <TableCell className="max-w-md truncate">{prompt.content}</TableCell>
            <TableCell>
              {prompt.is_active ? (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Ativo
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Inativo
                </span>
              )}
            </TableCell>
            <TableCell>
              {new Date(prompt.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell className="text-right space-x-2">
              {!prompt.is_active && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onActivate(prompt.id)}
                  disabled={isActivating}
                  title="Definir como ativo"
                >
                  <Check size={16} />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(prompt)}
                title="Editar prompt"
              >
                <Edit size={16} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(prompt.id)}
                title="Excluir prompt"
              >
                <Trash2 size={16} />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PromptTable;
