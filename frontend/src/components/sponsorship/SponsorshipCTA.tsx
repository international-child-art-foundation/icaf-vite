import DonateButton from '@/components/ui/donateButton';

export const SponsorshipCTA = () => {
  return (
    <div>
      <div className="flex flex-col items-center gap-8">
        <p className="font-montserrat text-[32px] font-extrabold">
          Let's work together
        </p>
        <p className="font-open-sans text-normal">
          Let’s build a peaceful, creative, and caring world with children’s
          help.
        </p>
        <DonateButton
          className="mb-2 lg:h-14 lg:text-base"
          text="Support Children's Creativity"
        />
      </div>
    </div>
  );
};
