import { useWindowSize } from 'usehooks-ts';
import DesktopNav from './navigation/DesktopNav';
import MobileNav from './navigation/MobileNav';

const NavigationBar = () => {
  const size = useWindowSize();
  return (
    <header className="fixed left-0 right-0 top-0 z-50 h-[98px] bg-white shadow-md">
      {size.width < 1280 ? (
        <div className="max-w-screen-3xl relative mx-auto h-full px-8 md:px-12 lg:px-16 xl:px-20">
          <nav className="relative flex h-full items-center justify-between xl:hidden">
            <MobileNav />
          </nav>
        </div>
      ) : (
        <nav className="relative hidden h-full items-center justify-between xl:flex">
          <DesktopNav />
        </nav>
      )}
    </header>
  );
};

export default NavigationBar;
