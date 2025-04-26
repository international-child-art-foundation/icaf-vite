import { ICAFlogo } from "@/assets/shared/logos/ICAFLogo";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "lucide-react";
import { NavItem, navItems } from "@/lib/navItems";
import DesktopNavDropdown from "./DesktopNavDropdown";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const DesktopNav: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>("");
  const [prevItem, setPrevItem] = useState<string>("");
  const [isLeaving, setIsLeaving] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const navbarRef = useRef<HTMLDivElement | null>(null);

  const handleMouseEnter = (label: string) => {
    if (label !== activeItem) {
      setActiveItem(label);
      setPrevItem(activeItem);

      //Specific sequence allowing the dropdown to exit when hovering sponsorhsip
      if (label === "SPONSORSHIP") {
        setIsLeaving(true);
        setActiveItem("");

        setTimeout(() => {
          setPrevItem("");
        }, 250);
      } else {
        setIsLeaving(false);
      }
    }
  };

  const handleMouseLeave = (event: React.MouseEvent) => {
    //First check if mouse moved up to navbar menu items, if not close dropdown
    if (!navbarRef.current?.contains(event.relatedTarget as Node)) {
      setIsLeaving(true);
      setTimeout(() => {
        setIsLeaving(false);
        setActiveItem("");
        setPrevItem("");
      }, 250);
    }
  };

  const handleClick = (label: string, href: string) => {
    if (label === "SPONSORSHIP") {
      navigate(href);
    }
  };

  //Preload of images
  const preloadImage = (imageUrl: string) => {
    if (!preloadedImages.includes(imageUrl)) {
      const img = new Image();
      img.src = imageUrl;
      setPreloadedImages((prev) => [...prev, imageUrl]);
    }
  };

  useEffect(() => {
    navItems.find((item) => {
      item.children?.forEach((child) => {
        preloadImage(child.imageSrc);
      });
    });
  }, []);

  return (
    <>
      {/* Icon */}
      <div className="my-2">
        <ICAFlogo />
      </div>

      <div className="flex space-x-6 items-center h-full " ref={navbarRef}>
        {navItems.map((item: NavItem) => (
          <a
            key={item.key}
            onMouseEnter={() => handleMouseEnter(item.label)}
            onClick={() => handleClick(item.label, item.href)}
            className={`text-lg hover:text-primary hover:cursor-pointer relative group ${
              activeItem === item.label ? "text-primary" : "text-black"
            }`}
          >
            {item.navLabel}
            {/*Nav Item Underline Animation*/}
            <span className="absolute top-7 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-primary transition-all duration-300 ease-in-out group-hover:w-full"></span>
          </a>
        ))}

        {/* Donate Button */}
        <div className="flex justify-center">
          <Button
            asChild
            variant="secondary"
            className="h-14 w-32 rounded-full text-base font-semibold tracking-wide"
          >
            <a
              href="https://icaf.org/donate"
              target="blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <HeartIcon
                strokeWidth={2}
                className="stroke-black !w-6 !h-6 lg:!w-6 lg:!h-6 lg:mr-0"
              />
              Donate
            </a>
          </Button>
        </div>
      </div>

      {/* Dropdown Section */}
      {activeItem || isLeaving ? (
        <nav
          className="fixed top-[98px] left-1/2 transform -translate-x-1/2  2xl:max-w-screen-2xl w-full overflow-hidden min-h-80"
          onMouseLeave={(event) => handleMouseLeave(event)}
        >
          {prevItem !== "SPONSORSHIP" && (
            <div className={`dropdown-inner static ${isLeaving ? "exit" : ""}`}>
              <DesktopNavDropdown
                activeItem={prevItem || ""}
                preloadedImages={preloadedImages}
                setIsLeaving={setIsLeaving}
                setActiveItem={setActiveItem}
                setPrevItem={setPrevItem}
              />
            </div>
          )}

          <div
            key={activeItem}
            className={`dropdown-inner animated ${isLeaving ? "exit" : ""}`}
          >
            <DesktopNavDropdown
              activeItem={activeItem}
              preloadedImages={preloadedImages}
              setIsLeaving={setIsLeaving}
              setActiveItem={setActiveItem}
              setPrevItem={setPrevItem}
            />
          </div>
        </nav>
      ) : (
        ""
      )}
    </>
  );
};
export default DesktopNav;
