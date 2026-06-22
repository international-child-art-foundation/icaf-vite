import { useId } from 'react';
import type { ComponentPropsWithRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/utils/utils';

type CompactTextareaProps = ComponentPropsWithRef<'textarea'> & {
  error?: string;
  helperText?: string;
  label: string;
};

export function CompactTextarea({
  className,
  error,
  helperText,
  id,
  label,
  name,
  required,
  ...props
}: CompactTextareaProps) {
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="space-y-2">
      <label
        className="flex items-center justify-between text-sm font-semibold text-slate-900"
        htmlFor={inputId}
      >
        <span>
          {label}
          {required && <span className="text-tertiary-red ml-1">*</span>}
        </span>
      </label>
      <textarea
        id={inputId}
        name={name}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={cn(
          'focus-visible:border-secondary-blue focus-visible:ring-secondary-blue/20 min-h-24 w-full rounded-lg border border-slate-300 bg-white/90 px-4 py-3 text-base shadow-sm transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
          error &&
            'border-tertiary-red focus-visible:border-tertiary-red focus-visible:ring-tertiary-red/20 bg-red-50/50',
          className,
        )}
        {...props}
      />
      {helperText && !error && (
        <p id={helperId} className="text-xs leading-5 text-slate-500">
          {helperText}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          className="text-tertiary-red flex items-start gap-1.5 text-xs font-semibold"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0"
          />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
