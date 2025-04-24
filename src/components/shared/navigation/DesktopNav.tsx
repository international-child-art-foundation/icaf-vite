import { ICAFlogo } from "@/assets/shared/logos/ICAFLogo";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "lucide-react";
import { NavItem, navItems } from "@/lib/navItems";
import DesktopNavDropdown from "./DesktopNavDropdown";
import { useState, useEffect } from "react";

const DesktopNav: any = () => {
  const [activeItem, setActiveItem] = useState<string>("");
  const [preloadedImages, setPreloadedImages] = useState<string[]>([]);

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

      <div className="flex space-x-6 items-center">
        {navItems.map((item: NavItem) => (
          <a
            key={item.key}
            onClick={() => setActiveItem(item.label)}
            className={`text-lg hover:text-primary hover:cursor-pointer ${
              activeItem === item.label ? "text-primary" : "text-black"
            }`}
          >
            {item.navLabel}
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
      {activeItem !== "" ? (
        <nav className="fixed top-[98px] left-1/2 transform -translate-x-1/2 bg-primary 2xl:max-w-screen-2xl w-full">
          <DesktopNavDropdown
            activeItem={activeItem}
            preloadedImages={preloadedImages}
          />
        </nav>
      ) : (
        ""
      )}
    </>
  );
};
export default DesktopNav;
