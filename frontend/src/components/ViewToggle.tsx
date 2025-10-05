import { List, Grid3X3 } from 'lucide-react';

export type ViewMode = 'list' | 'cards';

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-lg p-1">
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200 ${
          currentView === 'list'
            ? 'bg-white text-black'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        }`}
        title="Список"
      >
        <List className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">Список</span>
      </button>
      
      <button
        onClick={() => onViewChange('cards')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-all duration-200 ${
          currentView === 'cards'
            ? 'bg-white text-black'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
        }`}
        title="Карточки"
      >
        <Grid3X3 className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">Карточки</span>
      </button>
    </div>
  );
}
