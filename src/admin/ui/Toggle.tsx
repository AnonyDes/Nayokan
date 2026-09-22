"use client";

import { useId } from "react";

/**
 * ax-toggle port. The design styles a bare <label class="ax-toggle is-on">;
 * we keep that markup but add a visually-hidden checkbox so the control is
 * reachable and announced correctly (WCAG 2.2 AA — the visual track alone
 * isn't an input).
 */
export function Toggle({ checked, onChange, label, disabled, hint }: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  hint?: string;
}) {
  const id = useId();
  return (
    <label className={`ax-toggle${checked ? " is-on" : ""}${disabled ? " is-disabled" : ""}`} htmlFor={id} title={hint}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1, margin: 0 }}
      />
      <span className="ax-toggle__track" aria-hidden="true" />
      {label && (
        <span className="ax-toggle__label" style={{ fontSize: "11.5px" }}>
          {label}
        </span>
      )}
    </label>
  );
}
