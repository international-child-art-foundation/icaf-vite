import { ICAFlogo } from "@/assets/shared/logos/ICAFLogo";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "lucide-react";
import { NavItem, navItems } from "@/lib/navItems";
import DesktopNavDropdown from "./DesktopNavDropdown";
import { useState } from "react";

const DesktopNav: any = () => {
  const [activeItem, setActiveItem] = useState<string>("");
  console.log(activeItem);
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
            className="text-lg text-gray-700 hover:text-gray-900"
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
        <nav className="fixed inset-x-0 top-[98px] bg-primary">
          <DesktopNavDropdown activeItem={activeItem} />
        </nav>
      ) : (
        ""
      )}
    </>
  );
};
export default DesktopNav;
