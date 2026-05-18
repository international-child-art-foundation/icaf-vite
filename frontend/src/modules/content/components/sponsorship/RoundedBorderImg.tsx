import { ColorKey, FlairColorMap } from '../shared/FlairColorMap';

interface RoundedBorderImgProps {
  img: string;
  color: ColorKey;
  height?: number;
}

export const RoundedBorderImg = ({
  img,
  color,
  height = 400,
}: RoundedBorderImgProps) => {
  return (
    <div
      className={`h-full w-full overflow-hidden rounded-[40px] border-4 bg-cover bg-[50%_20%] ${FlairColorMap[color].border}`}
      style={{ backgroundImage: `url(${img})`, height: height }}
    ></div>
  );
};
