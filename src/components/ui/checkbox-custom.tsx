
import React from 'react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

const CheckboxCustom: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
}) => {
  return (
    <div className="flex items-center">
      <label htmlFor={id} className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            id={id}
            className="sr-only"
            checked={checked}
            onChange={onChange}
          />
          <div
            className={cn(
              "w-5 h-5 border rounded transition-colors",
              checked ? "bg-portal-purple border-portal-purple" : "border-gray-300"
            )}
          >
            {checked && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        <span className="ml-2 text-sm text-gray-700">{label}</span>
      </label>
    </div>
  );
};

export default CheckboxCustom;
