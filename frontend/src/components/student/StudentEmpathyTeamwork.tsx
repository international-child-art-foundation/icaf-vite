import yellowFirework from '@/assets/shared/images/yellowFirework.webp';

export const StudentEmpathyTeamwork = () => {
  return (
    <div className="relative pt-12 xl:flex xl:flex-row xl:gap-12">
      <img
        src={yellowFirework}
        className="absolute -left-10 -top-8 opacity-20 lg:left-0 lg:top-0 lg:opacity-60 xl:relative xl:h-[290px] xl:w-[290px]"
      />
      <div className="z-10 my-auto flex flex-col gap-10 lg:pl-52 xl:p-0">
        <p className="font-montserrat text-[32px] font-extrabold leading-[40px]">
          Embrace Empathy and Teamwork
        </p>
        <p>
          Creativity is also about understanding others. When you put yourself
          in someone else’s shoes, you see them as a friend and partner, not a
          competitor. This is called empathy. At ICAF, we believe that by
          working together, we can create amazing things and make the world a
          better place.
        </p>
      </div>
    </div>
  );
};
