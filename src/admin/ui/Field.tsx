import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Field({ label, hint, error, required, children, htmlFor }: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="ax-field">
      <label className="ax-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="ax-req">Required</span>}
      </label>
      {children}
      {hint && <div className="ax-field__hint">{hint}</div>}
      {error && <div className="ax-field__error">{error}</div>}
    </div>
  );
}

export function Input({ error, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return <input className={`ax-input${error ? " is-error" : ""}${className ? ` ${className}` : ""}`} {...rest} />;
}

export function Textarea({ error, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return <textarea className={`ax-textarea${error ? " is-error" : ""}${className ? ` ${className}` : ""}`} {...rest} />;
}
