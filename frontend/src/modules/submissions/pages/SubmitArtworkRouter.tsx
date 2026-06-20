import type { ReactNode } from 'react';
import { BookOpen, Images, Palette, ShieldCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/utils/utils';
import { PageBottomSpacer } from '@/modules/content/components/shared/PageBottomSpacer';

type SubmitterRole = 'adult_facilitator' | 'legal_guardian';
type SubmissionQuantity = 'solo' | 'group';

type ChoiceCardProps<Value extends string> = {
  colorClassName: string;
  description: string;
  disabled?: boolean;
  icon: ReactNode;
  isSelected: boolean;
  label: string;
  value: Value;
  onSelect: (value: Value) => void;
};

const roleChoices = [
  {
    colorClassName: 'bg-sky-50 text-sky-700 ring-sky-200',
    description:
      'I am a teacher, program leader, coach, or another adult submitting artwork for children in my care.',
    icon: <BookOpen aria-hidden="true" className="h-9 w-9" />,
    label: 'I work with children',
    value: 'adult_facilitator',
  },
  {
    colorClassName: 'bg-rose-50 text-rose-700 ring-rose-200',
    description:
      'I am submitting artwork for my own children as their parent or legal guardian.',
    icon: <ShieldCheck aria-hidden="true" className="h-9 w-9" />,
    label: 'I am a parent or guardian',
    value: 'legal_guardian',
  },
] as const;

const quantityChoices = [
  {
    colorClassName: 'bg-amber-50 text-amber-700 ring-amber-200',
    description: 'I want to upload one artwork image on behalf of one child.',
    icon: <Palette aria-hidden="true" className="h-9 w-9" />,
    label: 'One artwork',
    value: 'solo',
  },
  {
    colorClassName: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    description:
      'I want to upload several artworks together for a class, program, or group.',
    icon: <Images aria-hidden="true" className="h-9 w-9" />,
    label: 'Multiple artworks',
    value: 'group',
  },
] as const;

function normalizeRole(value: string | null): SubmitterRole | null {
  const normalizedValue = value?.toLowerCase();
  if (normalizedValue === 'adult_facilitator') return 'adult_facilitator';
  if (normalizedValue === 'legal_guardian') return 'legal_guardian';
  return null;
}

function normalizeQuantity(value: string | null): SubmissionQuantity | null {
  const normalizedValue = value?.toLowerCase();
  if (
    normalizedValue === 'solo' ||
    normalizedValue === 'single' ||
    normalizedValue === 'one'
  ) {
    return 'solo';
  }
  if (
    normalizedValue === 'group' ||
    normalizedValue === 'multiple' ||
    normalizedValue === 'bulk'
  ) {
    return 'group';
  }
  return null;
}

function buildFlowUrl(
  role: SubmitterRole | null,
  quantity: SubmissionQuantity | null,
  searchParams: URLSearchParams,
) {
  if (!role || !quantity) return '';

  const nextParams = new URLSearchParams(searchParams);
  nextParams.delete('role');
  nextParams.delete('submitter');
  nextParams.delete('quantity');
  nextParams.delete('count');
  nextParams.delete('mode');

  const query = nextParams.toString();
  const path =
    quantity === 'group'
      ? `/submit-artwork/group/${role}`
      : `/submit-artwork/single/${role}`;

  return query ? `${path}?${query}` : path;
}

function ChoiceCard<Value extends string>({
  colorClassName,
  description,
  disabled = false,
  icon,
  isSelected,
  label,
  value,
  onSelect,
}: ChoiceCardProps<Value>) {
  return (
    <button
      aria-pressed={isSelected}
      disabled={disabled}
      className={cn(
        'sm:items-unset relative flex min-h-[150px] w-full items-start items-center gap-4 rounded-lg border-2 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-100 sm:min-h-[168px] sm:flex-col sm:items-baseline',
        isSelected
          ? 'border-secondary-blue ring-secondary-blue/20 bg-sky-50 ring-4'
          : 'border-slate-200',
      )}
      type="button"
      onClick={() => onSelect(value)}
    >
      <span
        className={cn(
          'flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ring-1',
          colorClassName,
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="font-montserrat block pr-10 text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
          {label}
        </span>
        <span className="mt-2 block text-sm leading-5 text-slate-600">
          {description}
        </span>
      </span>
      <span
        className={cn(
          'absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white',
          isSelected ? 'border-secondary-blue' : 'border-slate-300',
        )}
      >
        <span
          className={cn(
            'h-3.5 w-3.5 rounded-full',
            isSelected ? 'bg-secondary-blue' : 'bg-transparent',
          )}
        />
      </span>
      <span className="sr-only">
        {isSelected ? 'Selected' : 'Not selected'}
      </span>
    </button>
  );
}

export function SubmitArtworkRouter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRole = normalizeRole(
    searchParams.get('role') ?? searchParams.get('submitter'),
  );
  const selectedQuantity = normalizeQuantity(
    searchParams.get('quantity') ??
      searchParams.get('count') ??
      searchParams.get('mode'),
  );
  const flowUrl = buildFlowUrl(selectedRole, selectedQuantity, searchParams);
  const canContinue = Boolean(flowUrl);

  function updateParam(name: 'role' | 'quantity', value: string) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set(name, value);
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <div className="min-h-full flex-grow bg-gradient-to-b from-sky-50 via-white to-sky-100 py-6 sm:py-8">
      <div className="content-w m-pad mx-auto">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="mb-5 mt-4 flex flex-col gap-4 text-center">
            <div>
              <h1 className="font-montserrat mt-1 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
                Submit children&apos;s artwork
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-base leading-6 text-slate-600">
                Answer two quick questions so we can get started.
              </p>
              <p className="mx-auto max-w-2xl text-base leading-6 text-slate-600">
                Keep in mind that artwork submissions are for artists below age
                20.
              </p>
            </div>
          </div>

          <div className="grid gap-8 overflow-hidden rounded-lg border-2 border-slate-200 bg-white/75">
            <div>
              <section className="p-4 sm:p-5">
                <div className="mb-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                    First question
                  </p>
                  <h2 className="font-montserrat mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                    Who are you?
                  </h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {roleChoices.map((choice) => (
                    <ChoiceCard
                      key={choice.value}
                      {...choice}
                      isSelected={selectedRole === choice.value}
                      onSelect={(value) => updateParam('role', value)}
                    />
                  ))}
                </div>
              </section>

              <section
                aria-hidden={!selectedRole}
                className={cn(
                  'p-4 transition-opacity sm:p-5',
                  selectedRole
                    ? 'opacity-100'
                    : 'pointer-events-none select-none opacity-0',
                )}
              >
                <div className="mb-3">
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                    Second question
                  </p>
                  <h2 className="font-montserrat mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                    How many artworks are you submitting?
                  </h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {quantityChoices.map((choice) => (
                    <ChoiceCard
                      key={choice.value}
                      {...choice}
                      disabled={!selectedRole}
                      isSelected={selectedQuantity === choice.value}
                      onSelect={(value) => updateParam('quantity', value)}
                    />
                  ))}
                </div>
              </section>
            </div>
            <div className="mx-auto mb-8 rounded-lg sm:flex sm:justify-center">
              <div
                className="group relative w-auto"
                title={
                  !canContinue ? 'Answer the questions to continue' : undefined
                }
              >
                {canContinue ? (
                  <Button
                    asChild
                    size="lg"
                    className="mx-auto h-14 w-auto min-w-64 rounded-full text-lg font-bold"
                  >
                    <Link to={flowUrl}>Continue</Link>
                  </Button>
                ) : (
                  <Button
                    aria-describedby="submit-artwork-continue-tooltip"
                    aria-disabled="true"
                    className="mx-auto h-12 w-auto min-w-64 cursor-not-allowed rounded-full bg-slate-400 text-base font-bold text-white hover:bg-slate-400 hover:shadow-none"
                    type="button"
                  >
                    Continue
                  </Button>
                )}
                {!canContinue && (
                  <span
                    id="submit-artwork-continue-tooltip"
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                  >
                    Answer the questions to continue
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <PageBottomSpacer />
    </div>
  );
}
