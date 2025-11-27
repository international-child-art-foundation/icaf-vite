import { creativityItems } from '@/data/student/StudentData';
import { ICreativityItem } from '@/types/StudentTypes';

export const StudentCreativity = () => {
  return (
    <div className="mt-20">
      <div className="flex flex-col gap-6 md:gap-10">
        <h2 className="font-montserrat text-[40px] font-extrabold leading-[48px]">
          Why Is Creativity Important?
        </h2>
        <p className="font-sans text-xl font-normal">
          In today's world, creativity is everywhere! Whether you want to be a
          scientist, engineer, mathematician, or artist, creativity helps you
          think outside the box and come up with amazing solutions. When you
          practice being creative, you learn to:
        </p>
        {creativityItems.map((item: ICreativityItem) => (
          <div
            key={item.id}
            className="border-secondary-blue rounded-[26px] border-2 p-4 px-8 sm:p-8 sm:px-12"
          >
            <div className="flex flex-row gap-6 sm:gap-8 md:gap-12">
              <img src={item.imgSrc} />
              <div className="flex flex-col gap-3">
                <h3 className="font-montserrat text-[24px] font-bold leading-[32px] sm:text-[30px] sm:leading-[38px]">
                  {item.title}
                </h3>
                <p className="font-sans text-xl">{item.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
