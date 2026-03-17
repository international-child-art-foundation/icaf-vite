interface PaginationProps {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  updatePageNumber: (current: number, next: number) => void;
}

const Pagination = ({
  totalItems,
  currentPage,
  itemsPerPage,
  updatePageNumber,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="mb-4 mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => updatePageNumber(currentPage, currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded border border-gray-600 px-3 py-2 disabled:opacity-40 hover:bg-gray-100"
      >
        &lsaquo;
      </button>
      {getPageNumbers().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => updatePageNumber(currentPage, page)}
            className={`rounded border px-3 py-2 ${
              page === currentPage
                ? 'border-primary bg-primary text-text-inverse'
                : 'border-gray-600 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => updatePageNumber(currentPage, currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded border border-gray-600 px-3 py-2 disabled:opacity-40 hover:bg-gray-100"
      >
        &rsaquo;
      </button>
    </div>
  );
};

export default Pagination;
