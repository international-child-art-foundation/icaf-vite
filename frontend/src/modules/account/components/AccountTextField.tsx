import { useId, useState } from 'react';
import type { ChangeEvent, ComponentPropsWithRef, ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/utils/utils';

type AccountTextFieldProps = Omit<ComponentPropsWithRef<'input'>, 'size'> & {
  error?: string;
  helperText?: string;
  label: string;
  leadingIcon?: ReactNode;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const AccountTextField = ({
  className,
  error,
  helperText,
  id,
  label,
  leadingIcon,
  name,
  onChange,
  ref,
  required,
  type = 'text',
  value,
  ...props
}: AccountTextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const generatedId = useId();
  const inputId = id ?? name ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(' ') || undefined;
  const isPassword = type === 'password';
  const hasValue = String(value ?? '').length > 0;
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="flex items-center justify-between text-sm font-semibold text-slate-900"
      >
        <span>
          {label}
          {required && <span className="text-tertiary-red ml-1">*</span>}
        </span>
        {!error && hasValue && (
          <CheckCircle2
            aria-hidden="true"
            className="text-secondary-green h-4 w-4"
          />
        )}
      </label>

      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-500">
            {leadingIcon}
          </span>
        )}
        <Input
          ref={ref}
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={onChange}
          className={cn(
            'focus-visible:border-secondary-blue focus-visible:ring-secondary-blue/20 h-12 rounded-lg border-slate-300 bg-white/90 px-4 text-base shadow-sm transition-all placeholder:text-slate-400 focus-visible:ring-offset-0',
            leadingIcon && 'pl-12',
            isPassword && 'pr-12',
            error &&
              'border-tertiary-red focus-visible:border-tertiary-red focus-visible:ring-tertiary-red/20 bg-red-50/50',
            className,
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="focus:ring-secondary-blue/30 absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Eye aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

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
};

AccountTextField.displayName = 'AccountTextField';
