import { Button } from '../ui/button';

interface TagProps {
  label: string;
  filterType: string;
  onRemove: () => void;
}

export const Tag = ({ label, onRemove }: TagProps) => (
  <Button
    type="button"
    variant={'secondary'}
    onClick={onRemove}
    className="my-auto flex items-center gap-1 rounded-full border border-gray-600 bg-white px-5 py-1 text-sm hover:bg-gray-100"
  >
    <p className="text-md flex items-center">
      {label} <span className="ml-2 text-base leading-none">&times;</span>
    </p>
  </Button>
);
