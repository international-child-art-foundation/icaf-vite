import { HeartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DonateButtonProps {
  className?: string;
  title?: string;
}

const DonateButton: React.FC<DonateButtonProps> = ({ className, title }) => {
  return (
    <div className="flex justify-center">
      <Button
        asChild
        variant="secondary"
        className={`h-14 w-full rounded-full text-base font-semibold tracking-wide ${className}`}
      >
        <a
          href="https://icaf.org/donate"
          target="blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <HeartIcon
            strokeWidth={2}
            className="!h-6 !w-6 stroke-black lg:mr-0 lg:!h-6 lg:!w-6"
          />
          {title}
        </a>
      </Button>
    </div>
  );
};

export default DonateButton;
