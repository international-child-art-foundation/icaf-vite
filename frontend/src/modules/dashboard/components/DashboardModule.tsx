import type { ReactNode } from 'react';

type DashboardModuleProps = {
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
};

export function DashboardModule({
  title,
  description,
  aside,
  children,
}: DashboardModuleProps) {
  return (
    <section className="rounded-lg border border-primary/10 bg-white p-5 shadow-sm shadow-primary/5">
      <div className="flex flex-col gap-3 border-b border-primary/10 pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="font-montserrat text-2xl font-bold text-neutral-950">
            {title}
          </h2>
          {description && (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-neutral-600">
              {description}
            </p>
          )}
        </div>
        {aside}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

export function ModuleState({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'error' | 'success';
  children: ReactNode;
}) {
  const toneClass =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700'
      : tone === 'success'
        ? 'border-green-200 bg-green-50 text-green-700'
        : 'border-neutral-200 bg-neutral-50 text-neutral-700';

  return (
    <div className={`rounded-md border px-4 py-3 text-sm ${toneClass}`}>
      {children}
    </div>
  );
}
