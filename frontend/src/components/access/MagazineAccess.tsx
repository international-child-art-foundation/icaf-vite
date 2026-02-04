import { useState, useEffect } from 'react';
import { IMagazine } from '@/types/Magazines';
import { getMagazines } from '@/server_asset_handlers/magazines';
import { MagazineEntryWithLink } from './MagazineEntryWithLink';

export const MagazineAccess = () => {
  const [magazines, setMagazines] = useState<IMagazine[]>([]);

  useEffect(() => {
    getMagazines().then(setMagazines).catch(console.error);
  }, []);

  return (
    <div className="max-w-screen-3xl my-12 flex flex-col gap-12 px-8 md:px-12 lg:px-16 xl:px-20">
      <div className="font-montserrat mx-auto text-center text-5xl font-semibold">
        <p>ChildArt Magazine</p>
      </div>
      <div className="grid grid-cols-1 gap-4 overflow-hidden rounded-lg bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 p-4 shadow-lg md:grid-cols-2 lg:grid-cols-3">
        {magazines.map((magazine) => (
          <MagazineEntryWithLink
            key={magazine.name + magazine.period}
            {...magazine}
          />
        ))}
      </div>
    </div>
  );
};
