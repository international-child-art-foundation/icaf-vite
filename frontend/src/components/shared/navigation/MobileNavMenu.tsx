import { NavItem, navItems } from '@/lib/navItems';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { useState } from 'react';
import { toUpper } from 'lodash';
import { Link } from 'react-router-dom';

type Child = {
  label: string;
  href: string;
  key?: string;
};

type MobileNavMenuProps = {
  onCloseMenu?: () => void;
};

const isVisitable = (item: NavItem) =>
  typeof item.href === 'string' && item.href.length > 0;

const hasChildren = (item: NavItem) =>
  Array.isArray(item.children) && item.children.length > 0;

const MobileNavMenu = ({ onCloseMenu }: MobileNavMenuProps) => {
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
        {navItems.map((item: NavItem) => {
          const visitable = isVisitable(item);
          const children = (item.children ?? []) as Child[];
          const hasKids = hasChildren(item);

          if (!hasKids) {
            const href = visitable ? item.href : undefined;
            if (!href) {
              return (
                <div key={item.key} className="px-1 py-2 text-base">
                  {toUpper(item.label)}
                </div>
              );
            }
            return (
              <Link
                key={item.key}
                to={href}
                className="block px-1 py-2 text-base font-semibold"
                onClick={onCloseMenu}
              >
                {toUpper(item.label)}
              </Link>
            );
          }

          const contentChildren: Child[] = visitable
            ? [
                {
                  label: item.label,
                  href: item.href,
                  key: `${item.key}__self`,
                },
                ...children,
              ]
            : children;

          return (
            <AccordionItem value={item.key} key={item.key}>
              <AccordionTrigger className="flex justify-between font-semibold">
                {toUpper(item.label)}
              </AccordionTrigger>
              <AccordionContent className="space-y-2 pl-4 text-base font-normal">
                {contentChildren.map((child) => {
                  const key = child.key ?? `${item.key}:${child.href}`;
                  return (
                    <Link
                      key={key}
                      to={child.href}
                      className="block"
                      onClick={onCloseMenu}
                    >
                      {child.label}
                    </Link>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default MobileNavMenu;
