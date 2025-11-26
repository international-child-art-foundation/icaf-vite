import globeImg from '@/assets/shared/images/New-York-_Michael-Wong_---11.webp';
import DonateButton from '../ui/donateButton';

export const PeacefulFutureCTA = () => {
  return (
    <div>
      <div className="z-20 flex flex-col gap-4 text-center">
        <img src={globeImg} className="mx-auto" />
        <h2 className="font-montserrat text-[40px] font-extrabold leading-[48px]">
          Help Us Shape a Peaceful Future
        </h2>
        <p className="z-20">
          Art has the power to heal. Children have the power to change the
          world.
        </p>
        <div className="z-20 mx-auto">
          <DonateButton text="Support Peace through Art" />
        </div>
      </div>
    </div>
  );
};
