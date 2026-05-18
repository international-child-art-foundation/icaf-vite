import { ContactForm } from '@/modules/content/components/contact/ContactForm';
import { contactFormConfigs } from '@/shared/data/contact';
import { Seo } from '@/modules/content/components/shared/Seo';

const contactMetadata = {
  title: 'Contact | ICAF',
  description: 'Get in touch with ICAF by sending us a message.',
  path: '/contact',
};

export const Contact = () => {
  return (
    <div>
      <Seo {...contactMetadata} />
      <ContactForm config={contactFormConfigs['contact-us']} />
    </div>
  );
};
