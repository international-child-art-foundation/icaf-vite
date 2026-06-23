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
  title: 'Sponsor ICAF — Support Global Arts Education for Children',
  description:
    'Partner with ICAF to support arts education for children worldwide. Sponsorship opportunities connect your brand with a global mission of creativity and empathy.',
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
