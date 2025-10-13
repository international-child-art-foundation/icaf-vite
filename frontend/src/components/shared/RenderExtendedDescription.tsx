import { ExtendedDescription } from '@/types/AccordionCardTypes';

export const renderExtendedDescription = (desc: ExtendedDescription) => {
  if (typeof desc === 'string') {
    return <p className="mb-2">{desc}</p>;
  }

  return desc.map((block, i) => {
    if (block.type === 'space') return <div key={i} className="h-4" />;

    const children = block.children.map((c, j) => {
      if (c.type === 'text') return <span key={j}>{c.value}</span>;
      if (c.type === 'link') {
        return (
          <a key={j} href={c.href} className="text-blue-500 underline">
            {c.label}
          </a>
        );
      }
      return null;
    });

    if (block.type === 'paragraph')
      return (
        <p key={i} className="mb-2">
          {children}
        </p>
      );
    if (block.type === 'bullet')
      return (
        <li key={i} className="ml-6 list-disc">
          {children}
        </li>
      );

    return null;
  });
};
