import { FlairColorMap } from '../shared/FlairColorMap';
import { IMemberLink, ITeamCardData } from '@/types/GroupsAndMembersTypes';

export const TeamCard = ({
  Icon,
  color,
  groupsOfMembers,
  title,
  subtitle,
}: ITeamCardData) => {
  return (
    <div
      className={`h-full ${FlairColorMap[color].border} w-full content-center overflow-hidden rounded-[24px] border-2 px-8 py-12 shadow-[1px_4px_4px_rgba(0,0,0,0.1)] xl:content-normal xl:px-12 2xl:px-16 ${FlairColorMap[color]?.background} hover:bg-opacity-8 bg-opacity-0 transition-all duration-300`}
    >
      <div className="lg:max-w-unset mx-auto flex max-w-[380px] flex-col flex-wrap content-center gap-10 text-center text-[18px] leading-[26px]">
        <div className="flex flex-col gap-4">
          <Icon
            colorClass={`${FlairColorMap[color].icon}`}
            className="mx-auto"
          />
          <div className="flex flex-col gap-2">
            <p
              className={`${FlairColorMap[color].icon} text-[22px] font-bold`}
              style={{ whiteSpace: 'pre-line' }}
            >
              {title}
            </p>
            <p className="text-[18px]">{subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {groupsOfMembers.map(
            (group) =>
              group.members.length > 0 && (
                <div className="" key={group.members[0].name}>
                  <p className="text-wrap text-left text-base">
                    <span className="font-bold">{group.name} | </span>
                    {group.members.map((member: IMemberLink, n: number) => (
                      <span key={member.name}>
                        {member.link ? (
                          <a
                            className="font-normal underline"
                            target="_blank"
                            href={member.link}
                          >
                            {member.name}
                          </a>
                        ) : (
                          <span className="font-normal">{member.name}</span>
                        )}
                        <span className="font-normal">
                          {n + 1 < group.members.length ? ',' : ''}{' '}
                        </span>
                      </span>
                    ))}
                  </p>
                </div>
              ),
          )}
        </div>
      </div>
    </div>
  );
};
