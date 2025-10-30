import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { IMagazine } from '@/types/Magazines';
import { getMagazines } from '@/server_asset_handlers/magazines';

export default function BackIssueGrid() {
  const [magazines, setMagazines] = useState<IMagazine[]>([]);
  const [sliceRange, setSliceRange] = useState(6);
  const sliceStart = 5;

  useEffect(() => {
    getMagazines().then(setMagazines).catch(console.error);
  }, []);

  return (
    <section className="mx-auto mt-16 w-full max-w-screen-2xl px-5 md:px-20 lg:px-20 xl:px-28 2xl:px-36">
      <h2 className="mb-4 text-center text-2xl font-bold md:text-3xl">
        Back issues of <span className="italic">ChildArt</span>
      </h2>
      <p className="text-lef mx-auto mb-8 text-gray-700">
        You can choose from a list of the quarterly magazine’s past issues. Each
        magazine covers a relevant and timely subject. The information is
        presented in an exciting, colorful way for young readers to cherish.
      </p>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {magazines
          .slice(sliceStart, sliceStart + sliceRange)
          .map((magazine) => (
            <div
              key={magazine.name}
              className="overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl"
            >
              <img
                src={magazine.cover}
                alt={magazine.name}
                className="aspect-[2/3] w-full object-cover"
              />
            </div>
          ))}
      </div>

      <div className="mt-8 flex justify-center">
        {sliceStart + sliceRange < magazines.length && (
          <Button
            variant="secondary"
            className="rounded-full px-6 py-3 text-base font-semibold shadow hover:shadow-md"
            onClick={() => setSliceRange((prev) => prev + 6)}
          >
            View More
          </Button>
        )}
      </div>
    </section>
  );
}
