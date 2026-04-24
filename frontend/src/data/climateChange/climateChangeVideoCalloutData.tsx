import { IClimateChangeVideoCallout } from '@/types/ClimateChangeTypes';
import katrinaHealingArtsVideo from '@/assets/shared/media/ICAF Katrina Healing Arts program.mp4';
import savingEndangeredSpeciesVideo from '@/assets/shared/media/2014 ICAF Judges Saving Endangered Species Art Contest.mp4';
import katrinaHealingArtsThumb from '@/assets/climateChange/katrina-healing-arts-thumb.webp';
import savingEndangeredSpeciesThumb from '@/assets/climateChange/saving-endangered-species-thumb.webp';

export const ClimateChangeVideoCalloutData: IClimateChangeVideoCallout[] = [
  {
    title: 'Katrina Healing Arts Program',
    description: (
      <div className="flex flex-col gap-4">
        <span>
          The Katrina Healing Arts Program invited children who had lost homes,
          possessions, and even loved ones to express their experiences in
          swirling colors and jagged lines.{' '}
        </span>
        <span>
          Through doodled “Worries”, furious letters to a monstrous storm, and
          tender visions of sanctuaries real and imagined, the children slowly
          transformed raw anger and sorrow into beautiful stories they could
          see, touch, and share with the world.
        </span>
      </div>
    ),
    video: katrinaHealingArtsVideo,
    thumb: katrinaHealingArtsThumb,
    color: 'red',
    link: {
      href: "/documents/Katrina Healing Arts Program - A Schoolteacher's Perspective.pdf",
      text: 'Learn More',
    },
  },
  {
    title: 'Saving Endangered Species',
    description: (
      <div className="flex flex-col gap-4">
        <span>
          During the 2014 Saving Endangered Species Youth Art Contest, young
          artists were invited to study endangered species and translated their
          newfound understanding into luminous art for the world to see.
        </span>
      </div>
    ),
    video: savingEndangeredSpeciesVideo,
    thumb: savingEndangeredSpeciesThumb,
    color: 'yellow',
    link: {
      href: 'https://www.flickr.com/photos/50286147@N02/albums/72157643586814955/',
      text: 'View the Gallery',
    },
  },
];
