import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTriggerNoIcon,
} from '@/components/ui/accordion';

const items = [
  {
    number: '01',
    title: 'Innovative Methodologies Up',
    description:
      'Over the past 27 years, we have developed innovative methodologies for students’ identity development. The Arts Olympiad, our school art program, introduces students to the “Artist-Athlete Ideal” of the creative mind and healthy body (mente sana in corpo sano)',
  },
  {
    number: '02',
    title: 'Impact of Artist-Athletes',
    description:
      'Once the number of "artist athletes" grows, their school becomes a more integrated and healthy community, and their towns or cities transform into creative clusters.',
  },
  {
    number: '03',
    title: 'Empowering Low-SES Students',
    description:
      'Creativity can empower low-SES students to blaze new trails that disrupt the vicious cycle of inherited poverty. But creativity can as easily be channeled to destroy, not only to create. Creativity alone is morally neutral and must be infused with empathy to fend off malevolent creativity.',
  },
  {
    number: '04',
    title: "World Children's Festival",
    description:
      'At our World Children’s Festivals, students intuit past the material boundaries that exaggerate differences to see each other as inseparably human. They begin thinking of themselves and others as "creative empaths" working together to transform this wounded world into a wondrous one.',
  },
  {
    number: '05',
    title: 'Inspiring and Uniting Youth',
    description:
      'To inspire and unite young people, we provide them with unique and unprecedented art making opportunities, and we showcase their creative expressions at major venues across America and worldwide.',
  },
];

export default function HowWeDoIt() {
  return (
    <section>
      <h2 className="mb-10 text-center font-sans text-3xl font-bold">
        How We Do It
      </h2>
      <div>
        {items.map((item, index) => (
          <Accordion type="single" collapsible key={index}>
            <div className="font-montserrat text-[80px] font-semibold">
              {item.number}
            </div>
            <AccordionItem value={`item-${item.number}`}>
              <AccordionTriggerNoIcon className="font-montserrat text-2xl font-semibold">
                {item.title}
              </AccordionTriggerNoIcon>
              <AccordionContent>{item.description}</AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </section>
  );
}
