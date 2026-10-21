"use client";

import { useId, useRef, useState } from "react";

import useOutsideClick from "../../hooks/useOutsideClick";
import { focusRingClasses, scrollbarThinClasses } from "./styles";

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type DropdownProps<T extends string> = {
  /** Currently selected value (controlled). */
  value: T;
  options: ReadonlyArray<DropdownOption<T>>;
  onChange: (value: T) => void;
  /** Label rendered on the trigger button. */
  label: string;
  ariaLabel: string;
  className?: string;
};

/**
 * Generic controlled select-like dropdown with listbox semantics,
 * outside-click dismissal and a scrollable menu.
 */
const Dropdown = <T extends string>({
  value,
  options,
  onChange,
  label,
  ariaLabel,
  className = "",
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerId = useId();
  const listboxId = useId();

  useOutsideClick(containerRef, () => setIsOpen(false));

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((open) => !open)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 transition hover:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white ${focusRingClasses}`}
      >
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>

        <svg
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 010-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
          className={`absolute left-0 top-full z-20 mt-2 max-h-64 w-full rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900 ${scrollbarThinClasses}`}
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full rounded-md px-4 py-2.5 text-left text-sm transition ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
