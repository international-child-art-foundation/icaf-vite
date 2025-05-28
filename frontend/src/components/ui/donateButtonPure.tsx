import { Button } from '@/components/ui/button';

interface DonateButtonProps {
  className?: string;
}

const DonateButtonPure: React.FC<DonateButtonProps> = ({ className }) => {
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

          Donate
        </a>
      </Button>
    </div>
  );
};

export default DonateButtonPure;
