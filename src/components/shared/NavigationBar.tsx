import { ICAFlogo } from '@/assets/shared/logos/ICAFLogo';

const NavigationBar = () => {
  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-50 flex h-[98px] min-h-[98px] w-full items-center justify-center bg-white shadow-md">
        <div className="my-2">
          <ICAFlogo />
        </div>
      </div>
    </>
  );
};

export default NavigationBar;
