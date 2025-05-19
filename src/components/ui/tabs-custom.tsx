
import React from 'react';
import { cn } from '@/lib/utils';

type TabOption = {
  id: string;
  label: string;
};

interface TabsProps {
  options: TabOption[];
  selectedTab: string;
  onTabChange: (tabId: string) => void;
}

const TabsCustom: React.FC<TabsProps> = ({
  options,
  selectedTab,
  onTabChange,
}) => {
  return (
    <div className="flex w-full bg-white rounded-lg p-1 mb-6">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onTabChange(option.id)}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-center transition-all duration-200",
            selectedTab === option.id
              ? "bg-portal-purple text-white font-medium"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default TabsCustom;
