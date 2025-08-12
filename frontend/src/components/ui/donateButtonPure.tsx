import { Button } from '@/components/ui/button';

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
        <a
          href="https://icaf.org/donate"
          target="blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          {text}
        </a>
      </Button>
    </div>
  );
};

export default DonateButtonPure;
