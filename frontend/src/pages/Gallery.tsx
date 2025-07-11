import galleryHeader from '@/assets/gallery/gallery-header.png';
import { CurvedImage } from './CurvedImage';
import { GalleryCore } from '@/components/gallery/GalleryCore';

export const Gallery = () => {
  return (
    <div>
      <div className="grid grid-cols-1 grid-rows-1">
        <div className="z-10 col-start-1 row-start-1 flex max-w-[100%] flex-col gap-4 p-8 sm:max-w-[90%] lg:p-20 xl:max-w-[70%]">
          <p className="font-montserrat text-4xl font-semibold text-white sm:text-5xl md:text-6xl lg:text-6xl">
            Explore the{' '}
            <span className="font-normal italic text-[#FFBC42]">
              {' '}
              Imagination{' '}
            </span>
            of the World's Children
          </p>
          <p className="text-xl text-white lg:text-xl/10">
            They draw what words cannot contain. They draw what hurts, what
            heals, what inspires or aspires, and what they wish was different.
            Meet the shapers of the future.
          </p>
        </div>
        <div className="col-start-1 row-start-1">
          <CurvedImage
            src={galleryHeader}
            blur={true}
            brightened={true}
            gradientDefinition="bg-gradient-to-r from-black/90 via-20% via-black/80 to-60% to-black/0"
          />
        </div>
      </div>

      <div className="grid gap-4">
        <p className="font-montserrat text-center text-5xl font-bold">
          Gallery
        </p>
        <p className="text-center">
          Children's art is the most honest and pure form of human creative
          expression.
        </p>
        <GalleryCore />
      </div>
    </div>
  );
};
