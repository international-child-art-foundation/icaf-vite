import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { IExperimentalBrandingCard } from '@/types/SponsorshipTypes';
import { FlairColorMap } from '../shared/FlairColorMap';

interface ExperimentalBrandingCardProps {
  data: IExperimentalBrandingCard;
}

export const ExperimentalBrandingCard = ({
  data,
}: ExperimentalBrandingCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`relative grid h-[650px] grid-rows-10 overflow-hidden rounded-3xl border-4 ${FlairColorMap[data.color].border} select-none`}
    >
      <div className="row-span-8 row-start-1 overflow-hidden">
        {data.largeImgSrc ? (
          <>
            <img
              src={data.largeImgSrc}
              alt=""
              className="min-h-full min-w-full cursor-zoom-in object-cover"
              onClick={() => setOpen(true)}
              draggable={false}
            />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-w-[95vw] border-none bg-transparent p-0 shadow-none">
                <TransformWrapper
                  minScale={1}
                  maxScale={8}
                  limitToBounds={false}
                  centerOnInit
                  wheel={{ step: 0.15, wheelDisabled: false }}
                  pinch={{ step: 5 }}
                  doubleClick={{ disabled: false, step: 1, mode: 'zoomIn' }}
                  panning={{ velocityDisabled: true }}
                >
                  <div className="flex max-h-[85vh] w-[95vw] items-center justify-center">
                    <TransformComponent
                      wrapperClass="!w-auto !h-auto"
                      contentClass="!w-auto !h-auto"
                    >
                      <img
                        src={data.largeImgSrc}
                        alt=""
                        className="max-h-[85vh] max-w-none select-none rounded-lg"
                        draggable={false}
                      />
                    </TransformComponent>
                  </div>
                </TransformWrapper>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-300">
            <p className="text-3xl font-bold">Placeholder</p>
          </div>
        )}
      </div>

      <div className="row-span-2 row-start-9 mx-auto flex max-w-[300px] items-center">
        {data.logoSrc ? (
          <img
            src={data.logoSrc}
            alt=""
            className="mx-auto h-full w-auto object-contain p-4"
            draggable={false}
          />
        ) : (
          <p className="mx-auto p-4">Logo</p>
        )}
      </div>
    </div>
  );
};
