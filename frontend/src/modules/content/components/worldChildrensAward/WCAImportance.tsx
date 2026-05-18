import { NumberedCallout } from './NumberedCallout';
import { ColoredBox } from './ColoredBox';

export const WCAImportance = () => {
  return (
    <div className="breakout-w m-pad">
      <div className="flex flex-col gap-10">
        <h2 className="font-montserrat mx-auto text-[40px] font-extrabold">
          Why the World Children’s Award Matters
        </h2>
        <p>
          When children are encouraged to recognize positive leadership, they
          learn that:
        </p>
        <div className="flex flex-col gap-10">
          <NumberedCallout
            count="01"
            text="Their Voices Matter"
            color={'red'}
          />
          <NumberedCallout
            count="02"
            text="Creativity has Power"
            color={'tertiaryBlue'}
          />
          <NumberedCallout
            count="03"
            text="Empowering Low-SES Students"
            color={'yellow'}
          />
        </div>
        <div className="flex flex-col gap-10">
          <p className="font-montserrat text-2xl font-bold">The award helps:</p>
          <div className="flex min-h-[240px] flex-col gap-4 break-words md:grid md:grid-cols-3 xl:gap-24">
            <div className="flex">
              <ColoredBox
                text={'Build Confidence in Young Artists'}
                color={'red'}
              />
            </div>
            <div className="flex justify-center">
              <ColoredBox
                text={'Promote Cultural and Moral Understanding'}
                color={'blue'}
              />
            </div>
            <div className="flex justify-end">
              <ColoredBox
                text={'Inspire Leaders to Continue Supporting Childrens Growth'}
                color={'yellow'}
              />
            </div>
          </div>{' '}
          <p>
            It connects children, communities, and global organizations through
            creativity and shared values.
          </p>
        </div>
      </div>
    </div>
  );
};
