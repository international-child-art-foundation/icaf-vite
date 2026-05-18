import { ColorKey, FlairColorMap } from '../shared/FlairColorMap';

interface ColoredBoxProps {
  color: ColorKey;
  text: string;
  className?: string;
}

export const ColoredBox = ({ color, text, className }: ColoredBoxProps) => {
  return (
    <div
      className={`${FlairColorMap[color].border} ${className} card-pad font-montserrat flex h-full w-full flex-col gap-10 rounded-lg border-4 p-6 text-2xl font-extrabold`}
    >
      {' '}
      <p className="my-auto">{text}</p>
    </div>
  );
};
