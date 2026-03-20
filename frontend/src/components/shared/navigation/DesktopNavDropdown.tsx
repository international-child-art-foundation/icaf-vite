import { useState } from 'react';
import { NavItem, NavChild } from '@/lib/navItems';
import { NavGraphic } from '@/assets/shared/images/navigation/navGraphic';
import { CircleArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DesktopNavDropdownProps {
  item: NavItem;
  progress: number;
  zIndex: number;
  isOpening: boolean;
  openingFromClosed: boolean;
  onItemSelected?: () => void;
}

const MAX_DROPDOWN_HEIGHT = 330;

const DesktopNavDropdown: React.FC<DesktopNavDropdownProps> = ({
  item,
  progress,
  zIndex,
  isOpening,
  openingFromClosed,
  onItemSelected,
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelectedImage(index);
    onItemSelected?.();
  };

  if (!item.children || item.children.length === 0) {
    return null;
  }

  const easing = isOpening
    ? openingFromClosed
      ? 'cubic-bezier(0.25, 0.9, 0.3, 1)'
      : 'cubic-bezier(0.25, 0.1, 0.25, 1)'
    : 'cubic-bezier(0.25, 0.1, 0.25, 1)';

  const containerStyle: React.CSSProperties = {
    height: `${MAX_DROPDOWN_HEIGHT}px`,
    zIndex,
    position: 'fixed',
    left: 0,
    right: 0,
    top: '98px',
    transform: `translateY(${(progress - 1) * MAX_DROPDOWN_HEIGHT}px)`,
    transition: `transform 500ms ${easing}`,
    pointerEvents: progress > 0 ? 'auto' : 'none',
  };

  return (
    <div
      style={containerStyle}
      aria-hidden={progress === 0}
      className="overflow-hidden"
    >
      <div className="2xl:max-w-screen-3xl mx-auto w-full">
        <div
          className="grid h-64"
          style={{
            gridTemplateColumns: `repeat(${item.children.length}, 1fr)`,
          }}
        >
          {item.children.map((child: NavChild, i: number) => {
            const commonClassName =
              'group grid grid-cols-1 grid-rows-1 overflow-hidden';

            const tileContent = (
              <>
                <div className="col-start-1 row-start-1">
                  <img
                    src={child.imageSrc}
                    alt={child.alt || child.label}
                    className="h-64 w-full scale-105 object-cover"
                  />
                </div>

                <div
                  className={`col-start-1 row-start-1 bg-black transition-opacity duration-300 ${
                    selectedImage === i ? 'opacity-50' : 'opacity-40'
                  } group-hover:opacity-60`}
                />

                <div className="col-start-1 row-start-1 flex flex-col justify-end overflow-hidden p-8">
                  <div
                    className={`flex flex-col transition-transform duration-300 ease-out group-hover:translate-y-0 ${item.key === 'programs' ? 'translate-y-[calc(100%-5rem)]' : 'translate-y-[calc(100%-3rem)]'}`}
                  >
                    <h3
                      className={`text-text-inverse flex items-center text-2xl font-bold leading-[1.4] tracking-wide ${
                        (item.children?.length ?? 0) > 3 ? 'xl:max-w-48' : ''
                      }`}
                    >
                      {child.label}
                    </h3>

                    <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <p
                        className={`text-text-inverse ${
                          child.hoverDescription !== ''
                            ? 'mb-4 mt-2'
                            : 'h-0 opacity-0'
                        }`}
                      >
                        {child.hoverDescription}
                      </p>

                      <p className="text-text-inverse flex items-center">
                        Learn More
                        <span className="ml-4">
                          <CircleArrowRight />
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </>
            );

            if (child.external) {
              return (
                <a
                  key={child.href}
                  href={child.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={commonClassName}
                  onClick={() => handleSelect(i)}
                >
                  {tileContent}
                </a>
              );
            }

            return (
              <Link
                key={child.href}
                to={child.href}
                className={commonClassName}
                onClick={() => handleSelect(i)}
              >
                {tileContent}
              </Link>
            );
          })}
        </div>

        {item.href ? (
          <Link
            className="bg-primary text-text-inverse group flex h-16 items-center gap-2 font-sans text-lg font-semibold"
            to={item.href}
            onClick={() => onItemSelected?.()}
          >
            <NavGraphic />
            <p className="group-hover:underline">{item.label}</p>
          </Link>
        ) : (
          <div className="bg-primary text-text-inverse flex h-16 items-center gap-2 font-sans text-lg font-semibold">
            <NavGraphic />
            <p>{item.label}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopNavDropdown;
