import { IResourceLink } from '@/types/HealingArtsTypes';
import { Link } from 'lucide-react';
import { Button } from '../ui/button';

export const ResourceLink = ({ title, type, href }: IResourceLink) => {
  return (
    <div className="border-primary flex w-full flex-row gap-4 rounded-[26px] border-2 p-6">
      <Link color={'#FFB505'} />
      <div>
        <span className="font-bold">{title}</span> <span>({type})</span>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="h-full w-full"
      >
        <Button variant="pill">Open resource</Button>
      </a>
    </div>
  );
};
