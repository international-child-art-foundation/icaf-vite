import { useEffect, useState } from 'react';
import { NavItem } from '@/lib/navItems';
import { NavGraphic } from '@/assets/shared/images/navigation/navGraphic';
import { CircleArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DesktopNavDropdownProps {
  item: NavItem;
  progress: number;
  zIndex: number;
  fadingIn: boolean;
  isOpening: boolean;
  openingFromClosed: boolean;
  onItemSelected?: () => void;
}

const MAX_DROPDOWN_HEIGHT = 330;

const DesktopNavDropdown: React.FC<DesktopNavDropdownProps> = ({
  item,
  progress,
  zIndex,
  fadingIn,
  isOpening,
  openingFromClosed,
  onItemSelected,
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (!fadingIn) {
      setOpacity(1);
      return;
    }

    setOpacity(0);

    const timeoutId = window.setTimeout(() => {
      setOpacity(1);
    }, 40);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fadingIn]);

  const handleSelect = (index: number) => {
    setSelectedImage(index);
    if (onItemSelected) {
      onItemSelected();
    }
  };

  if (!item.children || item.children.length === 0) {
    return null;
  }

  const visibleHeight = MAX_DROPDOWN_HEIGHT * progress;

  const heightDuration = 350;

  const easing = isOpening
    ? openingFromClosed
      ? 'cubic-bezier(0.25, 0.9, 0.3, 1)'
      : 'cubic-bezier(0.25, 0.1, 0.25, 1)'
    : 'cubic-bezier(0.25, 0.1, 0.25, 1)';

  const containerStyle: React.CSSProperties = {
    height: `${visibleHeight}px`,
    opacity,
    zIndex,
    overflow: 'hidden',
    position: 'fixed',
    left: 0,
    right: 0,
    top: '98px',
    transition: `height ${heightDuration}ms ${easing}, opacity 500ms ease-out`,
    pointerEvents: progress > 0 ? 'auto' : 'none',
  };

  const innerStyle: React.CSSProperties = {
    transform: `translateY(${visibleHeight - MAX_DROPDOWN_HEIGHT}px)`,
    transition: `transform ${heightDuration}ms ${easing}`,
  };

  return (
    <div style={containerStyle} aria-hidden={progress === 0}>
      <div className="mx-auto w-full overflow-visible 2xl:max-w-screen-2xl">
        <div style={innerStyle}>
          <div
            className="grid h-64 cursor-pointer overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${item.children.length}, 1fr)`,
            }}
          >
            {item.children.map((child, i) => {
              const isExternal = child.external;

              const tileContent = (
                <>
                  <div className="relative w-full">
                    <img
                      src={child.imageSrc}
                      alt={child.alt}
                      className="h-64 w-full scale-105 object-cover"
                    />
                    <div
                      className={`absolute inset-0 bg-gradient-to-b from-black via-black to-black transition-opacity duration-300 ${
                        selectedImage === i ? 'opacity-50' : 'opacity-40'
                      } group-hover:opacity-60`}
                    ></div>
                  </div>

                  <div
                    className={`absolute bottom-4 px-8 transition-all duration-300 group-hover:bottom-2 ${
                      child.hoverDescription !== ''
                        ? 'group-hover:translate-y-[-120px]'
                        : 'group-hover:translate-y-[-50px]'
                    } `}
                  >
                    <h3
                      className={`text-text-inverse text-2xl font-bold leading-loose tracking-wide ${
                        (item.children?.length ?? 0) > 3 ? 'xl:max-w-48' : ''
                      } `}
                    >
                      {child.label}
                    </h3>
                  </div>

                  <div
                    className={`text-text-inverse absolute px-8 opacity-0 transition-all duration-300 group-hover:opacity-100 ${
                      child.hoverDescription !== ''
                        ? 'group-hover:translate-y-[-120px]'
                        : 'group-hover:translate-y-[-50px]'
                    } `}
                  >
                    <p
                      className={`${
                        child.hoverDescription !== '' ? 'mb-4' : 'hidden'
                      }`}
                    >
                      {child.hoverDescription}
                    </p>
                    <p className="flex">
                      Learn More{' '}
                      <span className="ml-4">
                        <CircleArrowRight />
                      </span>
                    </p>
                  </div>
                </>
              );

              if (isExternal) {
                return (
                  <a
                    key={child.href}
                    href={child.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
                    onClick={() => handleSelect(i)}
                    aria-label={child.label}
                  >
                    {tileContent}
                  </a>
                );
              }

              return (
                <Link
                  key={child.href}
                  to={child.href}
                  className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
                  onClick={() => handleSelect(i)}
                  aria-label={child.label}
                >
                  {tileContent}
                </Link>
              );
            })}
          </div>

          <div className="bg-primary text-text-inverse flex h-16 items-center gap-2 font-sans text-lg font-semibold">
            <NavGraphic />
            <div>{item.label}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopNavDropdown;
