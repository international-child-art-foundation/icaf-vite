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
      className={`grid-col grid gap-4 rounded-[20px] border-4 p-9 ${FlairColorMap[color]?.border} ${className}`}
    >
      <p className="font-montserrat text-4xl font-extrabold">{title}</p>
      <p>{description}</p>
    </div>
  );
};
