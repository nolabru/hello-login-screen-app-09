
import React from 'react';
import { Button } from '@/components/ui/button';

type ViewMode = 'cards' | 'table';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ 
  viewMode, 
  onViewModeChange 
}) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={viewMode === 'cards' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('cards')}
      >
        Cards
      </Button>
      <Button 
        variant={viewMode === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('table')}
      >
        Tabela
      </Button>
    </div>
  );
};

export default ViewModeToggle;
