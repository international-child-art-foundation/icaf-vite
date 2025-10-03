import { useState } from 'react';
import { IResourceLink } from '@/types/HealingArtsTypes';
import { Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export const ResourceLink = ({
  title,
  behavior,
  fileType,
  href,
}: IResourceLink) => {
  const [open, setOpen] = useState(false);

  if (!href) {
    return (
      <div className="flex w-full items-center justify-center rounded-[26px] bg-gray-300 p-10">
        <span className="text-2xl font-bold text-black">Placeholder</span>
      </div>
    );
  }

  const openAsModal = behavior === 'modal';

  return (
    <>
      <div className="border-primary flex w-full flex-row items-center gap-4 rounded-[26px] border-2 p-6">
        <LinkIcon color="#FFB505" className="min-h-6 min-w-6" />
        <div>
          <span className="font-bold">{title}</span> <span>({fileType})</span>
        </div>

        {openAsModal ? (
          <Button
            type="button"
            variant="pill"
            className="ml-auto"
            onClick={() => setOpen(true)}
          >
            Open resource
          </Button>
        ) : (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex"
          >
            <Button variant="pill">Open resource</Button>
          </a>
        )}
      </div>

      {openAsModal && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="border-none bg-transparent p-0 shadow-none">
            <div className="relative flex items-center justify-center rounded-xl bg-black/80 p-3">
              <video src={href} controls className="rounded-lg" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
