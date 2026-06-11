// import galleryHeader from '@/modules/content/assets/gallery/gallery-header.webp';
// import { CurvedImage } from './CurvedImage';
import { GalleryCore } from '@/modules/content/components/gallery/GalleryCore';
import { Seo } from '@/modules/content/components/shared/Seo';
// import { OpinionatedGradients } from '@/data/gradientDefinition';
// import { useWindowSize } from 'usehooks-ts';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { Button } from '@/shared/components/ui/button';
import { Link } from 'react-router-dom';

const galleryMetadata = {
  title: 'Gallery | ICAF',
  description:
    "Browse artwork from children around the world submitted to ICAF's Arts Olympiad.",
  path: '/gallery',
};

export const Gallery = () => {
  // const { width } = useWindowSize();
  // let gradientDefinition;
  // if (width >= 1280) {
  //   gradientDefinition =
  //     'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.7)_40%,rgba(0,0,0,0.5)_60%,rgba(0,0,0,0)_100%)]';
  // } else if (width >= 1024) {
  //   gradientDefinition =
  //     'bg-[linear-gradient(to_right,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.6)_40%,rgba(0,0,0,0.5)_70%,rgba(0,0,0,0)_100%)]';
  // } else {
  //   gradientDefinition = OpinionatedGradients.sm;
  // }

  return (
    <>
      <Seo {...galleryMetadata} />
      <div className="content-gap">
        {/* <div className="site-w grid grid-cols-1 grid-rows-1">
          <div className="hero-w z-10 col-start-1 row-start-1 flex flex-col items-start gap-4 pt-24">
            <p className="font-montserrat max-w-3xl text-4xl font-semibold text-white sm:text-5xl md:text-6xl lg:text-6xl">
              Explore the{' '}
              <span className="font-semibold italic text-[#FFBC42]">
                {' '}
                Imagination{' '}
              </span>
              of the World's Children
            </p>
            <p className="max-w-2xl text-xl text-white lg:text-xl/8">
              They draw what words cannot contain. They draw what hurts, what
              heals, what inspires or aspires, and what they wish was different.
              Meet the shapers of the future.
            </p>
          </div>
          <div className="col-start-1 row-start-1">
            <CurvedImage
              src={galleryHeader}
              darkened={true}
              gradientDefinition={gradientDefinition}
            />
          </div>
        </div> */}

        <div
          id="gallery-section"
          className="mt-12 flex flex-col gap-4 sm:mt-24 md:gap-2"
        >
          <div className="sm:text-center">
            <p className="font-montserrat text-center text-5xl font-bold">
              Gallery
            </p>
            <div className="my-4 flex flex-col gap-4">
              <p className="m-pad flex flex-col gap-0 text-lg text-gray-800">
                <span>
                  ICAF is proud to host the artworks of young artists from all
                  over the world.
                </span>
                <span>
                  Add your child's dream to our ever growing gallery of marvels
                  and murals, free of charge.
                </span>
              </p>
              <div className="mx-auto block">
                <Link to={'/submit-artwork'}>
                  <Button className="text-base">Add your Masterpiece</Button>
                </Link>
              </div>
            </div>
          </div>
          <GalleryCore />
        </div>
      </div>
      <PageBottomSpacer />
    </>
  );
};
