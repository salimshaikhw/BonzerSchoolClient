import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';

interface FieldShellProps {
  label: string;
  error?: string | undefined;
}

type TextFieldProps = FieldShellProps & InputHTMLAttributes<HTMLInputElement>;

/** Labelled input that works with react-hook-form's register(): <TextField label="Name" {...register('name')} /> */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, ...rest },
  ref,
) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} ref={ref} aria-invalid={!!error} {...rest} />
      {error && <span className="field__error" role="alert">{error}</span>}
    </div>
  );
});

export interface SelectOption {
  value: string;
  label: string;
}

type SelectFieldProps = FieldShellProps &
  SelectHTMLAttributes<HTMLSelectElement> & { options: SelectOption[]; placeholder?: string };

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, options, placeholder = 'Select…', ...rest },
  ref,
) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} ref={ref} aria-invalid={!!error} {...rest}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <span className="field__error" role="alert">{error}</span>}
    </div>
  );
});
