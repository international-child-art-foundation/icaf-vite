import React from 'react';
import { TimeLineItem } from '@/types/WCFVerticalTimelineTypes';
import { DiamondShape } from '@/components/worldChildrensFestival/diamondShape';
import { AboutGraphic2 } from '@/assets/shared/images/about/AboutGraphic2';
interface verticalTimelineProps {
  items: TimeLineItem[];
}

export default function VerticalTimeline({ items }: verticalTimelineProps) {
  return (
    <>
      {/***Mobile Vertical Timeline Version***/}
      <div className="mx-4 mt-4 grid h-[1200px] grid-cols-[auto_1fr] gap-x-10 md:hidden">
        {/* Diamond on timeline */}
        {items.map((item) => (
          <React.Fragment key={item.day}>
            <div className="relative flex items-start justify-center">
              <DiamondShape
                color={item.color}
                day={item.day}
                lineDescription={item.lineDescription}
                alignDirection={item.alignDirectionMobile}
              />
            </div>

            {/* Day */}
            <div className="pb-10 pt-20">
              <h3 className="font-montserrat text-2xl font-extrabold">
                {item.title}
              </h3>
              <p className="text-xl font-light">{item.paragraph}</p>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/***Tablet + Desktop Vertical Timeline Version***/}
      <div className="relative mx-12 mt-8 hidden h-[720px] md:block">
        <div className="absolute -top-28 left-0">
          <AboutGraphic2 className="h-44 w-44 xl:h-60 xl:w-60" />
        </div>
        {items.map((item) => {
          return (
            <div key={item.day} className="relative mb-20 flex justify-center">
              {/* Timeline line and diamond */}
              <DiamondShape
                color={item.color}
                day={item.day}
                lineDescription={item.lineDescriptionDesktop}
                alignDirection={item.alignDirectionDesktop}
              />

              {/* Content */}
              <div
                className={`absolute top-20 ${
                  item.alignDirectionDesktop === 'left'
                    ? 'right-[61%] lg:right-[58%] xl:right-[59%] 2xl:right-[60%]'
                    : 'left-[61%] lg:left-[58%] xl:left-[59%] 2xl:left-[60%]'
                }`}
              >
                <h3 className="font-montserrat text-2xl font-extrabold">
                  {item.title}
                </h3>
                <p className="text-xl font-light">{item.paragraph}</p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// {/* <div className="mx-4 mt-8 hidden h-[1000px] grid-cols-3 md:mx-12 md:grid">
//   {/* Diamond on timeline */}
//   {items.map((item) => (
//     <React.Fragment key={item.day}>
//       {(item.day === 'Day 1' || item.day === 'Day 3') && (
//         <>
//           {/*Spacer Div*/}
//           <div />

//           <div className="relative flex items-start justify-center">
//             <DiamondShape
//               color={item.color}
//               day={item.day}
//               lineDescription={item.lineDescriptionDesktop}
//               alignDirection={item.alignDirectionDesktop}
//             />
//           </div>

//           {/* Day Content  */}
//           <div className="pt-20">
//             <h3 className="font-montserrat text-2xl font-extrabold">
//               {item.title}
//             </h3>
//             <p className="text-xl font-light">{item.paragraph}</p>
//           </div>
//         </>
//       )}

//       {(item.day === 'Day 2' || item.day === 'Day 4') && (
//         <>
//           {/* Day Content  */}
//           <div className="pt-20">
//             <h3 className="font-montserrat text-2xl font-extrabold">
//               {item.title}
//             </h3>
//             <p className="text-xl font-light">{item.paragraph}</p>
//           </div>

//           <div className="relative flex items-start justify-center">
//             <DiamondShape
//               color={item.color}
//               day={item.day}
//               lineDescription={item.lineDescriptionDesktop}
//               alignDirection={item.alignDirectionDesktop}
//             />
//           </div>
//           {/*Spacer Div*/}
//           <div />
//         </>
//       )}
//     </React.Fragment>
//   ))}
// </div>; */}
