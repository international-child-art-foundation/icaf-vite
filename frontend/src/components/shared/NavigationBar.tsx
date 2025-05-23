import DesktopNav from './navigation/DesktopNav';
import MobileNav from './navigation/MobileNav';

const NavigationBar = () => {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-[98px] bg-white shadow-md">
      <div className="mx-auto h-full max-w-screen-2xl px-6 xl:px-20">
        <nav className="flex h-full items-center justify-between xl:hidden">
          <MobileNav />
        </nav>
        <nav className="hidden h-full items-center justify-between xl:flex">
          <DesktopNav />
        </nav>
      </div>
    </header>
  );
};

export default NavigationBar;
