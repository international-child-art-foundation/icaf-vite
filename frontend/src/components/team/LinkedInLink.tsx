import LinkedinIcon from '@/assets/team/LinkedinIconBlack.webp';

interface LinkedinLinkProps {
  src: string;
}

export const LinkedInLink = ({ src }: LinkedinLinkProps) => {
  return (
    <div>
      <a
        className="mx-auto flex justify-center gap-2 text-center"
        href={src}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={LinkedinIcon} />
        <span className="underline">LinkedIn</span>
      </a>
    </div>
  );
};
