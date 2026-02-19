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
    <div className="mx-auto max-w-screen-2xl">
      <Seo {...contactMetadata} />
      <ContactForm config={contactFormConfigs['contact-us']} />
    </div>
  );
};
