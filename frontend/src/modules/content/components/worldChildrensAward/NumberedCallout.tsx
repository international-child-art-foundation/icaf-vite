import { ColorKey, FlairColorMap } from '../shared/FlairColorMap';

interface NumberedCalloutProps {
  color: ColorKey;
  text: string;
  count: string;
}

export const NumberedCallout = ({
  color,
  text,
  count,
}: NumberedCalloutProps) => {
  return (
    <div>
      <div
        className={`${FlairColorMap[color].icon} font-montserrat mt-[40px] flex flex-col gap-10 text-2xl font-semibold`}
      >
        <p className="text-[80px]">{count}</p>
        <p>{text}</p>
        <div className={`${FlairColorMap[color].border} border-b-4`}></div>
      </div>
    </div>
  );
};
