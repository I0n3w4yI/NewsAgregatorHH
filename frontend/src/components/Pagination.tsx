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
        className="flex items-center justify-center w-10 h-10 bg-[#101010] border border-white rounded-lg text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-all disabled:hover:border-white"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-gray-300 font-medium">
        {currentPage}/{totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 bg-[#101010] border border-white rounded-lg text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400 transition-all disabled:hover:border-white"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

