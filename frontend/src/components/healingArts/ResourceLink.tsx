import { IResourceLink } from '@/types/HealingArtsTypes';
import { Link } from 'lucide-react';
import { Button } from '../ui/button';

export const ResourceLink = ({ title, type, href }: IResourceLink) => {
  if (!href) {
    return (
      <div className="flex w-full items-center justify-center rounded-[26px] bg-gray-300 p-10">
        <span className="text-2xl font-bold text-black">Placeholder</span>
      </div>
    );
  }

  return (
    <div className="border-primary flex w-full flex-row items-center gap-4 rounded-[26px] border-2 p-6">
      <Link color="#FFB505" />
      <div>
        <span className="font-bold">{title}</span> <span>({type})</span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto flex"
      >
        <Button variant="pill">Open resource</Button>
      </a>
    </div>
  );
};
