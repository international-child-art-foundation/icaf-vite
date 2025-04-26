import { NavItem, navItems } from "@/lib/navItems";
import { NavGraphic } from "@/assets/shared/images/navigation/navGraphic";
import { CircleArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DesktopNavDropdownProps {
  activeItem: string;
  preloadedImages: string[];
  setIsLeaving: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveItem: React.Dispatch<React.SetStateAction<string>>;
  setPrevItem: React.Dispatch<React.SetStateAction<string>>;
}

const DesktopNavDropdown: React.FC<DesktopNavDropdownProps> = ({
  activeItem,
  preloadedImages,
  setIsLeaving,
  setActiveItem,
  setPrevItem,
}) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [hoverState, setHoverState] = useState<number | null>(null);

  const navigate = useNavigate();

  const handleClick = (index: number, href: string) => {
    setSelectedImage(index);

    setTimeout(() => {
      navigate(href);
      setIsLeaving(true);
      setActiveItem("");
      setPrevItem("");
    }, 500);
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
                className={`grid h-64 `}
                style={{
                  gridTemplateColumns: `repeat(${item.col}, 1fr)`,
                }}
              >
                {item.children &&
                  item.children.map((child, i) => (
                    <div
                      key={i}
                      className={`relative group overflow-hidden transition-all duration-300 ${
                        hoverState === i
                          ? "scale-x-105 origin-right"
                          : "scale-x-100"
                      }`}
                      onClick={() => handleClick(i, child.href)}
                      onMouseEnter={() => setHoverState(i)}
                      onMouseLeave={() => setHoverState(null)}
                    >
                      <div className="relative w-full ">
                        <img
                          src={
                            preloadedImages.includes(child.imageSrc)
                              ? child.imageSrc
                              : ""
                          }
                          alt={child.alt}
                          className="w-full h-64 object-cover "
                          loading="lazy"
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-b from-black via-black to-black ${
                            selectedImage === i ? "opacity-70" : "opacity-40"
                          }`}
                        ></div>
                      </div>
                      {/*Image title and hover text*/}
                      <div
                        className={`absolute bottom-4 px-8 transition-all duration-300 group-hover:bottom-2 ${
                          child.hoverDescription !== ""
                            ? "group-hover:translate-y-[-120px]"
                            : "group-hover:translate-y-[-50px]"
                        } `}
                      >
                        <h3
                          className={` text-2xl text-text-inverse font-bold  leading-loose tracking-wide ${
                            item.col > 3 ? `xl:max-w-48` : ""
                          } 
                          `}
                        >
                          {child.label}
                        </h3>
                      </div>
                      <div
                        className={`absolute text-text-inverse px-8 transition-all duration-300 opacity-0 group-hover:opacity-100  ${
                          child.hoverDescription !== ""
                            ? "group-hover:translate-y-[-120px]"
                            : "group-hover:translate-y-[-50px]"
                        } `}
                      >
                        <p
                          className={`${
                            child.hoverDescription !== "" ? "mb-4" : "hidden"
                          }`}
                        >
                          {child.hoverDescription}
                        </p>
                        <p className="flex ">
                          Learn More{" "}
                          <span className=" ml-4">
                            <CircleArrowRight />
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
              {/* Bottom Label*/}
              <div className="flex items-center h-16 font-sans text-lg text-text-inverse font-semibold bg-primary gap-2 ">
                <NavGraphic />
                <div>{item.label}</div>
              </div>
            </div>
          ))}
    </>
  );
};
export default DesktopNavDropdown;
