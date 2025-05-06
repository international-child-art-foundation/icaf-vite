import { ICAFlogo } from '@/assets/shared/logos/ICAFLogo';
import { NavItem, navItems } from '@/lib/navItems';
import DesktopNavDropdown from './DesktopNavDropdown';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DonateButton from '@/components/ui/donateButton';

const DesktopNav: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('');
  const [prevItem, setPrevItem] = useState<string>('');
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const openTimer = useRef<number | undefined>(undefined);

  const handleMouseEnterNavItems = (label: string) => {
    window.clearTimeout(openTimer.current);

    //Setting delay in dropdown as user hovers nav items
    openTimer.current = window.setTimeout(() => {
      if (label !== activeItem) {
        setActiveItem(label);
        setPrevItem(activeItem);

        //Specific sequence allowing the dropdown to exit when hovering sponsorhsip
        if (label === 'SPONSORSHIP') {
          setIsLeaving(true);
          setActiveItem('');

          setTimeout(() => {
            setPrevItem('');
          }, 250);
        } else {
          setIsLeaving(false);
        }
      }
    }, 350);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => window.clearTimeout(openTimer.current);
  }, []);

  const handleClick = (href: string) => {
    setIsLeaving(true);
    setActiveItem('');
    setPrevItem('');
    void navigate(href);
  };

  // //Preload of images
  useEffect(() => {
    navItems.forEach((item) => {
      item.children?.forEach((child) => {
        const img = new Image();
        img.src = child.imageSrc;
      });
    });
  }, []);

  // If there is an activeItem, then we are tracking the mouse/if the mouse leaves the header nav items or dropdown we close the dropdown
  useEffect(() => {
    if (!activeItem) return;

    const handleMouseMove = (e: MouseEvent) => {
      const isInNavItems = navbarRef.current?.contains(e.target as Node);
      const isInDropdown = dropdownRef.current?.contains(e.target as Node);

      if (!isInNavItems && !isInDropdown) {
        setIsLeaving(true);

        setTimeout(() => {
          setIsLeaving(false);
          setActiveItem('');
          setPrevItem('');
        }, 250);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [activeItem]);

  return (
    <>
      {/* Icon */}
      <Link to={'/'} className="my-2 cursor-pointer">
        <ICAFlogo />
      </Link>
      {/* Navigation Items*/}
      <div className="flex h-full items-center space-x-6" ref={navbarRef}>
        {navItems.map((item: NavItem) => (
          <a
            key={item.key}
            onMouseEnter={() => handleMouseEnterNavItems(item.label)}
            onClick={() => handleClick(item.href)}
            className={`group relative text-lg hover:cursor-pointer hover:text-primary ${
              activeItem === item.label ? 'text-primary' : 'text-black'
            }`}
          >
            {item.navLabel}
            {/*Nav Item Underline Animation*/}
            <span className="absolute left-1/2 top-7 h-[1px] w-0 -translate-x-1/2 transform bg-primary transition-all duration-300 ease-in-out group-hover:w-full"></span>
          </a>
        ))}

        {/* Donate Button */}
        <DonateButton className="w-32" />
      </div>

      {/* Dropdown Section */}
      {activeItem || isLeaving ? (
        <nav
          className="fixed left-1/2 top-[98px] min-h-80 w-full -translate-x-1/2 transform overflow-hidden 2xl:max-w-screen-2xl"
          ref={dropdownRef}
        >
          {prevItem !== 'SPONSORSHIP' && (
            <div className={`dropdown-inner static ${isLeaving ? 'exit' : ''}`}>
              <DesktopNavDropdown
                activeItem={prevItem || ''}
                setIsLeaving={setIsLeaving}
                setActiveItem={setActiveItem}
                setPrevItem={setPrevItem}
              />
            </div>
          )}

          <div
            key={activeItem}
            className={`dropdown-inner animated ${isLeaving ? 'exit' : ''}`}
          >
            <DesktopNavDropdown
              activeItem={activeItem}
              setIsLeaving={setIsLeaving}
              setActiveItem={setActiveItem}
              setPrevItem={setPrevItem}
            />
          </div>
        </nav>
      ) : (
        ''
      )}
    </>
  );
};
export default DesktopNav;
