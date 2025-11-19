import ArtsOlympiadLogo from '@/assets/arts-olympiad/MFS_Logo_V3.svg';
import { Button } from '../ui/button';

export const ArtsOlympiadCTA = () => {
  return (
    <div className="relative mb-24 mt-12">
      <div className="relative flex h-[300px] grid-rows-2 flex-col items-center rounded-xl bg-blue-100 p-12 px-24 md:grid md:grid-cols-2 md:grid-rows-1">
        <div className="relative flex flex-col gap-4">
          <p className="font-montserrat text-3xl font-semibold">
            Ready to express your creativity?
          </p>
          <p className="font-montserrat text-xl">
            Sign up today and get inspired!
          </p>
          <span>
            <a
              href="https://myfavoritesport.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-montserrat visited:text-purple:500 text-xl font-semibold text-blue-600"
            >
              <Button>Visit the Arts Olympiad website</Button>
            </a>
          </span>
        </div>
        <img
          src={ArtsOlympiadLogo}
          className="absolute right-12 ml-auto h-[400px]"
        />
      </div>
    </div>
  );
};
