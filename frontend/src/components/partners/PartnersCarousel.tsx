import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Define partner type
interface Partner {
  id: number;
  name: string;
  logo: string;
  description: string;
}

interface PartnersCarouselProps {
  partners: Partner[];
}

const PartnersCarousel: React.FC<PartnersCarouselProps> = ({ partners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleLogos, setVisibleLogos] = useState<Partner[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const currentPartner = partners[currentIndex];
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Determine visible logo count and sliding behavior based on screen width - Fixed logic
  const updateVisibleLogos = () => {
    let visibleCount = 1;

    if (window.innerWidth >= 1536) { // Extra large screens
      visibleCount = 7;
    } else if (window.innerWidth >= 1280) { // Large screens
      visibleCount = 6;
    } else if (window.innerWidth >= 1024) { // Medium screens
      visibleCount = 5;
    } else if (window.innerWidth >= 768) { // Tablets
      visibleCount = 3;
    } else if (window.innerWidth >= 428) { // Mobile devices
      visibleCount = 2;
    }

    // Fix: Display from index 0 directly, not centered on currentIndex
    const startIndex = 0;
    const endIndex = Math.min(visibleCount, partners.length);

    // Update visible logos
    setVisibleLogos(partners.slice(startIndex, endIndex));
  };

  // Initialize and update on window resize
  useEffect(() => {
    updateVisibleLogos();

    const handleResize = () => {
      updateVisibleLogos();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [partners.length]); // Remove currentIndex dependency to avoid unnecessary recalculations

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex]);

  // Touch event handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Previous partner
  const handlePrevious = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? partners.length - 1 : prev - 1));

    // Reset state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Next partner
  const handleNext = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === partners.length - 1 ? 0 : prev + 1));

    // Reset state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Select specific partner
  const handleSelectPartner = (index: number) => {
    if (isAnimating || index === currentIndex) return;

    setIsAnimating(true);
    setCurrentIndex(index);

    // Reset state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Add animation effect to description when partner changes
  useEffect(() => {
    if (descriptionRef.current) {
      // Add fade-in animation
      descriptionRef.current.classList.add('opacity-0');
      setTimeout(() => {
        if (descriptionRef.current) {
          descriptionRef.current.classList.remove('opacity-0');
        }
      }, 50);
    }
  }, [currentIndex, currentPartner]);

  return (
    <div className="w-full py-8">
      {/* Partner carousel */}
      <section
        ref={carouselRef}
        className="relative mb-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Partner logos carousel"
      >
        {/* Logo container - Fixed sizing issues */}
        <div className="flex justify-center items-center px-16 md:px-20 py-8">
          <div className="flex items-center justify-center space-x-8 md:space-x-10 lg:space-x-12 transition-all duration-300">
            {visibleLogos.map((partner) => {
              const partnerIndex = partners.indexOf(partner);
              const isSelected = partnerIndex === currentIndex;

              return (
                <button
                  key={partner.id}
                  onClick={() => handleSelectPartner(partnerIndex)}
                  className={`relative group flex items-center justify-center focus:outline-none transition-all duration-300 ${isSelected
                    ? 'scale-110' // Selected state: enlarged
                    : 'hover:scale-105' // Non-selected state: hover effect
                    }`}
                  aria-label={`Select ${partner.name}`}
                  aria-pressed={isSelected}
                >
                  {/* Container - Use relative positioning for border placement */}
                  <div className="relative w-[120px] h-[120px]">
                    {/* Background container */}
                    <div className={`w-full h-full rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ${isSelected
                      ? 'opacity-100'
                      : 'opacity-40 hover:opacity-60'
                      } ${partner.name === 'INSEA' ? 'p-6' : 'p-2'
                      }`}>
                      {/* Logo image - Adjust style based on logo characteristics */}
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className={`rounded-full ${partner.name === 'INSEA'
                          ? 'w-[80px] h-[80px] object-contain' // INSEA logo uses object-contain to maintain integrity
                          : 'w-[100px] h-[100px] object-cover' // Other logos use object-cover to fill container
                          }`}
                      />
                    </div>

                    {/* Border when selected - Use absolute positioning to not affect content */}
                    {isSelected && (
                      <div className="absolute inset-0 rounded-full border-4 border-[#2057CC] pointer-events-none transition-all duration-300"></div>
                    )}
                  </div>


                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner description - Dynamic text area */}
      <div
        ref={descriptionRef}
        className="text-center mb-8 transition-opacity duration-300 min-h-[120px]"
        aria-live="polite"
      >
        <h3 className="font-montserrat text-xl md:text-2xl lg:text-3xl font-bold mb-4 transition-all duration-300">
          {currentPartner.name}
        </h3>
        <p className="font-sans max-w-3xl mx-auto text-sm md:text-base lg:text-lg transition-all duration-300">
          {currentPartner.description}
        </p>
      </div>

      {/* Dot navigation and arrows - Grouped together */}
      <div className="flex justify-center items-center space-x-2">
        {/* Left arrow */}
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          aria-label="Previous partner"
          disabled={isAnimating}
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>

        {/* Dots */}
        {partners.map((partner) => (
          <button
            key={`dot-${partner.id}`}
            onClick={() => handleSelectPartner(partners.indexOf(partner))}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${partners.indexOf(partner) === currentIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
              }`}
            aria-label={`Go to partner ${partners.indexOf(partner) + 1}`}
            aria-current={partners.indexOf(partner) === currentIndex ? 'true' : 'false'}
          />
        ))}

        {/* Right arrow */}
        <button
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          aria-label="Next partner"
          disabled={isAnimating}
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default PartnersCarousel;