import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';
import { SponsorshipHeader } from '@/modules/content/components/sponsorship/SponsorshipHeader';
import { WhyPartner } from '@/modules/content/components/sponsorship/WhyPartner';
import { SponsorImpact } from '@/modules/content/components/sponsorship/SponsorImpact';
import { SponsorBrandCarousel } from '@/modules/content/components/sponsorship/SponsorBrandCarousel';
import { BrandImpact } from '@/modules/content/components/sponsorship/BrandImpact';
import { SponsorshipCTA } from '@/modules/content/components/sponsorship/SponsorshipCTA';
import { PartnerTestimonialCarousel } from '@/modules/content/components/sponsorship/PartnerTestimonialCarousel';
import YourDonations from '@/modules/content/components/shared/YourDonations';
import { Seo } from '@/modules/content/components/shared/Seo';

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
      <div className="content-gap">
        <SponsorshipHeader />
        <WhyPartner />
        <SponsorImpact />
        <SponsorBrandCarousel />
        <BrandImpact />
        <SponsorshipCTA />
        <PartnerTestimonialCarousel />
        <YourDonations />
      </div>
      <PageBottomSpacer />
    </>
  );
};
