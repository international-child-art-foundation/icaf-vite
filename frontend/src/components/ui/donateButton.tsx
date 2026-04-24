import { HeartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DonateButtonProps {
  className?: string;
  text?: string;
  icon?: boolean;
  iconSide?: 'left' | 'right';
  onClick?: (e: React.MouseEvent) => void;
}

const DonateButton: React.FC<DonateButtonProps> = ({
  className,
  text = 'Donate',
  icon = true,
  onClick,
  iconSide = 'left',
}) => {
  return (
    <div className="flex justify-center">
      <Button
        asChild
        variant="secondary"
        onClick={onClick}
        className={`group h-14 w-full rounded-full text-base font-semibold tracking-wide ${className}`}
      >
        <Link to="/donate" className="flex items-center gap-2">
          {icon && iconSide === 'left' && (
            <HeartIcon
              strokeWidth={2}
              className="group-hover:animate-heart-pulse !h-6 !w-6 stroke-black transition-transform duration-150 group-hover:scale-110 group-hover:fill-red-400 lg:mr-0 lg:!h-6 lg:!w-6"
            />
          )}
          <span>{text}</span>
          {icon && iconSide === 'right' && (
            <HeartIcon
              strokeWidth={2}
              className="group-hover:animate-heart-pulse !h-6 !w-6 stroke-black transition-transform duration-150 group-hover:scale-110 group-hover:fill-red-400 lg:mr-0 lg:!h-6 lg:!w-6"
            />
          )}
        </Link>
      </Button>
    </div>
  );
};

export default DonateButton;
