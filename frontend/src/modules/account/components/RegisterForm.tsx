import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { CalendarDays, Mail, User, UsersRound } from 'lucide-react';
import type { DefaultRegistrationResponse } from '@icaf/shared';
import { defaultRegistration } from '@/api/auth';
import { ApiError } from '@/api/client';
import { AccountTextField } from '@/modules/account/components/AccountTextField';
import { registerTextFields } from '@/modules/account/data/registerFields';
import type {
  RegisterFieldName,
  RegisterFormErrors,
  RegisterFormValues,
  RegisterTextFieldName,
} from '@/modules/account/types/registerForm';
import {
  getRegisterFieldError,
  hasRegisterErrors,
  initialRegisterFormValues,
  toDefaultRegistrationRequest,
  validateRegisterForm,
} from '@/modules/account/utils/registerValidation';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/utils/utils';

const fieldIcons: Partial<Record<RegisterTextFieldName, ReactNode>> = {
  dob: <CalendarDays aria-hidden="true" className="h-4 w-4" />,
  email: <Mail aria-hidden="true" className="h-4 w-4" />,
  f_name: <User aria-hidden="true" className="h-4 w-4" />,
  l_name: <User aria-hidden="true" className="h-4 w-4" />,
};

function getSubmitError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return 'Registration failed. Please try again.';
}

export const RegisterForm = () => {
  const [values, setValues] = useState<RegisterFormValues>(
    initialRegisterFormValues,
  );
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<RegisterFieldName, boolean>>
  >({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>(
    'idle',
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] =
    useState<DefaultRegistrationResponse | null>(null);

  const isSubmitting = status === 'submitting';

  function updateField<Name extends RegisterFieldName>(
    name: Name,
    value: RegisterFormValues[Name],
  ) {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    if (touched[name]) {
      setErrors((current) => ({
        ...current,
        [name]: getRegisterFieldError(name, nextValues),
      }));
    }

    if (name === 'password' && touched.confirmPassword) {
      setErrors((current) => ({
        ...current,
        confirmPassword: getRegisterFieldError('confirmPassword', nextValues),
      }));
    }
  }

  function handleTextChange(event: ChangeEvent<HTMLInputElement>) {
    const name = event.target.name as RegisterTextFieldName;
    updateField(name, event.target.value);
  }

  function handleBlur(name: RegisterFieldName) {
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({
      ...current,
      [name]: getRegisterFieldError(name, values),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateRegisterForm(values);
    setTouched({
      confirmPassword: true,
      dob: true,
      email: true,
      f_name: true,
      l_name: true,
      role: true,
    });
    setErrors(nextErrors);
    setSubmitError(null);

    if (hasRegisterErrors(nextErrors)) return;

    setStatus('submitting');
    void submitRegistration();
  }

  async function submitRegistration() {
    try {
      const response = await defaultRegistration(
        toDefaultRegistrationRequest(values),
      );
      setRegistrationResult(response);
      setStatus('success');
    } catch (error) {
      setSubmitError(getSubmitError(error));
      setStatus('idle');
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto w-full max-w-xl rounded-lg border border-green-200 bg-white p-8 shadow-xl">
        <div className="text-secondary-green mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Mail aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="font-montserrat text-3xl font-semibold text-slate-950">
          Check your email
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600">
          Your account was created. Open the verification link sent to{' '}
          <span className="font-semibold text-slate-900">{values.email}</span>{' '}
          to finish setup.
        </p>
        {registrationResult?.destination && (
          <p className="mt-3 text-sm text-slate-500">
            Verification link sent by {registrationResult.delivery_medium} to{' '}
            {registrationResult.destination}.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      className="mx-auto w-full max-w-3xl"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
        <div className="mb-8">
          <p className="text-secondary-blue mb-2 text-sm font-bold uppercase tracking-widest">
            ICAF account
          </p>
          <h1 className="font-montserrat text-3xl font-semibold text-slate-950 sm:text-4xl">
            Register an account
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Create an account to submit artwork, manage participation, and
            receive updates.
          </p>
        </div>

        {submitError && (
          <div
            className="text-tertiary-red mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {registerTextFields.map((field) => (
            <div
              key={field.name}
              className={cn(
                (field.name === 'email' ||
                  field.name === 'password' ||
                  field.name === 'confirmPassword') &&
                  'sm:col-span-2',
              )}
            >
              <AccountTextField
                autoComplete={field.autoComplete}
                error={errors[field.name]}
                helperText={field.helperText}
                label={field.label}
                leadingIcon={fieldIcons[field.name]}
                maxLength={field.maxLength}
                name={field.name}
                required={field.required}
                type={field.type}
                value={values[field.name]}
                onBlur={() => handleBlur(field.name)}
                onChange={handleTextChange}
              />
            </div>
          ))}
        </div>

        <fieldset className="mt-6">
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <UsersRound aria-hidden="true" className="h-4 w-4 text-slate-500" />
            Account type <span className="text-tertiary-red">*</span>
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(['user', 'guardian'] as const).map((role) => (
              <label
                key={role}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-4 shadow-sm transition-all',
                  values.role === role
                    ? 'border-secondary-blue ring-secondary-blue/15 ring-2'
                    : 'border-slate-200 hover:border-slate-300',
                )}
              >
                <input
                  className="accent-secondary-blue mt-1 h-4 w-4"
                  checked={values.role === role}
                  name="role"
                  type="radio"
                  value={role}
                  onBlur={() => handleBlur('role')}
                  onChange={() => updateField('role', role)}
                />
                <span>
                  <span className="block text-sm font-semibold capitalize text-slate-950">
                    {role}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">
                    {role === 'guardian'
                      ? 'For parents, guardians, and adults managing child participation.'
                      : 'For participants creating their own ICAF account.'}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errors.role && (
            <p className="text-tertiary-red mt-2 text-xs font-semibold">
              {errors.role}
            </p>
          )}
        </fieldset>

        <label className="mt-6 flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          <input
            checked={values.has_newsletter_subscription}
            className="accent-secondary-blue mt-1 h-4 w-4"
            name="has_newsletter_subscription"
            type="checkbox"
            onChange={(event) =>
              updateField('has_newsletter_subscription', event.target.checked)
            }
          />
          <span>
            Send me ICAF news, program updates, and account-related
            announcements.
          </span>
        </label>

        <Button
          className="mt-8 h-12 w-full rounded-full text-base font-bold"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </div>
    </form>
  );
};
