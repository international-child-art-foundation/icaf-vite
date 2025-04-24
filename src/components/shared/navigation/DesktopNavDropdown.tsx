import { NavItem, navItems } from "@/lib/navItems";
import { NavGraphic } from "@/assets/shared/images/navigation/navGraphic";

interface DesktopNavDropdownProps {
  activeItem: string;
  preloadedImages: string[];
}

const DesktopNavDropdown: React.FC<DesktopNavDropdownProps> = ({
  activeItem,
  preloadedImages,
}) => {
  return (
    <>
      {activeItem &&
        navItems
          .filter((item: NavItem) => item.label === activeItem)
          .map((item: NavItem) => (
            <div key={item.key}>
              {/* Image Section*/}
              <div
                className="grid h-64 "
                style={{
                  gridTemplateColumns: `repeat(${item.col}, 1fr)`,
                }}
              >
                {item.children &&
                  item.children.map((child, i) => (
                    <div key={i} className="relative">
                      <div className="relative w-full">
                        <img
                          src={
                            preloadedImages.includes(child.imageSrc)
                              ? child.imageSrc
                              : ""
                          }
                          alt={child.alt}
                          className="w-full h-64 object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black opacity-40"></div>
                      </div>
                      <h3
                        className={`absolute bottom-6 text-2xl text-text-inverse font-bold pl-8 leading-loose tracking-wide ${
                          item.col > 3 ? `xl:max-w-48` : ""
                        } 
                          `}
                      >
                        {child.label}
                      </h3>
                    </div>
                  ))}
              </div>
              {/* Bottom Label*/}
              <div className="flex items-center h-16 font-sans text-lg text-text-inverse font-semibold bg-primary gap-2">
                <NavGraphic className="" />
                <div className="">{item.label}</div>
              </div>
            </div>
          ))}
    </>
  );
};
export default DesktopNavDropdown;
