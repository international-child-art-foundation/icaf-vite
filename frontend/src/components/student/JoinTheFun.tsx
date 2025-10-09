import { studentParticipationItems } from '@/data/student/StudentData';
import { FlairColorMap } from '../shared/FlairColorMap';
import { Link } from 'react-router-dom';

import { Button } from '../ui/button';

export const JoinTheFun = () => {
  return (
    <div className="my-24 mb-16 md:my-32">
      <div className="mx-auto flex flex-col gap-10 px-8">
        <p className="font-montserrat text-center text-[40px] font-extrabold leading-[48px]">
          Join the Fun with ICAF!
        </p>
        <div className="mx-auto grid w-full grid-cols-1 grid-rows-3 gap-11 xl:grid-cols-3 xl:grid-rows-1">
          {studentParticipationItems.map((item) => (
            <div
              key={item.id}
              className={`mx-auto w-full max-w-[1000px] gap-5 rounded-[26px] border-4 ${FlairColorMap[item.color].border} p-8 sm:p-16`}
            >
              <div className="lg:max-w-unset mx-auto flex h-full max-w-[600px] flex-col justify-between gap-5">
                <div
                  className={`mx-auto flex h-[100px] w-[100px] justify-center overflow-hidden rounded-full border-2 ${FlairColorMap[item.color].border}`}
                >
                  <img src={item.imgSrc} className="h-13 m-auto w-auto" />
                </div>
                <p className="font-montserrat text-center text-[24px] font-semibold leading-[39px] md:text-[31px] lg:text-left">
                  {item.title}
                </p>
                <p
                  className={`font-montserrat text-center text-[24px] font-bold leading-[32px] ${FlairColorMap[item.color].icon} `}
                >
                  {item.forAges}
                </p>
                <p className="font-montserrat text-xl font-normal">
                  {item.bodyText1}
                </p>
                <p className="font-montserrat text-xl font-normal">
                  {item.bodyText2}
                </p>
                <Link
                  to={item.link}
                  className="font-montserrat mx-auto text-[31px] font-semibold leading-[39px]"
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                >
                  {' '}
                  <Button
                    variant="default"
                    className="mt-[30px] min-h-[70px] min-w-[280px] rounded-full text-[25px] leading-[32px]"
                  >
                    {item.buttonText}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
