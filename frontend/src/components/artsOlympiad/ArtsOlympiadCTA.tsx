import ArtsOlympiadLogo from '@/assets/arts-olympiad/MFS_Logo_V3.svg';
import { Button } from '../ui/button';

export const ArtsOlympiadCTA = () => {
  return (
    <div className="relative mb-24 mt-12">
      <div className="relative flex flex-col items-center gap-4 rounded-xl bg-blue-100 p-12 px-24 md:grid md:h-[300px] md:grid-cols-2 md:grid-rows-1">
        <div className="relative order-2 flex flex-col gap-4 md:order-1">
          <p className="font-montserrat text-3xl font-semibold">
            Ready to express your creativity?
          </p>
          <p className="font-montserrat text-xl">
            Sign up today and get inspired!
          </p>
          <span className="mx-auto md:mx-0">
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
          className="order-1 h-[400px] md:absolute md:right-12 md:order-2 md:ml-auto"
        />
      </div>
    </div>
  );
};
