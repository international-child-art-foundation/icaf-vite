// components/childArt/BackIssueGrid.tsx
import { Button } from '@/components/ui/button';
import { magazineCovers } from '@/data/magazineCovers';

export default function BackIssueGrid() {
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
        {magazineCovers.slice(0, 6).map((cover, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl"
          >
            <img
              src={cover.image}
              alt={cover.title}
              className="aspect-[2/3] w-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          variant="secondary"
          className="rounded-full px-6 py-3 text-base font-semibold shadow hover:shadow-md"
        >
          <a href="">View more</a>
        </Button>
      </div>
    </section>
  );
}
