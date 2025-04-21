import { NavItem, navItems } from "@/lib/navItems";

interface DesktopNavDropdownProps {
  activeItem: string;
}

const DesktopNavDropdown: React.FC<DesktopNavDropdownProps> = ({
  activeItem,
}) => {
  return (
    <>
      {activeItem &&
        navItems
          .filter((item: NavItem) => item.label === activeItem)
          .map((item: NavItem) => (
            <div key={item.key}>
              <div className="grid grid-cols-4 h-64"></div>
              <div className="h-16">{item.label}</div>
            </div>
          ))}
    </>
  );
};
export default DesktopNavDropdown;
