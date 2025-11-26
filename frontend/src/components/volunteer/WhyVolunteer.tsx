import ClimateFestivalImg from '@/assets/volunteer/volunteerGroup.webp';

const sectionTitleClasses = 'font-montserrat text-4xl font-semibold';
const rightImageWrapperClasses = 'overflow-hidden rounded-xl';
const rightImageClasses = 'h-full w-full object-cover';

export const WhyVolunteer = () => {
  return (
    <div className="max-w-screen-2xl px-8 md:pl-12 lg:pl-16 xl:pl-20">
      <div className="flex flex-col gap-8">
        <h2 className={sectionTitleClasses}>Join the Team</h2>

        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-center">
          <div className="flex h-full flex-col lg:pr-8">
            <div className="flex flex-1 flex-col justify-center gap-4 text-lg">
              <p>
                More than <span className="font-semibold">500 volunteers</span>{' '}
                have helped ICAF since its founding in 1997. Today, volunteers
                help as <span className="font-semibold">accountants</span>,{' '}
                <span className="font-semibold">assistant editors</span>,{' '}
                <span className="font-semibold">curators</span>,{' '}
                <span className="font-semibold">curricula developers</span>,{' '}
                <span className="font-semibold">designers</span>,{' '}
                <span className="font-semibold">event planners</span>,{' '}
                <span className="font-semibold">fundraising experts</span>,{' '}
                <span className="font-semibold">graphic artists</span>,{' '}
                <span className="font-semibold">
                  strategic marketing professionals
                </span>
                , <span className="font-semibold">UX designers</span>,{' '}
                <span className="font-semibold">backend developers</span>,{' '}
                <span className="font-semibold">web developers</span>, and{' '}
                <span className="font-semibold">
                  volunteers at the World Children’s Festival
                </span>
                . Some volunteers have helped ICAF for a whole year or several
                years.
              </p>
              <p>
                If you're a student who doesn't have a particular area of
                expertise yet, but wants to get involved and make a difference,
                we would love to receive your application. About{' '}
                <span className="font-semibold"> 360 students </span>
                have helped the children by interning for ICAF since 1997.
              </p>
            </div>
          </div>

          <div className={rightImageWrapperClasses}>
            <img
              src={ClimateFestivalImg}
              className={rightImageClasses}
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};
