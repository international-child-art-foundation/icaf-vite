interface VideoWrapperProps {
  src: string;
  curved: boolean;
}

export const VideoWrapper = ({ src, curved }: VideoWrapperProps) => {
  return (
    <div className={`${curved && 'rounded-xl'} h-full w-full`}>
      <video src={src} className="h-auto w-full" />
    </div>
  );
};
