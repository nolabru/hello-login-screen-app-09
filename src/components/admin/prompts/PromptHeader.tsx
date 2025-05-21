
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface PromptHeaderProps {
  onCreateNew: () => void;
}

const PromptHeader: React.FC<PromptHeaderProps> = ({ onCreateNew }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Gerenciamento de Prompts da IA</h2>
      <Button onClick={onCreateNew} className="flex items-center gap-1">
        <Plus size={16} /> Novo Prompt
      </Button>
    </div>
  );
};

export default PromptHeader;
