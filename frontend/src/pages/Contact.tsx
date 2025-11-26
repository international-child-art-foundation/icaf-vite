// components/contact/Contact.tsx
import { ContactForm } from '@/components/contact/ContactForm';
import { contactFormConfigs } from '@/data/contact';

export const Contact = () => {
  return <ContactForm config={contactFormConfigs['contact-us']} />;
};
