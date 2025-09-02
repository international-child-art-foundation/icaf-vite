import { ColorKey, FlairColorMap } from '../shared/FlairColorMap';

interface TitleDescriptionCardProps {
  color: ColorKey;
  title: string;
  description: string;
  className?: string;
}

export const TitleDescriptionCard = ({
  title,
  description,
  color,
  className,
}: TitleDescriptionCardProps) => {
  return (
    <div
      className={`flex h-full flex-col flex-wrap justify-evenly gap-2 rounded-[20px] border-4 p-9 ${FlairColorMap[color]?.border} ${className}`}
    >
      <p className="font-montserrat text-[32px] font-extrabold xl:text-4xl">
        {title}
      </p>
      <p className="font-sans text-xl">{description}</p>
    </div>
  );
};
