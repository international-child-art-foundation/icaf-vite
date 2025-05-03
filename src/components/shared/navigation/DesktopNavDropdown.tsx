import { NavItem, navItems } from '@/lib/navItems';
import { NavGraphic } from '@/assets/shared/images/navigation/navGraphic';
import { CircleArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DesktopNavDropdownProps {
  activeItem: string;
  setIsLeaving: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  setPrevItem: React.Dispatch<React.SetStateAction<string>>;
}

const DesktopNavDropdown: React.FC<DesktopNavDropdownProps> = ({
  activeItem,
  setIsLeaving,
  setActiveItem,
  setPrevItem,
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleClick = (index: number, href: string) => {
    setSelectedImage(index);
    void navigate(href);
    setIsLeaving(true);
    setActiveItem('');
    setPrevItem('');

    // setTimeout(() => {
    //   void navigate(href);
    //   setIsLeaving(true);
    //   setActiveItem('');
    //   setPrevItem('');
    // }, 500);
  };
  return (
    <>
      {activeItem &&
        navItems
          .filter((item: NavItem) => item.label === activeItem)
          .map((item: NavItem) => (
            <div key={item.key}>
              {/* Image Section*/}
              <div
                className="grid h-64 overflow-hidden"
                style={{
                  gridTemplateColumns: `repeat(${item.col}, 1fr)`,
                }}
              >
                {item.children &&
                  item.children.map((child, i) => (
                    <div
                      key={i}
                      className={`group relative overflow-hidden transition-all duration-300 hover:scale-105`}
                      onClick={() => handleClick(i, child.href)}
                    >
                      <div className="relative w-full">
                        <img
                          src={child.imageSrc}
                          alt={child.alt}
                          className="h-64 w-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-b from-black via-black to-black ${
                            selectedImage === i ? 'opacity-70' : 'opacity-40'
                          }`}
                        ></div>
                      </div>
                      {/*Image title and hover text*/}
                      <div
                        className={`absolute bottom-4 px-8 transition-all duration-300 group-hover:bottom-2 ${
                          child.hoverDescription !== ''
                            ? 'group-hover:translate-y-[-120px]'
                            : 'group-hover:translate-y-[-50px]'
                        } `}
                      >
                        <h3
                          className={`text-2xl font-bold leading-loose tracking-wide text-text-inverse ${
                            item.col > 3 ? `xl:max-w-48` : ''
                          } `}
                        >
                          {child.label}
                        </h3>
                      </div>
                      <div
                        className={`absolute px-8 text-text-inverse opacity-0 transition-all duration-300 group-hover:opacity-100 ${
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
                    </div>
                  ))}
              </div>
              {/* Bottom Label*/}
              <div className="flex h-16 items-center gap-2 bg-primary font-sans text-lg font-semibold text-text-inverse">
                <NavGraphic />
                <div>{item.label}</div>
              </div>
            </div>
          ))}
    </>
  );
};
export default DesktopNavDropdown;
