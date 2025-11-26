import TransparencyLogo from '@/assets/donate/TransparencyLogo.png';

export const DonationHeaderContent = () => {
  return (
    <div className="z-20 flex flex-col gap-8">
      <div>
        <h1 className="font-montserrat text-secondary-yellow text-left text-4xl font-bold md:text-6xl xl:text-7xl">
          Art Changes Lives,
        </h1>
        <h2 className="font-montserrat text-left text-4xl font-bold text-white md:text-5xl lg:text-6xl">
          You Can Too.
        </h2>
      </div>
      <p className="font-montserrat text-left text-base text-white md:text-lg lg:text-xl">
        Your gift funds art programs for underserved schools, spotlights young
        artists at the World Children's Festival, and delivers creativity
        without ads through ChildArt Magazine. Empower children to create their
        future—donate today!
      </p>
      <div className="flex w-full">
        <a
          href="https://www.guidestar.org/profile/52-2032649"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer opacity-95 transition-opacity hover:opacity-100"
        >
          <img
            src={TransparencyLogo}
            alt="Transparent Logo"
            className="h-20 w-auto md:h-20"
          />
        </a>
      </div>
    </div>
  );
};
