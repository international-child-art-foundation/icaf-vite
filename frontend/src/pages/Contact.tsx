import { ContactForm } from '@/components/contact/ContactForm';
import { contactFormConfigs } from '@/data/contact';
import { Seo } from '@/components/shared/Seo';

const contactMetadata = {
  title: 'Contact | ICAF',
  description: 'Get in touch with ICAF by sending us a message.',
  path: '/contact',
};

export const Contact = () => {
  return (
    <>
      <Seo {...contactMetadata} />
      <ContactForm config={contactFormConfigs['contact-us']} />
    </>
  );
};
