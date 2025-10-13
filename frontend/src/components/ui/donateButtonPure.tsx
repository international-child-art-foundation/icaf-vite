import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DonateButtonProps {
  className?: string;
  text?: string;
}

const DonateButtonPure: React.FC<DonateButtonProps> = ({
  className,
  text = 'Donate',
}) => {
  return (
    <div className="flex justify-center">
      <Button
        asChild
        variant="secondary"
        className={`h-14 w-full rounded-full text-base font-semibold tracking-wide ${className}`}
      >
        <Link to="/donate" className="flex items-center">
          {text}
        </Link>
      </Button>
    </div>
  );
};

export default DonateButtonPure;
