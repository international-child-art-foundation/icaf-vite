import { useState } from 'react';
import img1 from '@/assets/arts-olympiad/submission-1.webp';
import img2 from '@/assets/arts-olympiad/submission-2.webp';
import img3 from '@/assets/arts-olympiad/_MG_8137.webp';
import img4 from '@/assets/arts-olympiad/submission-4.webp';

import { GuidelineCard } from '@/components/myFavoriteSport/MFSGuidelineCard';
import { gsap } from 'gsap';
import { Flip } from 'gsap/all';

gsap.registerPlugin(Flip);
const cardData = [
  {
    imgUrl: img1,
    className: 'border-[#F5AB35]',
    heading: 'Fee and Awards',
    description: [
      'The administrative fee to upload the artwork is US$3 but voters register for free.',
      "All 13 winners will be featured in the International Child Art Foundation's ChildArt Magazine and shall be awarded Exceptional Artistry Certificates. Their art will be exhibited at the National Mall during the 7th World Children's Festival.",
    ],
    gradientStrength: 0.4,
  },
  {
    imgUrl: img2,
    className: 'border-[#0286C3]',
    heading: 'How to Upload',
    description: [
      'Create an account with us, go to your dashboard and upload your work.',
    ],
    button: ['Learn more', 'https://www.myfavoritesport.org/register'],
    gradientStrength: 0.4,
  },
  {
    imgUrl: img3,
    className: 'border-[#168C39]',
    heading: 'Accepted Formats',
    description: [
      "All entries will be submitted digitally, but you're free to choose any format you'd like. Let your imagination take the lead on how to create your work.",
    ],
    button: ['Learn more', 'https://www.myfavoritesport.org/contest'],
    gradientStrength: 0.4,
  },
  {
    imgUrl: img4,
    className: 'border-[#EE2F4D]',
    heading: 'Share your Masterpiece',
    description: [
      'Everyone gets 1 vote. You can share your favorite piece through social media for more votes.',
    ],
    button: ['Learn more', 'https://www.myfavoritesport.org/faq'],
    gradientStrength: 0.4,
  },
];

export const MFSGuidelines = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleCardClick = (index: number) => {
    const currentActiveTextarea = document.querySelector(
      `.grid-card:nth-child(${activeIndex + 1}) .div-textholder`,
    ) as HTMLElement;
    const currentTextareaWidth = currentActiveTextarea
      ? currentActiveTextarea.clientWidth
      : 'auto';
    if (currentActiveTextarea) {
      currentActiveTextarea.style.width = `${currentTextareaWidth}px`;
    }

    setActiveIndex(index); // Update the active card index

    // Capture the state of all cards in the grid before making any changes
    const state = Flip.getState('.grid-card');

    // Apply the changes to reflect the new layout
    document.querySelectorAll('.grid-card').forEach((card, idx) => {
      if (idx === index) {
        // This card is the one that was clicked, expand it
        card.classList.add(
          'lg:col-span-3',
          'row-span-2',
          'lg:row-span-1',
          'cursor-auto',
        );
        card.classList.remove('col-span-1', 'row-span-1', 'cursor-pointer');
      } else {
        // Make sure other cards are in their default state
        card.classList.add('row-span-1', 'col-span-1', 'cursor-pointer');
        card.classList.remove(
          'lg:col-span-3',
          'row-span-2',
          'lg:row-span-1',
          'cursor-auto',
        );
      }
    });

    if (currentActiveTextarea) {
      currentActiveTextarea.addEventListener(
        'transitionend',
        () => {
          currentActiveTextarea.style.width = 'auto';
        },
        { once: true },
      );
    }
    const newActiveTextarea = document.querySelector(
      `.grid-card:nth-child(${index + 1}) .div-textholder`,
    ) as HTMLElement;
    if (newActiveTextarea) {
      newActiveTextarea.style.width = `${currentTextareaWidth}px`;
      newActiveTextarea.addEventListener(
        'transitionend',
        () => {
          // Once the transition is complete, set the width to auto
          newActiveTextarea.style.width = 'auto';
        },
        { once: true },
      );
    }

    Flip.from(state, {
      duration: 0.6,
      ease: 'power2.inOut',
      absolute: false,
      targets: '.grid-card',
      scale: false,
    });
  };

  return (
    <section
      aria-label="Submission guidelines."
      className="max-w-screen-3xl relative mb-16 mt-16 flex flex-col lg:mx-auto"
    >
      <p className="font-montserrat z-10 text-3xl font-semibold md:text-4xl">
        About the contest
      </p>
      <figure className="z-10 mt-8 grid h-[800px] w-full grid-cols-1 grid-rows-5 gap-6 rounded-[40px] lg:h-[367px] lg:grid-cols-6 lg:grid-rows-1">
        {cardData.map((card, index) => (
          <GuidelineCard
            key={card.heading}
            isActive={activeIndex === index}
            className={`grid-card ${card.className} ${
              activeIndex === index
                ? 'row-span-2 cursor-auto lg:col-span-3 lg:row-span-1'
                : 'col-span-1 row-span-1 cursor-pointer'
            }`}
            imgUrl={card.imgUrl}
            heading={card.heading}
            description={card.description}
            button={card.button}
            gradientStrength={card.gradientStrength}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </figure>
    </section>
  );
};
