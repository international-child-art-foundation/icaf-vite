interface PageBottomSpacerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'pb-10 md:pb-14',
  md: 'pb-16 md:pb-24',
  lg: 'pb-24 md:pb-36',
};

export const PageBottomSpacer = ({ size = 'md' }: PageBottomSpacerProps) => (
  <div className={sizeClasses[size]} />
);
