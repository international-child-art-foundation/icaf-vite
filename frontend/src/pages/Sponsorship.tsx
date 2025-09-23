import { SponsorshipHeader } from '@/components/sponsorship/SponsorshipHeader';
import { WhyPartner } from '@/components/sponsorship/WhyPartner';
import { SponsorImpact } from '@/components/sponsorship/SponsorImpact';
import { SponsorBrandCarousel } from '@/components/sponsorship/SponsorBrandCarousel';
import { BrandImpact } from '@/components/sponsorship/BrandImpact';
import { SponsorshipCTA } from '@/components/sponsorship/SponsorshipCTA';
import { PartnerTestimonialCarousel } from '@/components/sponsorship/PartnerTestimonialCarousel';

export const Sponsorship = () => {
  return (
    <div>
      <SponsorshipHeader />
      <div className="flex flex-col gap-16">
        <WhyPartner />
        <SponsorImpact />
        <SponsorBrandCarousel />
        <BrandImpact />
        <SponsorshipCTA />
        <PartnerTestimonialCarousel />
      </div>
    </div>
  );
};
