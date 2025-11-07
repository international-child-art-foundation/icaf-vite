import { ICAFlogo } from '@/assets/shared/logos/ICAFLogo';
import { Menu, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { useState, useEffect } from 'react';
import MobileNavMenu from './MobileNavMenu';
import { Link, useLocation } from 'react-router-dom';

const MobileNav: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <Link to={'/'} className="my-2 cursor-pointer">
        <ICAFlogo />
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="!p-0"
        onClick={() => setOpen((open) => !open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X className="!h-6 !w-6" /> : <Menu className="!h-6 !w-6" />}
      </Button>

      {open && (
        <nav className="bg-primary fixed inset-x-0 top-[98px] p-6">
          <MobileNavMenu onCloseMenu={() => setOpen(false)} />{' '}
        </nav>
      )}
    </>
  );
};

export default MobileNav;
