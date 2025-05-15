import { ICAFlogo } from '@/assets/shared/logos/ICAFLogo';
import { NavItem, navItems } from '@/lib/navItems';
import DesktopNavDropdown from './DesktopNavDropdown';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DonateButton from '@/components/ui/donateButton';
import { throttle } from 'lodash';

const HEADERCOOLDOWN = 250; // ms cooldown for dropdown menu changes

const DesktopNav: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('');
  const [prevItem, setPrevItem] = useState<string>('');
  const [isLeaving, setIsLeaving] = useState(false);
  const navigate = useNavigate();
  const navbarRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const activeItemRef = useRef(activeItem);
  useEffect(() => {
    activeItemRef.current = activeItem;
  }, [activeItem]);

  const runHover = useCallback((label: string): void => {
    if (label === activeItemRef.current) return;
    setPrevItem(activeItemRef.current);
    if (!label || label === 'SPONSORSHIP') {
      setIsLeaving(true);
      setActiveItem('');
      setTimeout(() => setPrevItem(''), HEADERCOOLDOWN);
      return;
    }

    setIsLeaving(false);
    setActiveItem(label);
  }, []);

  const throttledHover = useMemo(() => {
    return throttle(runHover, HEADERCOOLDOWN, {
      leading: true,
      trailing: true,
    });
  }, []);

  useEffect(() => {
    return () => throttledHover.cancel();
  }, [throttledHover]);

  const handleClick = (href: string) => {
    setIsLeaving(true);
    setActiveItem('');
    setPrevItem('');
    void navigate(href);
  };

  const handleMouseLeaveDropdown = (event: React.MouseEvent) => {
    //First check if mouse moved up to navbar menu items, if not close dropdown
    if (!navbarRef.current?.contains(event.relatedTarget as Node)) {
      setIsLeaving(true);
      setTimeout(() => {
        setIsLeaving(false);
        setActiveItem('');
        setPrevItem('');
      }, HEADERCOOLDOWN);
    }
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
            onMouseEnter={() => throttledHover(item.label)}
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
        <div onMouseEnter={() => throttledHover('')}>
          <DonateButton className="w-32" title="Donate" />
        </div>
      </div>

      {/* Dropdown Section */}
      {activeItem || isLeaving ? (
        <nav
          className="fixed left-1/2 top-[98px] min-h-80 w-full -translate-x-1/2 transform overflow-hidden 2xl:max-w-screen-2xl"
          ref={dropdownRef}
          onMouseLeave={(event) => handleMouseLeaveDropdown(event)}
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
