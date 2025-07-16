import { CurvedImage } from './CurvedImage';
import MalaysiaChildren from '@/assets/donate/MalaysiaChildren.png';
import TransparencyLogo from '@/assets/donate/TransparencyLogo.png';
import { Button } from '@/components/ui/button';
import { HeartIcon } from 'lucide-react';

export default function Donate() {
  return (
    <div className="relative w-full">
      {/* Header */}
      <div className="grid h-[550px] grid-cols-1 grid-rows-1">
        <div className="col-start-1 row-start-1">
          <CurvedImage
            src={MalaysiaChildren}
            curveStyle={'Ellipse'}
            darkened={true}
            gradientDefinition={'bg-gradient-to-b from-black/70 to-black/0'}
            objectFit="cover"
            objectPosition="center center"
            scale={1}
          />
        </div>

        {/* Text Overlay */}
        <div className="z-20 col-start-1 row-start-1 flex justify-between items-center px-8 md:px-8 lg:px-20">
          {/* Left Side - Text Content */}
          <div className="w-full md:w-1/2">
            <div className="mb-8">
              <h1 className="mb-2 text-5xl font-bold text-white md:text-6xl lg:text-7xl text-left">
                Art Changes Lives,
              </h1>
              <h2 className="text-4xl font-bold text-secondary-yellow md:text-5xl lg:text-6xl text-left">
                You Can Too.
              </h2>
            </div>
            <p className="text-base text-white md:text-lg lg:text-xl text-left mb-6">
              Your gift funds art programs for underserved schools, spotlights young artists at the World Children's Festival, and delivers creativity without ads through ChildArt Magazine. Empower children to create their future—donate today!
            </p>
            {/* Transparency Logo */}
            
              <img
                src={TransparencyLogo}
                alt="Transparent Logo"
                className="h-8 w-auto md:h-10"
              />
            
          </div>

          {/* Right Side - Donation Form */}
          <div className="hidden md:block w-full md:w-1/2 md:pl-8 lg:pl-20 md:pr-8 lg:pr-20">
            <div className="max-w-md">
              {/* Donation Link */}
              <div className="mb-6">
                <a href="#" className="text-white text-sm hover:text-secondary-yellow flex items-center gap-2">
                  <span>Donate via Every.org using card, Apple Pay & more</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>

              {/* Preset Amount Buttons */}
              <div className="mb-6">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button className="px-3 py-2 text-sm border border-white/30 rounded text-white hover:bg-white/10 transition-colors">
                    $200
                  </button>
                  <button className="px-3 py-2 text-sm border border-white/30 rounded text-white hover:bg-white/10 transition-colors">
                    $100
                  </button>
                  <button className="px-3 py-2 text-sm border border-secondary-blue rounded bg-secondary-blue/20 text-white">
                    $50
                  </button>
                  <button className="px-3 py-2 text-sm border border-white/30 rounded text-white hover:bg-white/10 transition-colors">
                    Other
                  </button>
                </div>

                {/* Amount Input and Frequency */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="$50"
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/30 rounded text-white placeholder-white/70"
                    readOnly
                  />
                  <select className="px-3 py-2 bg-white/10 border border-white/30 rounded text-white">
                    <option>One-time</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
                </div>
              </div>

              {/* Donate Button */}
              <button className="w-full bg-secondary-yellow text-black font-bold py-4 px-6 rounded-lg mb-4 hover:bg-secondary-yellow/90 transition-colors flex items-center justify-center gap-2">
                <HeartIcon className="w-5 h-5" />
                DONATE IN 60 SECONDS
              </button>

              {/* Tax ID */}
              <p className="text-white text-xs text-center mb-6">
                International Child Art Foundation's Tax ID (EIN) 52-2032649
              </p>

              {/* Other Donation Methods */}
              <div className="text-center">
                <div className="border-t border-white/30 mb-4"></div>
                <h4 className="text-white text-sm font-semibold mb-4">Other Donation Methods</h4>
                <div className="flex justify-center gap-6">
                  <a href="#" className="text-white text-xs hover:text-secondary-yellow">Network for Good</a>
                  <a href="#" className="text-white text-xs hover:text-secondary-yellow">JustGiving</a>
                  <a href="#" className="text-white text-xs hover:text-secondary-yellow">Send a Check</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
