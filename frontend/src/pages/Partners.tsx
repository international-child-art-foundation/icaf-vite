import { sharedOpenGraph } from '@/data/shared-metadata';
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
    INLogo
} from '../assets/shared/images/partners';
import '../index.css';
import PartnersCarousel from '@/components/partners/PartnersCarousel';


// add metadata
export const metadata = {
    title: 'Partners | ICAF',
    openGraph: {
        ...sharedOpenGraph,
        title: 'Partners | ICAF',
    },
};

const partners = [
    {
        id: 1,
        name: 'World Bank',
        logo: worldBankLogo,
        description: 'ICAF partners with the World Bank to promote arts education in developing countries.',
    },
    {
        id: 2,
        name: 'UNICEF',
        logo: unicefLogo,
        description: 'Together with UNICEF, ICAF has brought art programs to children in crisis situations around the world.',
    },
    {
        id: 3,
        name: 'American Institute of Architects',
        logo: aiaLogo,
        description: 'The American Institute of Architects partners with ICAF to introduce children to architectural design and urban planning.',
    },
    {
        id: 4,
        name: 'Endangered Species Coalition',
        logo: endangeredSpeciesLogo,
        description: 'ICAF judged the entries for the Endangered Species School Art Contest, helping raise awareness about endangered animals through art.',
    },
    {
        id: 5,
        name: 'INSEA',
        logo: INLogo,
        description: 'The International Society for Education through Art collaborates with ICAF on global art education initiatives.',
    },
    {
        id: 6,
        name: 'Arts + Mind Lab',
        logo: artsMindLogo,
        description: 'ICAF works with the Arts & Mind Lab to research the impact of arts on child development and empathy.',
    },
    {
        id: 7,
        name: 'NASBE',
        logo: NASBELogo,
        description: 'The National Association of State Boards of Education partners with ICAF to advocate for arts in education policy.',
    }
];


export default function Partners() {
    return (
        <div className="mx-auto box-border flex min-h-screen w-full max-w-screen-2xl flex-col px-0">
            <NavigationBar />
            <main className="flex-1">
                {/* First Section */}
                <div className="relative w-full">
                    <div className="grid grid-rows-1 grid-cols-1">
                        <div className="col-start-1 row-start-1">
                            <CurvedImage src={partnersBackgroundImage} darkened={true} />
                        </div>
                        <div className="col-start-1 row-start-1 relative z-10">
                            <div className="container px-8 md:px-12 lg:px-16 xl:px-20 mx-auto h-full flex items-center">
                                <div className="max-w-3xl">
                                    <h1 className="font-montserrat text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">Partners</h1>
                                    <h2 className="font-montserrat text-2xl md:text-3xl lg:text-4xl mb-6 font-light text-white">Inspiring the Next Generation Through Art</h2>
                                    <p className="font-sans text-lg md:text-xl mb-10 leading-relaxed max-w-2xl text-white">
                                        ICAF partners with organizations worldwide to nurture creativity and empathy in
                                        children. Our collaborations bring the power of art to young minds, making a
                                        global impact.
                                    </p>
                                    <div className="flex justify-start">
                                        <DonateButtonPartnersPage className="text-gray-900 border-0 shadow-lg hover:shadow-xl !w-auto !px-8" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Partnerships Section */}
                <section className="py-16">
                    <div className="px-8 md:px-12 lg:px-16 xl:px-20 max-w-screen-2xl mx-auto">
                        <h2 className="font-montserrat text-3xl md:text-4xl font-bold text-center mb-12">Our Global Partnerships</h2>
                        <p className="font-sans text-lg mb-12 leading-relaxed">
                            ICAF collaborates on occasion with a diverse range of partners across nearly 100 countries to inspire and empower children through art and creativity.
                            In the United States, we work closely with schools and after-school programs to reach young minds directly. Our partnerships play a vital role in our
                            mission to nurture creativity and empathy in children worldwide through the powers of art (and sports).
                        </p>

                        {/* Partners Carousel Component */}
                        <PartnersCarousel partners={partners} />
                    </div>
                </section>

                {/* Donation CTA Section */}
                <section className="py-16 relative">
                    <div className="px-8 md:px-12 lg:px-16 xl:px-20 max-w-screen-2xl mx-auto">
                        <div className="relative bg-blue-50 rounded-2xl p-6 sm:p-8 md:p-12">
                            <div className="flex flex-col">
                                <div className="max-w-2xl">
                                    <h2 className="font-montserrat text-lg sm:text-xl md:text-2xl font-bold mb-4">
                                        Your donation today will bring the arts to more children and help them become creative and empathic.
                                    </h2>
                                    <div className="flex space-x-2 sm:space-x-4 mt-6 md:mt-8">
                                        <DonateButtonPure className="text-sm sm:text-base w-32 sm:w-40" />
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-14 rounded-full border-2 border-blue-700 bg-blue-700 text-sm sm:text-base font-semibold text-white hover:bg-blue-800 hover:border-blue-800 transition-all duration-300 py-2 px-4 sm:px-6 md:px-8"
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
                            </div>
                        </div>
                        <div className="absolute top-6 right-8 sm:bottom-4 sm:right-4 sm:top-auto md:bottom-0 md:right-8 w-24 sm:w-32 md:w-48 lg:w-56">
                            <img src={fireworkImage}
                                alt="Colorful fireworks illustration"
                                className="w-full" />
                        </div>
                    </div>
                </section>
            </main>

        </div>
    );
}