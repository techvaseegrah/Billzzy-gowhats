// components/ui/Switch.tsx
import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`} />
        <div
          className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 ease-in-out ${
            checked ? 'transform translate-x-6' : ''
          }`}
        />
      </div>
      {label && <span className="ml-3 text-sm">{label}</span>}
    </label>
  );
}