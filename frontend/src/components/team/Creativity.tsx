import { ClippedBanner } from './BannerContent';
import Hand from '@/assets/team/Hand.webp';

export const Creativity = () => {
  return (
    <div className="grid-col grid gap-8">
      <p className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
        Committed to Creativity
      </p>
      <div className="xl:grid xl:grid-cols-2 xl:grid-rows-1">
        <ClippedBanner height={445}>
          <div className="flex h-full bg-[#2057CC]/10 p-2">
            <div className="mx-auto flex flex-col justify-center gap-4 p-8 text-left md:max-w-[450px] md:p-0">
              <p className="font-montserrat text-[24px] font-semibold">
                Our team is united by a passion for{' '}
                <span className="text-primary font-bold">
                  empowering children through art.
                </span>
              </p>
              <p>
                With expertise across disciplines, we work together to{' '}
                <span className="font-bold">
                  inspire creativity, foster cultural awareness, and build a
                  brighter future
                </span>{' '}
                for young minds worldwide.
              </p>
            </div>
          </div>
        </ClippedBanner>
        <ClippedBanner height={445} className="-mt-16 xl:mt-0">
          <div
            className="h-full w-full bg-cover bg-[50%_50%]"
            style={{ backgroundImage: `url(${Hand})` }}
          />
        </ClippedBanner>
      </div>
    </div>
  );
};
