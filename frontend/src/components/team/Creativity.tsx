import { ClippedBanner } from './BannerContent';
import Hand from '@/assets/team/Hand.webp';

export const Creativity = () => {
  return (
    <div className="flex max-w-screen-2xl flex-col gap-8 px-8 md:px-12 lg:px-16 xl:px-20">
      <div className="grid-col grid gap-8">
        <p className="text-center text-[40px] font-bold">
          Committed to Creativity
        </p>
        <div className="xl:grid xl:grid-cols-2 xl:grid-rows-1">
          <ClippedBanner height={445}>
            <div className="flex h-full bg-[#2057CC]/10 p-2">
              <div className="mx-auto flex max-w-[400px] flex-col justify-center gap-4 text-center">
                <p className="font-montserrat text-[22px] font-semibold">
                  Our team is united by a passion for empowering children
                  through art.
                </p>
                <p>
                  With expertise across disciplines, we work together to inspire
                  creativity, foster cultural awareness, and build a brighter
                  future for young minds worldwide.
                </p>
              </div>
            </div>
          </ClippedBanner>
          <ClippedBanner height={445}>
            <div
              className="h-full w-full bg-cover bg-[50%_50%]"
              style={{ backgroundImage: `url(${Hand})` }}
            />
          </ClippedBanner>
        </div>
      </div>
    </div>
  );
};
