// import { sharedOpenGraph } from '@/data/shared-metadata';
import NavigationBar from '@/components/shared/NavigationBar';
import { Button } from '@/components/ui/button';
import DonateButtonPure from '@/components/ui/donateButtonPure';
import DonateButtonPartnersPage from '@/components/ui/donateButtonPartnersPage';
import { CurvedImage } from '@/pages/CurvedImage';
import {
  fireworkImage,
  partnersBackgroundImage,
  worldBankLogo,
  unicefLogo,
  aiaLogo,
  NASBELogo,
  endangeredSpeciesLogo,
  artsMindLogo,
  INLogo,
  NIHLogo,
  NEALogo,
  pentagonLogo,
  qatarFoundationLogo,
  UNESCOLogo,
  WHOLogo,
  XRSILogo,
} from '../assets/shared/images/partners';
import '../index.css';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { type CarouselApi } from '@/components/ui/carousel';
import { IPartners } from 'types/partners';
import { PartnerItem } from '@/components/partners/PartnerItem';
import { useState, useEffect } from 'react';
import { CarouselSharedContent } from '@/components/partners/CarouselSharedContent';

// add metadata
// export const metadata = {
//   title: 'Partners | ICAF',
//   openGraph: {
//     ...sharedOpenGraph,
//     title: 'Partners | ICAF',
//   },
// };

const partners: IPartners = [
  {
    id: 1,
    name: 'World Bank',
    logo: worldBankLogo,
    description:
      'Collaborating on the "Destruction, Reconstruction, and Prevention" program, focusing on rebuilding communities through creativity after natural disasters.',
  },
  {
    id: 2,
    name: 'United Nations',
    logo: unicefLogo,
    description:
      "Hosted children's art exhibition at UN headquarters and served as a judge for the selection of the design for the Permanent Memorial to Honour the Victims of Slavery and the Transatlantic Slave Trade.",
  },
  {
    id: 3,
    name: 'American Institute of Architects (AIA)',
    logo: aiaLogo,
    description:
      'Collaborating on ChildArt magazine to inspire the next generation of architects.',
  },
  {
    id: 4,
    name: 'Endangered Species Coalition',
    logo: endangeredSpeciesLogo,
    description:
      'ICAF judged the entries for the Endangered Species School Art Contest, helping raise awareness about endangered animals through art.',
  },
  {
    id: 5,
    name: 'International Arts + Mind Lab',
    logo: artsMindLogo,
    description:
      'Collaborated to inform young readers about neuroscientific findings and neuroaesthetics through a special issue of ChildArt magazine.',
  },
  {
    id: 6,
    name: 'NASBE',
    logo: NASBELogo,
    description:
      'Contributing to the State Education Standard to enhance art education policies.',
  },
  {
    id: 7,
    name: 'NIH',
    logo: NIHLogo,
    description:
      'Partnered to promote the groundbreaking findings from the ABCD Study through a special issue of ChildArt magazine.',
  },
  {
    id: 8,
    name: 'NEA',
    logo: NEALogo,
    description:
      'Received financial support and partnered on the "Art for Health" initiative during COVID-19.',
  },
  {
    id: 9,
    name: 'Pentagon',
    logo: pentagonLogo,
    description:
      'Invited to present on Peace through Art, contributed to the design of the "Hall of Heroes," and collaborated on DMV area military families\' participation in the World Children\'s Festival as host families for foreign delegates.',
  },
  {
    id: 10,
    name: 'Qatar Foundation',
    logo: qatarFoundationLogo,
    description:
      "Cohosted Qatar Foundation's very first educational symposium on Innovations in Education—Regional Symposium on Arts Learning, Science and Educational Technology.",
  },
  {
    id: 11,
    name: 'UNESCO',
    logo: UNESCOLogo,
    description:
      "Participated in the World Conference on Arts Education, contributed ICAF research to the UNESCO Observatory, and provided art for UNESCO's cards and calendars.",
  },
  {
    id: 12,
    name: 'WHO',
    logo: WHOLogo,
    description:
      'Worked together to expand awareness of mental health in childhood and adolescence, using art as a powerful tool for expression and healing.',
  },
  {
    id: 13,
    name: 'XRSI',
    logo: XRSILogo,
    description:
      "Collaborating on a youth panel's inclusion in conferences on Metaverse.",
  },
  {
    id: 14,
    name: 'InSEA',
    logo: INLogo,
    description:
      'Delivered a keynote address at the World Congress and received an award for outstanding contributions to arts education.',
  },
];

export default function Partners() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentPartner, setCurrentPartner] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    setCurrentPartner(carouselApi.selectedScrollSnap());

    carouselApi.on('select', () => {
      setCurrentPartner(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  const scrollToPartner = (index: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  };

  return (
    <div className="mx-auto box-border flex min-h-screen w-full max-w-screen-2xl flex-col px-0">
      <NavigationBar />
      <main className="flex-1">
        {/* First Section */}
        <div className="relative w-full">
          <div className="grid grid-cols-1 grid-rows-1">
            <div className="col-start-1 row-start-1">
              <CurvedImage src={partnersBackgroundImage} darkened={true} />
            </div>
            <div className="relative z-10 col-start-1 row-start-1">
              <div className="container mx-auto flex h-full items-start px-8 pt-20 md:items-center md:px-12 md:pt-0 lg:px-16 xl:px-20">
                <div className="max-w-3xl">
                  <h1 className="font-montserrat mb-3 text-4xl font-bold text-white md:mb-4 md:text-5xl lg:mb-6 lg:text-6xl xl:text-7xl">
                    Partners
                  </h1>
                  <h2 className="font-montserrat mb-3 text-xl font-light text-white md:mb-4 md:text-2xl lg:mb-6 lg:text-3xl xl:text-4xl">
                    Inspiring the Next Generation Through Art
                  </h2>
                  <p className="mb-4 max-w-2xl font-sans text-base leading-relaxed text-white md:mb-6 md:text-lg lg:mb-10 lg:text-xl">
                    ICAF partners with organizations worldwide to nurture
                    creativity and empathy in children. Our collaborations bring
                    the power of art to young minds, making a global impact.
                  </p>
                  <div className="mb-6 flex justify-start sm:mb-8 md:mb-12 lg:mb-16">
                    <DonateButtonPartnersPage className="!w-auto border-0 !px-8 text-gray-900 shadow-lg hover:shadow-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Partnerships Section */}
        <section className="py-16">
          <div className="mx-auto max-w-screen-2xl px-8 md:px-12 lg:px-16 xl:px-20">
            <h2 className="font-montserrat mb-12 text-center text-3xl font-bold md:text-4xl">
              Our Global Partnerships
            </h2>
            <p className="mb-12 font-sans text-lg leading-relaxed">
              ICAF collaborates on occasion with a diverse range of partners
              across nearly 100 countries to inspire and empower children
              through art and creativity. In the United States, we work closely
              with schools and after-school programs to reach young minds
              directly. Our partnerships play a vital role in our mission to
              nurture creativity and empathy in children worldwide through the
              powers of art (and sports).
            </p>

            {/* Partners Carousel Component */}
            <Carousel setApi={setCarouselApi} opts={{ loop: true }}>
              <CarouselContent>
                {partners.map((partner, index) => {
                  return (
                    <CarouselItem
                      className="basis-2/3 md:basis-1/2 lg:basis-1/4"
                      key={partner.name}
                    >
                      <PartnerItem
                        partner={partner}
                        index={index}
                        activeCarouselIndex={currentPartner}
                        carouselLength={partners.length}
                        scrollToPartner={scrollToPartner}
                      />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselSharedContent
                partners={partners}
                activeIndex={currentPartner}
                scrollToPartner={scrollToPartner}
              />
            </Carousel>
          </div>
        </section>

        {/* Donation CTA Section */}
        <section className="relative mx-2 my-8 max-w-screen-2xl rounded-xl bg-blue-50 p-8 py-8 md:mx-4 md:p-8 lg:mx-6 lg:p-12 xl:p-16">
          <div className="flex flex-col">
            <div className="max-w-2xl">
              <h2 className="font-montserrat mb-4 text-lg font-bold sm:text-xl md:text-2xl">
                Your donation today will bring the arts to more children and
                help them become creative and empathic.
              </h2>
              <div className="mt-6 flex space-x-2 sm:space-x-4 md:mt-8">
                <DonateButtonPure className="w-32 text-sm sm:w-40 sm:text-base" />
                <Button
                  asChild
                  variant="outline"
                  className="h-14 rounded-full border-2 border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:border-blue-800 hover:bg-blue-800 sm:px-6 sm:text-base md:px-8"
                >
                  <a
                    href="https://icaf.org/about/contact-us"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Contact Us
                  </a>
                </Button>
              </div>
            </div>
            <div className="absolute right-8 top-6 w-24 sm:bottom-4 sm:right-4 sm:top-auto sm:w-32 md:bottom-0 md:right-8 md:w-48 lg:w-56">
              <img
                src={fireworkImage}
                alt="Colorful fireworks illustration"
                className="w-full"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
