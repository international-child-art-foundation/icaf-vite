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
  // Set initial index to middle of the array
  const [currentIndex, setCurrentIndex] = useState(Math.floor(partners.length / 2));
  const [visibleLogos, setVisibleLogos] = useState<Partner[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const currentPartner = partners[currentIndex];
  const descriptionRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  // Calculate how many items should be visible
  const getVisibleCount = () => {
    if (window.innerWidth >= 1536) return 7;      // 2xl
    if (window.innerWidth >= 1280) return 6;      // xl
    if (window.innerWidth >= 1024) return 5;      // lg
    if (window.innerWidth >= 768) return 3;       // md
    return 3;                                     // Mobile
  };

  const calculateCenterOffset = (selectedPos: number) => {
    const isMobile = window.innerWidth < 768;
    const itemWidth = isMobile ? 140 : 180;
    const spacing = isMobile ? 32 : 40;
    const containerWidth = carouselRef.current?.parentElement?.clientWidth || 0;

    const totalItemWidth = itemWidth + spacing;
    const containerCenter = containerWidth / 2;
    return containerCenter - (totalItemWidth * selectedPos) - (itemWidth / 2);
  };

  const updateVisibleLogos = () => {
    const visibleCount = getVisibleCount();
    const itemsToShow = visibleCount + 4;
    const halfVisible = Math.floor(itemsToShow / 2);

    // Calculate which items should be visible
    const visibleItems: Partner[] = [];
    for (let i = -halfVisible; i < itemsToShow - halfVisible; i++) {
      // Calculate the true index using modulo arithmetic
      const trueIndex = ((currentIndex + i) % partners.length + partners.length) % partners.length;
      visibleItems.push(partners[trueIndex]);
    }

    setVisibleLogos(visibleItems);

    // Calculate the position to center the current item
    const isMobile = window.innerWidth < 768;
    const itemWidth = isMobile ? 140 : 180;
    const spacing = isMobile ? 32 : 40;
    const totalItemWidth = itemWidth + spacing;

    // Calculate container width and center position
    const containerWidth = carouselRef.current?.parentElement?.clientWidth || 0;
    const centerPosition = (containerWidth - itemWidth) / 2;

    // Calculate the offset needed to center the current item
    const itemsBeforeCenter = halfVisible;
    const offset = centerPosition - (itemsBeforeCenter * totalItemWidth);

    setTranslateX(offset);
  };

  const handleSelectPartner = (index: number) => {
    if (!isTransitioning) {
      setIsTransitioning(true);

      // Normalize the index to ensure it's within bounds
      const normalizedIndex = ((index % partners.length) + partners.length) % partners.length;

      // Update the current index
      setCurrentIndex(normalizedIndex);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleNext = () => {
    if (!isTransitioning) {
      handleSelectPartner((currentIndex + 1) % partners.length);
    }
  };

  const handlePrevious = () => {
    if (!isTransitioning) {
      handleSelectPartner((currentIndex - 1 + partners.length) % partners.length);
    }
  };

  // Initialize carousel
  useEffect(() => {
    const initializeCarousel = () => {
      if (carouselRef.current && !initialized) {
        const newTranslateX = calculateCenterOffset(Math.floor(getVisibleCount() / 2));
        setTranslateX(newTranslateX);
        setInitialized(true);
        updateVisibleLogos();
      }
    };

    // Try to initialize immediately
    initializeCarousel();

    // Also try after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(initializeCarousel, 100);

    return () => clearTimeout(timeoutId);
  }, [carouselRef.current]);

  // Handle window resize and currentIndex changes
  useEffect(() => {
    if (!initialized) return;

    const handleResize = () => {
      if (!isTransitioning) {
        const newTranslateX = calculateCenterOffset(Math.floor(getVisibleCount() / 2));
        setTranslateX(newTranslateX);
        updateVisibleLogos();
      }
    };

    window.addEventListener('resize', handleResize);

    // Update visible logos when currentIndex changes
    if (!isTransitioning) {
      updateVisibleLogos();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentIndex, isTransitioning, initialized]);

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

  // Handle touch events for swipe
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
          {/* Container with fixed width and center alignment */}
          <div className="mx-auto relative" style={{ width: '100%' }}>
            <div
              ref={carouselRef}
              className="flex items-center space-x-4 md:space-x-6 lg:space-x-8 transition-transform duration-300"
              style={{
                transform: `translateX(${translateX}px)`,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {visibleLogos.map((partner, index) => {
                const centerIndex = Math.floor(visibleLogos.length / 2);
                const isSelected = index === centerIndex;

                return (
                  <button
                    key={`${partner.id}-${index}`}
                    onClick={() => handleSelectPartner(partner.id - 1)}
                    className={`relative group flex items-center justify-center focus:outline-none transition-all duration-300 p-2 ${isSelected ? 'scale-110' : 'hover:scale-105'
                      }`}
                    style={{
                      width: window.innerWidth < 768 ? '140px' : '180px',
                      flexShrink: 0
                    }}
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
            onClick={() => handleSelectPartner(partners.indexOf(partner) + 1)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors duration-300 ${partners.indexOf(partner) + 1 === currentIndex
              ? 'bg-blue-500'
              : 'bg-gray-300 hover:bg-gray-400'
              }`}
            aria-label={`Go to partner ${partners.indexOf(partner) + 1}`}
            aria-current={partners.indexOf(partner) + 1 === currentIndex ? 'true' : 'false'}
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