"use client";

import type { ReactNode } from "react";

// `.ff` form-field wrapper — label, control, hint, error message (phase3b).
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  optional,
  children,
  className = "",
}: {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`ff${error ? " err" : ""} ${className}`.trim()}>
      <label htmlFor={htmlFor}>
        {label}
        {optional && <span style={{ textTransform: "none", opacity: 0.6 }}> (optional)</span>}
        {required && <span className="req"> *</span>}
      </label>
      {children}
      {hint && !error && <span className="hint">{hint}</span>}
      {error && (
        <span className="err-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
