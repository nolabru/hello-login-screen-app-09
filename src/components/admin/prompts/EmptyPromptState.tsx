
import React from 'react';
import { Button } from "@/components/ui/button";

interface EmptyPromptStateProps {
  onCreate: () => void;
}

const EmptyPromptState: React.FC<EmptyPromptStateProps> = ({ onCreate }) => {
  return (
    <div className="text-center py-8 border rounded-md bg-gray-50">
      <p className="text-gray-500">Nenhum prompt encontrado.</p>
      <Button 
        variant="outline" 
        className="mt-2"
        onClick={onCreate}
      >
        Criar Primeiro Prompt
      </Button>
    </div>
  );
};

export default EmptyPromptState;
