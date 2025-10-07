import usImg from '@/assets/peaceThroughArt/united-states-congress-background-flat-style 1.webp';
import blueFirework from '@/assets/peaceThroughArt/blueFirework.svg';

export const UrgencyOfPeace = () => {
  return (
    <div className="flex flex-col xl:px-24">
      <div className="z-20 flex flex-col items-center gap-10 text-center">
        <p className="text-[40px] font-extrabold leading-[48px]">
          The Urgency of Peace
        </p>
        <p className="z-20">
          War, destruction, and division dominate our daily headlines, prompting
          children to wonder why people and nations struggle to coexist. Why
          does peace seem so elusive and social harmony so fragile? While human
          history is bloodcurdling, the real hope for peace lives in our
          children—a new generation with the power to shape a more harmonious
          future.
        </p>
      </div>
      <div className="grid grid-cols-1 grid-rows-1 sm:grid sm:grid-cols-2 sm:grid-rows-1">
        <div className="mt-8 hidden h-full w-full items-end justify-start sm:flex">
          <img
            src={blueFirework}
            className="h-[256px] w-[288px] sm:scale-75 lg:scale-100"
          />
        </div>
        <div className="flex h-full w-full items-end justify-end">
          <img src={usImg} className="-mt-16" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-10 text-center">
        <p className="mt-12 text-[40px] font-extrabold leading-[48px]">
          The Power of Art to Heal
        </p>
        <p>
          In response to the 9/11 terrorist attacks, ICAF developed a{' '}
          <span className="font-bold">Peace Through Art Program </span>
          that deploys participants’ creativity to inspire mutual empathy and
          break the cycles of trauma and hatred. ICAF conducted its first
          program for Cyprus, which involved ten Greek-Cypriots and ten
          Turkish-Cypriots coming to Washington, D.C. for a three-week training
          in June 2002. Since then, ICAF has employed its peace methodology at
          its <span className="font-bold">World Children’s Festivals</span>,
          enabling young people to help transform our wounded world into a
          wondrous one.
        </p>
      </div>
    </div>
  );
};
