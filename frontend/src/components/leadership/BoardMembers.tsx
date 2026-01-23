import { IBoardMember } from '@/types/BoardMemberTypes';
import { useWindowSize } from 'usehooks-ts';

interface IBoardMembersProps {
  memberData: IBoardMember[];
}

export const BoardMembers = ({ memberData }: IBoardMembersProps) => {
  const { width } = useWindowSize();
  const colorArr = ['bg-tertiary-yellow', 'bg-tertiary-green', 'bg-primary'];

  return (
    <div className="flex w-full flex-wrap justify-between gap-y-10">
      {memberData.map((member, idx) => {
        let colorClass = '';
        let dynamicStyle = {};

        if (width >= 1024) {
          colorClass = colorArr[idx % 3];
        } else if (width >= 768) {
          colorClass = colorArr.slice(0, 2)[idx % 2];
        } else {
          const n = memberData.length;
          const step = idx / (n - 1 || 1);

          const pivot = 0.7;
          let h, s, l;

          if (step <= pivot) {
            const localStep = step / pivot;
            h = 38 + localStep * (140 - 38);
            s = 100 + localStep * (73 - 100);
            l = 63 + localStep * (32 - 63);
          } else {
            const localStep = (step - pivot) / (1 - pivot);
            h = 140 + localStep * (215 - 140);
            s = 73 + localStep * (69 - 73);
            l = 32 + localStep * (28 - 32);
          }

          dynamicStyle = { backgroundColor: `hsl(${h} ${s}% ${l}%)` };
        }

        return (
          <div
            key={member.name}
            className="mx-auto flex w-full max-w-[400px] flex-row gap-4 text-left md:mx-0 md:w-[calc(50%-20px)] md:max-w-[400px] lg:w-[calc(33.33%-20px)] lg:max-w-[350px]"
          >
            <div
              className={`h-full w-[10px] shrink-0 ${colorClass}`}
              style={dynamicStyle}
            ></div>
            <div className="my-auto">
              <a
                href={member.link}
                rel="noopener noreferrer"
                target="_blank"
                className="font-montserrat text-xl font-semibold hover:underline"
              >
                {member.name}
              </a>{' '}
              <p className="text-[20px]">{member.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
