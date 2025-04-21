import { NavItem, navItems } from "@/lib/navItems";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useState } from "react";

const MobileNavMenu = () => {
  const [openAccordian, setOpenAccordian] = useState<string | undefined>();
  return (
    <div className="text-text-inverse font-sans font-medium tracking-wider">
      <Accordion
        type="single"
        collapsible
        value={openAccordian}
        onValueChange={setOpenAccordian}
        className="space-y-4"
      >
        {navItems.map((item: NavItem) => (
          <AccordionItem value={item.key} key={item.key}>
            <AccordionTrigger className="flex justify-between font-semibold">
              {item.label}
            </AccordionTrigger>
            <AccordionContent className="pl-4 space-y-2 text-base font-normal">
              {item.children?.map((child) => (
                <a key={child.href} href={child.href} className="block">
                  {child.label}
                </a>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
export default MobileNavMenu;
