import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field({ label, error, ...props }, ref) {
  return (
    <label className="field">
      <span>{label}</span>
      <input ref={ref} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
});

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
  { label, error, ...props },
  ref,
) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea ref={ref} {...props} />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
});

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, children, ...props },
  ref,
) {
  return (
    <label className="field">
      <span>{label}</span>
      <select ref={ref} {...props}>
        {children}
      </select>
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
});
