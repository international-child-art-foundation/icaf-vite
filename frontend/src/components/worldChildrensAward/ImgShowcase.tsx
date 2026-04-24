import { FlairColorMap } from '../shared/FlairColorMap';
import { IWCAImgShowcase } from '@/data/worldChildrensAward/WCAData';

interface ImgShowcaseProps extends IWCAImgShowcase {
  textLeft: boolean;
}

export const ImgShowcase = ({
  text,
  color,
  img,
  textLeft,
}: ImgShowcaseProps) => {
  return (
    <div className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-10">
      <div className={`${textLeft === true ? 'md:order-1' : 'md:order-2'}`}>
        {text}
      </div>
      <div
        className={`${FlairColorMap[color].border} ${textLeft === true ? 'md:order-2' : 'md:order-1'} overflow-hidden rounded-xl border-2`}
      >
        <img src={img} className="h-full w-full object-cover" />
      </div>
    </div>
  );
};
