import React from 'react';
import { TimeLineItem } from '@/types/WCFVerticalTimelineTypes';
import { DiamondShape } from '@/components/worldChildrensFestival/diamondShape';
import { AboutGraphic2 } from '@/assets/shared/images/about/AboutGraphic2';

/**
 * This component maps over the TimeLineItem to create the full timeline.
 *  There are two seperate setups, one for mobile and one for md+/desktop
 */

interface verticalTimelineProps {
  items: TimeLineItem[];
}

export default function VerticalTimeline({ items }: verticalTimelineProps) {
  return (
    <>
      {/***Mobile Vertical Timeline Version***/}
      <div className="grid h-[1200px] grid-cols-[auto_1fr] gap-x-10 px-6 md:hidden">
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
      <div className="relative hidden h-[720px] md:block md:px-12 lg:px-16 xl:px-20">
        <div className="absolute -top-8 left-12 lg:left-20">
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
