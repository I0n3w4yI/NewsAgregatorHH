import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[var(--border-tertiary)] transition-all disabled:hover:border-[var(--border-primary)]"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-[var(--text-primary)] font-medium">
        {currentPage}/{totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed hover:border-[var(--border-tertiary)] transition-all disabled:hover:border-[var(--border-primary)]"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

