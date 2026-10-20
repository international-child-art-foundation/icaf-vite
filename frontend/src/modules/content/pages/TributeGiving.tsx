import { Link } from 'react-router-dom';
import { ContactForm } from '@/modules/content/components/contact/ContactForm';
import { Seo } from '@/modules/content/components/shared/Seo';
import { tributeFormConfigs } from '@/modules/content/data/tributeGiving';
import type { TributeFormId } from '@/modules/content/types/Contact';
import { Button } from '@/shared/components/ui/button';
import artLove1 from '@/modules/content/assets/tributeGiving/art-love1.png';
import artLove2 from '@/modules/content/assets/tributeGiving/art-love2.png';
import inLovingMemory from '@/modules/content/assets/tributeGiving/in-loving-memory.png';

export default function TributeGiving({ kind }: { kind: TributeFormId }) {
  const isMemorial = kind === 'in-loving-memory';
  const title = isMemorial ? 'In Loving Memory' : 'Art Lovers';

  return (
    <>
      <Seo
        title={`${title} | ICAF`}
        description={
          isMemorial
            ? 'Remember someone special with a donation supporting ICAF’s art programs for children.'
            : 'Honor an art lover on a birthday, wedding or any celebration while supporting ICAF’s art programs for children.'
        }
        path={`/get-involved/${kind}`}
      />
      <div className="py-12 md:py-16">
        <div className="breakout-w m-pad">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-montserrat text-4xl font-semibold md:text-5xl">
              {title}
            </h1>
            {isMemorial ? (
              <blockquote className="mt-8 text-2xl leading-relaxed text-primary md:text-3xl">
                <p>“Unable are the loved to die. For love is immortality.”</p>
                <cite className="mt-3 block text-xl not-italic">
                  – Emily Dickinson
                </cite>
              </blockquote>
            ) : (
              <p className="mt-8 text-2xl leading-relaxed text-primary md:text-3xl">
                For a birthday, wedding or any celebration, your donation will
                support our art programs for underprivileged children.
              </p>
            )}
          </div>

          {isMemorial ? (
            <figure className="mx-auto mt-10 max-w-[762px]">
              <img
                src={inLovingMemory}
                alt="Painting of figures reaching toward a white bird above a blue sea"
                width={762}
                height={564}
                className="h-auto w-full rounded-xl"
              />
              <figcaption className="mt-4 text-center text-lg text-slate-600">
                Linda Kholobekian, age 11, Nigeria
              </figcaption>
            </figure>
          ) : (
            <div className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-2 md:gap-10">
              <img
                src={artLove1}
                alt="A child drawing on a shared outdoor canvas"
                width={505}
                height={284}
                className="h-auto w-full rounded-xl"
              />
              <img
                src={artLove2}
                alt="Children painting colorful birds and animals together"
                width={505}
                height={284}
                className="h-auto w-full rounded-xl"
              />
            </div>
          )}

          <div className="mx-auto mt-10 max-w-2xl text-center">
            <p className="text-xl leading-relaxed">
              {isMemorial
                ? 'Contribute in loving memory of someone special and support our work that creates joy and restores hope for children.'
                : 'Honor an art lover and help create joy and restore hope for children.'}
            </p>
            <p className="mt-4 text-lg text-slate-700">
              Use the form below to share your message and the recipient’s
              details with ICAF. You can make your donation through our
              donation page.
            </p>
            <Button asChild className="mt-6 rounded-full px-8 py-6 text-base">
              <Link to="/donate" target="_blank" rel="noopener noreferrer">
                Make your donation
                <span className="sr-only"> (opens in a new tab)</span>
              </Link>
            </Button>
          </div>
        </div>

        <ContactForm
          key={kind}
          config={tributeFormConfigs[kind]}
          headingLevel="h2"
        />

        <p className="breakout-w m-pad text-center text-lg">
          {isMemorial ? (
            <>
              For a birthday, wedding or another celebration,{' '}
              <Link
                to="/get-involved/art-lovers"
                className="font-semibold text-primary underline underline-offset-4"
              >
                honor an Art Lover
              </Link>.
            </>
          ) : (
            <>
              You can also contribute in{' '}
              <Link
                to="/get-involved/in-loving-memory"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Loving Memory
              </Link>{' '}
              of someone special.
            </>
          )}
        </p>
      </div>
    </>
  );
}
