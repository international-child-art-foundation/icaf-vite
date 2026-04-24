type MuralCardProps = {
  src: string;
  name: string;
  age: number;
  className?: string;
};

const muralCardBaseClasses = 'relative overflow-hidden rounded-lg';
const muralImageClasses = 'h-full w-full object-cover';
const muralOverlayWrapperClasses =
  'absolute inset-0 flex items-end justify-end';
const muralTagClasses =
  'shadow-3xl mt-auto bg-black/70 px-4 py-2 text-right text-lg font-semibold text-white rounded-tl-lg';

export const MuralCard = ({ src, name, age, className }: MuralCardProps) => {
  return (
    <div className={`${muralCardBaseClasses} ${className ?? ''}`}>
      <img src={src} className={muralImageClasses} alt="" />
      <div className={muralOverlayWrapperClasses}>
        <p className={muralTagClasses}>
          {name}
          <br />
          <span className="font-normal">Age {age}</span>
        </p>
      </div>
    </div>
  );
};
