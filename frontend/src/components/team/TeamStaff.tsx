import { TStaffData } from '@/types/TeamPageTypes';
import { TeamStaffItem } from './TeamStaffItem';
import { useWindowSize } from 'usehooks-ts';

interface TeamStaffProps {
  staffData: TStaffData;
}

export const TeamStaff = ({ staffData }: TeamStaffProps) => {
  const size = useWindowSize();
  const staffHeight = 419;
  const staffWidth = 380;
  const gap = 12;
  // On large screens, the last image should be aligned to the left, not centered
  // So: If large screen, set area width to an exact value, and use justify-start
  const areaWidth = size.width > 1252 ? gap * 4 * 2 + staffWidth * 3 : '100%';
  return (
    <div className="flex flex-col gap-10">
      <div className="text-center">
        <h2 className="font-montserrat text-[40px] font-extrabold">
          ICAF Leadership
        </h2>
        <h3 className="font-sans text-2xl">
          Providing vision and expertise to drive ICAF’s mission forward.
        </h3>
      </div>

      <div className={`mx-auto`} style={{ width: areaWidth }}>
        <div
          className={`mx-auto flex max-w-full flex-wrap gap-${gap} overflow-hidden`}
          style={{ justifyContent: size.width > 1252 ? 'start' : 'center' }}
        >
          {' '}
          {staffData.map((staffItem) => (
            <TeamStaffItem
              key={staffItem.name}
              data={staffItem}
              width={staffWidth}
              height={staffHeight}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
