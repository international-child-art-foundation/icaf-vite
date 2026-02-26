import congress from '@/assets/worldChildrensAward/congress-img.webp';
import firework from '@/assets/worldChildrensAward/firework-small.svg';

export const WCAIntro = () => {
  return (
    <div className="breakout-w m-pad">
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_331px] md:gap-10">
        <div className="flex flex-col gap-10">
          <h2 className="font-montserrat text-[40px] font-extrabold">
            A Global Award Powered by Children’s Voices
          </h2>
          <div className="flex flex-col gap-6">
            <p>
              To mark its tenth anniversary, ICAF launched the World Children’s
              Awards, which allow young people to honor their favorite
              businesses, philanthropies, and cultural and educational leaders.
              These awards are celebrated during the World Children’s Festival,
              held every four years in Washington, D.C.
            </p>
            <p>
              Children from around the world can participate in the selection
              process, making this a truly global honor, nonpareil in the world.
            </p>
            <p>
              This award is more than recognition. It’s a tribute from the
              future leaders of the world to the present ones.
            </p>
          </div>
        </div>
        <div className="md:mx-unset relative mx-auto my-auto">
          <img
            src={firework}
            className="absolute -right-24 top-4 w-[150px] md:-top-12 md:right-0 md:w-[150px]"
          />
          <img
            src={firework}
            className="absolute -left-24 top-32 md:left-0 md:top-28"
          />
          <img src={congress} />
        </div>
      </div>
    </div>
  );
};
