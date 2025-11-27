import { SponsorshipHeader } from '@/components/sponsorship/SponsorshipHeader';
import { WhyPartner } from '@/components/sponsorship/WhyPartner';
import { SponsorImpact } from '@/components/sponsorship/SponsorImpact';
import { SponsorBrandCarousel } from '@/components/sponsorship/SponsorBrandCarousel';
import { BrandImpact } from '@/components/sponsorship/BrandImpact';
import { SponsorshipCTA } from '@/components/sponsorship/SponsorshipCTA';
import { PartnerTestimonialCarousel } from '@/components/sponsorship/PartnerTestimonialCarousel';
import YourDonations from '@/components/shared/YourDonations';
import { Seo } from '@/components/shared/Seo';

const sponsorshipMetadata = {
  title: 'Sponsorship | ICAF',
  description:
    'Join ICAF in uplifting children’s creativity while strengthening your organization’s presence as a champion of young people',
  path: '/sponsorship',
};

export const Sponsorship = () => {
  return (
    <>
      <Seo {...sponsorshipMetadata} />
      <div>
        <SponsorshipHeader />
        <div className="flex flex-col gap-16">
          <WhyPartner />
          <SponsorImpact />
          <SponsorBrandCarousel />
          <BrandImpact />
          <SponsorshipCTA />
          <PartnerTestimonialCarousel />
          <YourDonations />
        </div>
      </div>
    </>
  );
};
