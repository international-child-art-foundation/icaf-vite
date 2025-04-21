import { ICAFlogo } from "@/assets/shared/logos/ICAFLogo";
import { Menu, X } from "lucide-react";
import { Button } from "../../ui/button";
import { useState } from "react";
import MobileNavMenu from "../header/MobileNavMenu";

const MobileNav: any = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="">
        <ICAFlogo />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="!p-0"
        onClick={() => setOpen((open) => !open)}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="!h-6 !w-6" /> : <Menu className="!h-6 !w-6" />}
      </Button>

      {open && (
        <nav className="fixed inset-x-0 top-[98px]  bg-primary p-6">
          {<MobileNavMenu />}
        </nav>
      )}
    </>
  );
};

export default MobileNav;
