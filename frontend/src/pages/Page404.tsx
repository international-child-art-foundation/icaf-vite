import { Link, useNavigate } from 'react-router-dom';
import image404 from '@/assets/page404/404Image.webp';
import { Button } from '@/components/ui/button';
import { Seo } from '@/components/shared/Seo';

const notFoundMetadata = {
  title: 'Page not found | ICAF',
  description: 'The page you were looking for could not be found.',
  path: '/404',
  noIndex: true,
};

export const Page404 = () => {
  const navigate = useNavigate();

  const handleGoBack: React.MouseEventHandler<HTMLButtonElement> = () => {
    if (window.history.length > 1) {
      void navigate(-1);
    } else {
      void navigate('/');
    }
  };

  return (
    <>
      <Seo {...notFoundMetadata} />
      <div className="relative flex h-full w-full flex-1 flex-col items-center">
        <div className="grid-cols-auto max-w-screen-3xl relative mx-auto my-auto grid w-full grid-rows-[1fr_1fr] items-center gap-12 overflow-hidden px-8 py-12 md:grid-cols-[1fr_0.75fr] md:grid-rows-[1fr] md:px-12 lg:px-16 xl:px-20">
          <div className="relative h-full w-full overflow-hidden rounded-xl">
            <img src={image404} className="h-full object-cover object-right" />
          </div>
          <div className="space-between flex h-full flex-col flex-wrap justify-between gap-8">
            <div className="flex flex-col gap-4">
              <h1
                className="to-secondary-blue from-tertiary-blue inline-block bg-gradient-to-r bg-clip-text text-5xl font-bold text-transparent md:text-7xl"
                style={{
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Whoops!
              </h1>
              <h1 className="text-xl font-medium text-gray-800">
                404 - PAGE NOT FOUND
              </h1>
            </div>

            <div className="text-center">
              <p className="text-xl">We looked all over the world, but </p>
              <p className="text-3xl font-semibold">
                we couldn't find that page.
              </p>
              <p className="italic text-gray-700">
                It may still be under construction.
              </p>
            </div>

            <div className="mx-auto grid grid-cols-2 items-center gap-2">
              <Link to="/" className="">
                <Button className="w-full px-6 py-6 text-[20px]">
                  Return Home
                </Button>
              </Link>

              <Button onClick={handleGoBack} className="px-6 py-6 text-[20px]">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
