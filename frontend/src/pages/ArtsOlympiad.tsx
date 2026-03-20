import { artsOlympiadHero, artsOlympiadColoring, artsOlympiadPainting } from '@/assets/artsOlympiad';
import ArtsOlympiadTorch from '@/assets/shared/images/arts-olympiad-7-transparent.svg';
import { Picture } from '@/components/shared/Picture';
import { ArtsOlympiadHelpfulLinks } from '@/components/artsOlympiad/ArtsOlympiadHelpfulLinks';
import { PageBottomSpacer } from '@/components/shared/PageBottomSpacer';
import { Seo } from '@/components/shared/Seo';

const artsOlympiadMetadata = {
  title: 'Arts Olympaid | ICAF',
  description:
    "ICAF's Arts Olympiad is a school art program and an afterschool art program for students aged 8 to 12. ",
  path: '/programs/arts-olympiad',
};

export const ArtsOlympiad = () => {
  return (
    <>
      <Seo {...artsOlympiadMetadata} />
      <main className="content-gap mt-20">
        <section className="content-w m-pad flex flex-col gap-4 lg:items-center">
          <header className="content-w flex flex-col gap-2">
            <h1 className="font-montserrat text-primary text-3xl font-extrabold md:text-4xl lg:text-5xl">
              The Arts Olympiad
            </h1>
          </header>

          <div className="flex flex-col gap-6">
            <p className="font-openSans text-lg font-semibold leading-relaxed text-slate-800 md:text-xl">
              ICAF's Arts Olympiad is the largest in-school and after-school
              arts program of its kind. Established more than 25 years ago, the
              Arts Olympiad cultivates creativity for young students and
              participation is free.
            </p>
          </div>
          <div className="relative h-72 w-full overflow-hidden rounded-2xl shadow-md sm:h-80 md:h-[500px]">
            <Picture
              src={artsOlympiadHero}
              alt="Children participating in the Arts Olympiad"
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent" />
          </div>
          <p className="font-openSans text-base font-semibold leading-relaxed text-slate-600 md:text-lg">
            Selected young artists will represent their school districts or
            countries at the 7th World Children's Festival in July 2026 on the
            National Mall in Washington, D.C.
          </p>
        </section>

        <section className="content-w m-pad relative">
          <div className="relative grid gap-8 rounded-3xl bg-sky-50 px-6 py-8 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] md:px-10 md:py-10">
            <div className="flex items-start justify-center md:justify-start">
              <img
                src={ArtsOlympiadTorch}
                alt="7th Arts Olympiad emblem"
                className="h-40 w-40 object-contain sm:h-48 sm:w-48"
              />
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="font-montserrat text-primary text-2xl font-extrabold md:text-3xl">
                🎭 What is the Arts Olympiad?
              </h2>
              <p className="font-openSans text-base leading-relaxed text-slate-800 md:text-lg">
                A free global art program for students{' '}
                <span className="font-semibold">aged 8–12</span> that blends
                creativity with physical activity. Schools, studios, and
                homeschoolers can participate before{' '}
                <span className="font-semibold">March 20, 2026</span>. Winning
                artists will be invited to the 7th World Children's Festival in{' '}
                <span className="font-semibold">
                  July 25-27, 2026 on the National Mall
                </span>{' '}
                across from the U.S. Capitol.
              </p>
              <p className="font-openSans text-base font-semibold text-slate-700 md:text-lg">
                🛡 Officially recognized by the U.S. Olympic & Paralympic
                Committee.
              </p>
            </div>
          </div>
        </section>

        <section className="content-w m-pad grid gap-8 rounded-3xl bg-white px-6 py-8 shadow-sm md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:px-10 md:py-10">
          <div className="flex flex-col gap-5">
            <h2 className="font-montserrat text-primary text-2xl font-extrabold md:text-3xl">
              📚 How It Works
            </h2>
            <div className="font-openSans space-y-3 text-base leading-relaxed text-slate-800 md:text-lg">
              <p>
                Create a painting, drawing, or digital artwork of yourself as an
                Artist-Athlete playing a sport. Recommended size is 18 x 24
                inches (45 x 65 cm).
              </p>
              <p>
                Select the most original works, with a maximum of two entries
                per school.
              </p>
              <p>Submit your entry in one of the following ways:</p>
              <ul className="ml-6 list-disc space-y-1">
                <li>Mail physical artwork to ICAF.</li>
                <li>Email digital artwork to childart@ICAF.org.</li>
              </ul>
            </div>
            <div>
              <a
                href="/documents/7th Arts Olympiad Art Entry Form.pdf"
                download
                className="bg-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-[0.14em] text-[#FFD743]"
              >
                Download Entry Form
              </a>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-72 w-full max-w-md overflow-hidden rounded-2xl shadow-md sm:h-80 md:h-96">
              <Picture
                src={artsOlympiadColoring}
                alt="Child coloring during an Arts Olympiad activity"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="content-w m-pad grid gap-8 rounded-3xl bg-white px-6 py-8 shadow-sm md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:px-10 md:py-10">
          <div className="flex items-center justify-center">
            <div className="relative h-72 w-full max-w-md overflow-hidden rounded-2xl shadow-md sm:h-80 md:h-96">
              <Picture
                src={artsOlympiadPainting}
                alt="Student painting at the Arts Olympiad"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="font-montserrat text-primary text-2xl font-extrabold md:text-3xl">
              🏆 Why Participate?
            </h2>
            <ul className="font-openSans ml-4 list-disc space-y-3 text-base leading-relaxed text-slate-800 md:text-lg">
              <li>
                <span className="font-semibold">
                  Boost Creativity and Health:
                </span>{' '}
                Helps students overcome the fourth-grade slump in creativity by
                pairing imagination with physical activity.
              </li>
              <li>
                <span className="font-semibold">Foster Empathy:</span>{' '}
                Encourages understanding between artists and athletes,
                highlighting the value of both disciplines.
              </li>
              <li>
                <span className="font-semibold">Join a Global Community:</span>{' '}
                Become part of an international movement championing creative
                and empathetic young people.
              </li>
            </ul>
          </div>
        </section>

        <section className="content-w m-pad relative">
          <div className="relative grid gap-8 rounded-3xl bg-sky-50 px-6 py-8 md:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)] md:px-10 md:py-10">
            <div className="flex items-start justify-center md:justify-start">
              <img
                src={ArtsOlympiadTorch}
                alt="7th Arts Olympiad emblem"
                className="h-40 w-40 object-contain sm:h-48 sm:w-48"
              />
            </div>
            <div className="flex flex-col gap-5">
              <h2 className="font-montserrat text-primary text-2xl font-extrabold md:text-3xl">
                🎭 Lesson Plan Highlights
              </h2>
              <div className="font-openSans space-y-3 text-base leading-relaxed text-slate-800 md:text-lg">
                <p>
                  <span className="font-semibold">
                    Thinking Outside the Box:
                  </span>{' '}
                  Students swap roles so that artists draw sports gear while
                  athletes draw art tools. This playful exchange expands
                  perspectives on both art and sport.
                </p>
                <p>
                  <span className="font-semibold">
                    Building Peace with Art and Sports:
                  </span>{' '}
                  Inspired by Nelson Mandela's belief in sport's power to unite,
                  the lesson plan weaves creativity and physical activity into a
                  framework for understanding and peace.
                </p>
              </div>
              <div>
                <a
                  href="/documents/7th Arts Olympiad Lesson Plan January 2026.pdf"
                  download
                  className="bg-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-[0.14em] text-[#FFD743]"
                >
                  Download Lesson Plans
                </a>
              </div>
            </div>
          </div>
        </section>

        <ArtsOlympiadHelpfulLinks />
      </main>
      <PageBottomSpacer />
    </>
  );
};
