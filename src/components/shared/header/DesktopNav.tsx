import { ICAFlogo } from "@/assets/shared/logos/ICAFLogo";

const DesktopNav: any = () => {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 min-h-[98px] h-[98px] bg-white w-full flex justify-center items-center shadow-md">
        <div className="my-2">
          <ICAFlogo />
        </div>
      </div>
    </>
  );
};
export default DesktopNav;
