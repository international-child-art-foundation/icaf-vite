import DesignersImage from '@/assets/team/DesignersImage.webp';
import Lightbulb from '@/assets/team/Lightbulb.svg';
import { designerData } from '@/data/team/designerDeveloperData';
import redBackground from '@/assets/team/redBackground.svg';

export const DesignersSmall = () => {
  return (
    <div className="relative flex flex-col gap-4">
      <p className="relative text-center text-[40px] font-bold">ICAF Team</p>
      <div className="relative z-10 col-start-1 row-start-1 content-center p-4 py-12">
        <div className="relative flex flex-col gap-8">
          <div className="bg-background relative flex max-h-full flex-col items-center justify-center gap-4 overflow-hidden rounded-[40px] p-8 shadow-[0px_4px_17px_0px_rgba(21,20,20,0.1)] sm:p-8 md:p-16 lg:p-20 xl:p-32">
            <img src={Lightbulb} className="h-[70px] w-[70px]" />
            <div className="flex flex-col gap-2 text-center">
              <div className="text-[22px] font-bold text-[#DA1E40]">
                Designers
              </div>
              <div className="flex flex-col font-sans text-lg">
                <p className="">Bringing ICAF’s creative vision to life.</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {designerData.map(
                (group) =>
                  group.members.length > 0 && (
                    <div className="" key={group.name}>
                      <p className="text-wrap">
                        <span className="font-bold">{group.name} | </span>
                        {group.members.map((member: string, n: number) => (
                          <span key={member}>
                            <span className="font-normal underline">
                              {member}
                            </span>
                            <span className="font-normal">
                              {n + 1 < group.members.length ? ',' : ''}{' '}
                            </span>
                          </span>
                        ))}
                      </p>
                    </div>
                  ),
              )}
            </div>
          </div>
          <div className="grid h-[487px] grid-cols-1 grid-rows-1">
            <div className="py-12">
              <div className="relative col-start-1 row-start-1 max-h-full overflow-hidden rounded-[40px] shadow-[0px_4px_17px_0px_rgba(21,20,20,0.1)]">
                <img
                  src={DesignersImage}
                  className="h-[487px] min-h-full min-w-full object-cover object-center"
                />
              </div>
            </div>
            <img
              className="col-start-1 row-start-1 w-[600px] justify-self-center"
              src={redBackground}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const DesignersLarge = () => {
  return (
    <div className="relative flex flex-col gap-4">
      <p className="relative text-center text-[40px] font-bold">ICAF Team</p>
      <div className="grid grid-cols-1 grid-rows-1">
        <div className="relative z-10 col-start-1 row-start-1 content-center p-4 py-12">
          <div className="bg-background relative grid h-[485px] grid-cols-2 overflow-hidden rounded-[40px] shadow-[0px_4px_17px_0px_rgba(21,20,20,0.1)]">
            <div className="relative flex max-h-full flex-col items-center justify-center gap-4 px-4 sm:px-8 md:px-16 lg:px-20 xl:px-32">
              <img src={Lightbulb} className="h-[70px] w-[70px]" />
              <div className="flex flex-col gap-2 text-center">
                <div className="text-[22px] font-bold text-[#DA1E40]">
                  Designers
                </div>
                <div className="flex flex-col font-sans text-lg">
                  <p className="">Bringing ICAF’s creative vision to life.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {designerData.map(
                  (group) =>
                    group.members.length > 0 && (
                      <div className="" key={group.name}>
                        <p className="text-wrap">
                          <span className="font-bold">{group.name} | </span>
                          {group.members.map((member: string, n: number) => (
                            <span key={member}>
                              <span className="font-normal underline">
                                {member}
                              </span>
                              <span className="font-normal">
                                {n + 1 < group.members.length ? ',' : ''}{' '}
                              </span>
                            </span>
                          ))}
                        </p>
                      </div>
                    ),
                )}
              </div>
            </div>
            <div className="relative grid max-h-full grid-cols-1 grid-rows-1 overflow-hidden">
              <img
                src={DesignersImage}
                className="min-h-full min-w-full object-cover object-center"
              />
            </div>
          </div>
        </div>
        <img
          className="absolute right-0 col-start-1 row-start-1 max-h-full object-cover"
          src={redBackground}
        />
      </div>
    </div>
  );
};
