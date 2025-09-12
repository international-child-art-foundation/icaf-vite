import React from 'react';
import { TimeLineItem } from '@/types/WCFVerticalTimelineTypes';
import { DiamondShape } from '@/components/worldChildrensFestival/diamondShape';

interface verticalTimelineProps {
  items: TimeLineItem[];
}

export default function VerticalTimeline({ items }: verticalTimelineProps) {
  return (
    <>
      {/***Mobile Vertical Timeline Version***/}
      <div className="mx-4 grid h-[1200px] grid-cols-[auto_1fr] gap-x-10 md:hidden">
        {/* Diamond on timeline */}
        {items.map((item) => (
          <React.Fragment key={item.day}>
            <div className="relative flex items-start justify-center">
              <DiamondShape
                color={item.color}
                day={item.day}
                lineDescription={item.lineDescription}
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
      <div className="mx-4 hidden h-[1200px] grid-cols-3 md:grid">
        {/* Diamond on timeline */}
        {items.map((item) => (
          <React.Fragment key={item.day}>
            {(item.day === 'Day 1' || item.day === 'Day 3') && (
              <>
                {/*Spacer Div*/}
                <div />

                <div className="relative flex items-start justify-center">
                  <DiamondShape
                    color={item.color}
                    day={item.day}
                    lineDescription={item.lineDescription}
                    isOddDay={item.isOddDay}
                  />
                </div>

                {/* Day Content  */}
                <div className="pt-20">
                  <h3 className="font-montserrat text-2xl font-extrabold">
                    {item.title}
                  </h3>
                  <p className="text-xl font-light">{item.paragraph}</p>
                </div>
              </>
            )}

            {(item.day === 'Day 2' || item.day === 'Day 4') && (
              <>
                {/* Day Content  */}
                <div className="pt-20">
                  <h3 className="font-montserrat text-2xl font-extrabold">
                    {item.title}
                  </h3>
                  <p className="text-xl font-light">{item.paragraph}</p>
                </div>

                <div className="relative flex items-start justify-center">
                  <DiamondShape
                    color={item.color}
                    day={item.day}
                    lineDescription={item.lineDescription}
                    isOddDay={item.isOddDay}
                  />
                </div>
                {/*Spacer Div*/}
                <div />
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
