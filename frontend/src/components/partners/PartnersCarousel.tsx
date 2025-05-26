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
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const currentPartner = partners[currentIndex];
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Determine visible logo count and sliding behavior based on screen width
  const updateVisibleLogos = () => {
    let visibleCount = 1;
    let startIndex = currentIndex;

    if (window.innerWidth >= 1536) { // Extra large screens
      visibleCount = 7;
    } else if (window.innerWidth >= 1280) { // Large screens
      visibleCount = 6;
    } else if (window.innerWidth >= 1024) { // Medium screens
      visibleCount = 5;
    } else if (window.innerWidth >= 768) { // Tablets
      visibleCount = 3;
    } else { // Mobile devices - show 3 (1 full + 2 partial)
      visibleCount = 3;
    }

    // Calculate start index to keep selected item visible and centered
    const halfVisible = Math.floor(visibleCount / 2);
    if (currentIndex >= partners.length - halfVisible) {
      startIndex = partners.length - visibleCount;
    } else if (currentIndex > halfVisible) {
      startIndex = currentIndex - halfVisible;
    } else {
      startIndex = 0;
    }

    startIndex = Math.max(0, Math.min(startIndex, partners.length - visibleCount));
    const endIndex = Math.min(startIndex + visibleCount, partners.length);
    setVisibleLogos(partners.slice(startIndex, endIndex));

    // Calculate translateX to center the selected item
    const isMobile = window.innerWidth < 768;
    const itemWidth = isMobile ? 140 : 180; // Smaller width for mobile
    const offset = currentIndex - startIndex;
    const containerWidth = carouselRef.current?.clientWidth || 0;
    const totalItemsWidth = visibleCount * itemWidth;

    let newTranslateX;
    if (isMobile) {
      // On mobile, show more of the side items
      const centerOffset = (containerWidth - itemWidth) / 2;
      newTranslateX = centerOffset - (offset * itemWidth) + 70; // Increased offset to show more of side items
    } else {
      // Desktop view remains the same
      const centerOffset = (containerWidth - itemWidth) / 2;
      newTranslateX = centerOffset - (offset * itemWidth);
    }

    // Prevent overscrolling with adjusted boundaries for mobile
    const minTranslate = containerWidth - totalItemsWidth - (isMobile ? 40 : 60);
    const maxTranslate = isMobile ? 40 : 60;
    newTranslateX = Math.min(maxTranslate, Math.max(minTranslate, newTranslateX));

    setTranslateX(newTranslateX);
  };

  // Initialize and update on window resize or currentIndex change
  useEffect(() => {
    updateVisibleLogos();
    const handleResize = () => {
      updateVisibleLogos();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentIndex, partners.length]);

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

  // Handle navigation
  const handleNext = () => {
    setIsTransitioning(true);
    const nextIndex = currentIndex === partners.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    const prevIndex = currentIndex === 0 ? partners.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleSelectPartner = (index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // Add animation effect to description when partner changes
  useEffect(() => {
    if (descriptionRef.current) {
      descriptionRef.current.classList.add('opacity-0');
      setTimeout(() => {
        if (descriptionRef.current) {
          descriptionRef.current.classList.remove('opacity-0');
        }
      }, 50);
    }
  }, [currentIndex, currentPartner]);

  return (
    <div className="w-full">
      <section className="relative">
        <div className="relative overflow-hidden">
          <div
            ref={carouselRef}
            className="flex items-center justify-center space-x-8 md:space-x-10 lg:space-x-12 transition-transform duration-300"
            style={{
              transform: `translateX(${translateX}px)`,
            }}
          >
            {visibleLogos.map((partner, index) => {
              const isSelected = partner === partners[currentIndex];
              return (
                <button
                  key={partner.id}
                  onClick={() => handleSelectPartner(partners.indexOf(partner))}
                  className={`relative group flex items-center justify-center focus:outline-none transition-all duration-300 p-2 ${isSelected
                    ? 'scale-110' // Selected state: enlarged
                    : 'hover:scale-105' // Non-selected state: hover effect
                    }`}
                  aria-label={`Select ${partner.name}`}
                  aria-pressed={isSelected}
                >
                  {/* Container with padding to accommodate the border */}
                  <div className="relative w-[100px] h-[100px] md:w-[140px] md:h-[140px]">
                    {/* Border when selected - positioned behind the white circle */}
                    {isSelected && (
                      <div className="absolute inset-0 rounded-full border-4 border-[#2057CC] pointer-events-none transition-all duration-300"></div>
                    )}

                    {/* Background container */}
                    <div
                      className={`absolute inset-[4px] rounded-full bg-white shadow-md flex items-center justify-center transition-all duration-300 ${isSelected
                        ? 'opacity-100'
                        : 'opacity-40 hover:opacity-60'
                        }`}
                    >
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className={`rounded-full ${partner.name === 'INSEA'
                          ? 'w-[85px] h-[55px] md:w-[115px] md:h-[75px]'
                          : 'w-[80px] h-[80px] md:w-[110px] md:h-[110px]'
                          } object-cover`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

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

      <div className="flex justify-center items-center space-x-2">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          aria-label="Previous partner"
        >
          <ChevronLeft className="h-5 w-5 text-gray-700" />
        </button>

        {partners.map((partner) => (
          <button
            key={`dot-${partner.id}`}
            onClick={() => handleSelectPartner(partners.indexOf(partner))}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${partners.indexOf(partner) === currentIndex
              ? 'bg-blue-500'
              : 'bg-gray-300 hover:bg-gray-400'
              }`}
            aria-label={`Go to partner ${partners.indexOf(partner) + 1}`}
            aria-current={partners.indexOf(partner) === currentIndex ? 'true' : 'false'}
          />
        ))}

        <button
          onClick={handleNext}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          aria-label="Next partner"
        >
          <ChevronRight className="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default PartnersCarousel;