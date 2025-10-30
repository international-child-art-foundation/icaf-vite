import ChildArtAishling from '@/assets/donate/ChildArt-Aishling.png';
import ChildArtCarsonBeyl from '@/assets/donate/ChildArt-Carson Beyl.png';
import ChildArtJonathan from '@/assets/donate/ChildArt-Jonathan.png';
import ChildArtKristina from '@/assets/donate/ChildArt-Kristina.png';
import ChildArtMalta from '@/assets/donate/ChildArt-Malta.png';
import ChildArtVirginia from '@/assets/donate/ChildArt-Virginia(EstherKim).png';

export interface ChildArtwork {
    id: string;
    image: string;
    artistName: string;
    age: number;
    location: string;
    alt: string;
}

export const childArtExhibition: ChildArtwork[] = [
    {
        id: 'esther-kim',
        image: ChildArtVirginia,
        artistName: 'Esther Kim',
        age: 11,
        location: 'Virginia',
        alt: 'A vibrant painting of a female tennis player in a blue top and black skirt, mid-swing with a racket on a green court. Behind her is a large, colorful crowd of spectators.'
    },
    {
        id: 'carson-beyl',
        image: ChildArtCarsonBeyl,
        artistName: 'Carson Beyl',
        age: 8,
        location: 'Pennsylvania',
        alt: 'A whimsical watercolor painting of a blonde-haired person in a blue suit and red bow tie, sitting at a desk with a microphone. The background features red and blue stripes and stars.'
    },
    {
        id: 'kristina-gechevska',
        image: ChildArtKristina,
        artistName: 'Kristina Gechevska',
        age: 11,
        location: 'Bulgaria',
        alt: 'A dynamic painting depicting three cyclists in red, yellow, and green jerseys, riding bicycles with large, brightly colored, overlapping circular wheels. The background is a dark blue sky with white speckles.'
    },
    {
        id: 'aishling-kelly',
        image: ChildArtAishling,
        artistName: 'Aishling Kelly',
        age: 11,
        location: 'Arizona',
        alt: 'An abstract or impressionistic painting with a sepia or golden-brown tone. It features several stylized human figures in various acrobatic or dance poses, surrounded by and interacting with large, overlapping circular shapes.'
    },
    {
        id: 'michael-lanfranco',
        image: ChildArtMalta,
        artistName: 'Michael Lanfranco',
        age: 12,
        location: 'Malta',
        alt: 'A watercolor painting depicting a tall, dark grey skyscraper on the right, with smaller buildings to its left. A grey flying saucer (UFO) is visible in the sky above the smaller buildings. A person\'s head and shoulders are visible in the lower-middle part of the image.'
    },
    {
        id: 'jonathan-stearns',
        image: ChildArtJonathan,
        artistName: 'Jonathan Stearns',
        age: 12,
        location: 'California',
        alt: 'A painting with a dramatic sky in shades of orange, red, and purple. In the foreground, there\'s a dark, stylized cityscape with a large, gnarled tree extending from the bottom right, intertwining with the buildings.'
    }
];
