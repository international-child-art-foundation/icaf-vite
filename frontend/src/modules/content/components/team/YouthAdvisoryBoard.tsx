import { youthAdvisoryBoardData } from '@/modules/content/data/team/youthAdvisoryBoardData';

export const YouthAdvisoryBoard = () => {
  return (
    <section
      className="content-w m-pad flex flex-col gap-10"
      aria-labelledby="youth-advisory-board-heading"
    >
      <div className="text-center">
        <h2
          id="youth-advisory-board-heading"
          className="font-montserrat text-[40px] font-extrabold leading-[48px]"
        >
          Youth Advisory Board
        </h2>
        <p className="font-sans text-2xl">
          Sharing perspectives that help shape ICAF’s future.
        </p>
      </div>

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {youthAdvisoryBoardData.map((member) => (
          <article
            key={member.name}
            className="group mx-auto flex w-full max-w-[360px] flex-col gap-5"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-gray-100">
              <img
                src={member.image}
                alt={`${member.name}, Youth Advisory Board member from ${member.location}`}
                className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${member.objectPositionOverride ?? 'object-center'}`}
                style={
                  member.imagePosition
                    ? { objectPosition: member.imagePosition }
                    : undefined
                }
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex flex-col text-left">
              {member.link ? (
                <a
                  href={member.link}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="font-montserrat focus-visible:outline-primary text-xl font-semibold leading-6 decoration-2 underline-offset-4 focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 group-hover:underline"
                >
                  {member.name}
                </a>
              ) : (
                <h3 className="font-montserrat text-xl font-semibold leading-6">
                  {member.name}
                </h3>
              )}
              <p className="font-sans text-base text-gray-600">
                {member.location}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
