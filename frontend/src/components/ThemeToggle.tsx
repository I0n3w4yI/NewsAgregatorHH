import { Sun, Moon } from 'lucide-react';

export type Theme = 'dark' | 'light';

interface ThemeToggleProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export function ThemeToggle({ currentTheme, onThemeChange }: ThemeToggleProps) {
  return (
    <button
      onClick={() => onThemeChange(currentTheme === 'dark' ? 'light' : 'dark')}
      className="flex items-center justify-center w-8 h-8 bg-[var(--bg-secondary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] border border-[var(--border-secondary)] rounded-lg transition-all duration-200 hover:bg-[var(--bg-tertiary)]"
      title={currentTheme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
    >
      {currentTheme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
