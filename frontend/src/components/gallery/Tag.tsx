interface TagProps {
  label: string;
  filterType: string;
  onRemove: () => void;
}

export const Tag = ({ label, onRemove }: TagProps) => (
  <button
    onClick={onRemove}
    className="flex h-[34px] items-center gap-1 rounded-full border border-gray-600 bg-white px-3 py-1 text-sm hover:bg-gray-100"
  >
    {label}
    <span className="ml-1 text-base leading-none">&times;</span>
  </button>
);
