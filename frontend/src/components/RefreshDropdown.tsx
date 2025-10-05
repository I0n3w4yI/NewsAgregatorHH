import { ChevronDown, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface RefreshDropdownProps {
  value: 10 | 30 | 60 | null;
  onChange: (value: 10 | 30 | 60 | null) => void;
  timeUntilRefresh?: number | null;
  isRefreshing?: boolean;
  onManualRefresh?: () => void;
}

const refreshOptions = [
  { value: 10, label: '10 с.' },
  { value: 30, label: '30 с.' },
  { value: 60, label: '60 с.' },
  { value: null, label: 'Выкл' }
];

export function RefreshDropdown({ value, onChange, timeUntilRefresh, isRefreshing, onManualRefresh }: RefreshDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = refreshOptions.find(option => option.value === value);

  const handleSelect = (newValue: 10 | 30 | 60 | null) => {
    onChange(newValue);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (isRefreshing && timeUntilRefresh !== null) {
      return `${timeUntilRefresh} с.`;
    }
    return selectedOption?.label || 'Выкл';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Кнопка ручного обновления */}
      {onManualRefresh && (
        <button
          onClick={onManualRefresh}
          className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Обновить</span>
        </button>
      )}

      {/* Выпадающий список автообновления */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] text-gray-300 hover:text-white border border-gray-700 rounded-lg text-sm font-medium transition-colors"
        >
          <span>{getDisplayText()}</span>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 mt-1 w-full bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg z-20 overflow-hidden">
            {refreshOptions.map((option) => (
              <button
                key={option.value || 'off'}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  value === option.value
                    ? 'bg-gray-200 text-[#101010] font-medium'
                    : 'text-gray-300 hover:text-white hover:bg-[#222]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
