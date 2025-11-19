interface IProps extends React.HTMLProps<HTMLDivElement> {
  imgUrl: string;
  alt?: string;
  heading: string;
  description: string[];
  button?: string[];
  isActive: boolean;
  gradientStrength: number | undefined;
}

export const GuidelineCard = ({
  className,
  imgUrl,
  alt,
  heading,
  description,
  button,
  isActive,
  gradientStrength = 0.2,
  ...restProps
}: IProps) => {
  const baseAnimationStyle = {
    opacity: 0,
    transition: 'opacity 0.3s ease-out 0.2s',
  };

  const activeAnimationStyle = {
    transform: 'translateY(0)',
    opacity: 1,
  };

  const baseTitleAnimationStyle = {
    transition: 'opacity 0.3s ease-out',
  };

  const activeTitleAnimationStyle = {
    transition: 'opacity 0.2s ease-out 0.2s',
  };

  return (
    <article
      className={`relative min-w-[140px] overflow-hidden rounded-xl text-white ${className}`}
      style={{ boxShadow: '5px 6px 25px 4px rgba(0, 0, 0, 0.18)' }}
      {...restProps}
    >
      <img
        className="border-b-1 -z-20 h-full w-full rounded-b-none border-black object-cover"
        src={imgUrl}
        alt={alt || ''}
      />
      <div
        className="duration-900 absolute bottom-0 z-0 h-full w-full transition-opacity"
        style={{
          opacity: isActive ? 1 : 0,
          background: `linear-gradient(
      to top,
      rgba(0,0,0,${gradientStrength}) 0%,
      rgba(0,0,0,${gradientStrength}) 60%,
      rgba(0,0,0,${gradientStrength * 0.3}) 100%
    )`,
        }}
      ></div>
      <div
        style={
          isActive
            ? { ...baseAnimationStyle, ...activeAnimationStyle }
            : baseAnimationStyle
        }
        className={
          'div-textholder absolute bottom-0 flex w-full min-w-full max-w-[450px] flex-col gap-6 p-6 lg:max-w-[unset]'
        }
      >
        <p className="font-montserrat break-normal text-xl font-semibold">
          {heading}
        </p>
        {description &&
          description.map((item) => {
            return (
              <p
                key={item[0]}
                className="min-w-[100%] font-sans text-lg font-light"
              >
                {item}
              </p>
            );
          })}

        {button && (
          <div className="box-border inline-flex grow-0 rounded">
            <a
              rel="noopener noreferrer"
              target="_blank"
              className="text-new-blue box-border rounded bg-white px-4 py-3 text-black"
              href={button[1]}
            >
              {button[0]}
            </a>
          </div>
        )}
      </div>
      <div
        className={`${isActive ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'} absolute bottom-0 w-full p-6`}
        style={
          isActive
            ? { ...baseTitleAnimationStyle }
            : { ...activeTitleAnimationStyle }
        }
      >
        <p className="break-normal text-xl font-semibold">{heading}</p>
      </div>
    </article>
  );
};
