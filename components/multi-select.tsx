"use client";

import * as React from "react";

type Option = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchPlaceholder?: string;
};

export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
  searchPlaceholder = "Search..."
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredOptions = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, search]);

  const allSelected = selected.length === options.length && options.length > 0;
  const buttonLabel = allSelected
    ? `All ${label}`
    : selected.length === 0
    ? `No ${label}`
    : `${selected.length} selected`;

  const toggleValue = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
      return;
    }
    onChange([...selected, value]);
  };

  return (
    <div className="relative space-y-1" ref={ref}>
      <span className="text-[10px] font-semibold uppercase tracking-normal text-[color:var(--ink-muted)]">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-full border border-[color:var(--stroke)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--ink)] shadow-sm"
      >
        <span className="truncate">{buttonLabel}</span>
        <span className="text-xs text-[color:var(--ink-muted)]">v</span>
      </button>
      {open ? (
        <div className="absolute left-0 z-20 mt-2 w-[min(320px,90vw)] rounded-2xl border border-[color:var(--stroke)] bg-white p-3 shadow-xl">
          <div className="flex items-center gap-2 rounded-xl border border-[color:var(--stroke)] bg-[color:var(--paper-strong)]/60 px-3 py-2 text-sm">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm text-[color:var(--ink)] focus:outline-none"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="flex-1 rounded-xl border border-[color:var(--stroke)] px-3 py-2 text-xs font-semibold uppercase tracking-normal text-[color:var(--ink-muted)]"
              onClick={() => onChange(options.map((option) => option.value))}
            >
              Select all
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl border border-[color:var(--stroke)] px-3 py-2 text-xs font-semibold uppercase tracking-normal text-[color:var(--ink-muted)]"
              onClick={() => onChange([])}
            >
              Clear selection
            </button>
          </div>
          <div className="mt-3 max-h-56 space-y-1 overflow-y-auto">
            {filteredOptions.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <button
                  type="button"
                  key={option.value}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-[color:var(--ink)] hover:bg-[color:var(--paper-strong)]/60"
                  onClick={() => toggleValue(option.value)}
                >
                  <span className="truncate">{option.label}</span>
                  <span className={checked ? "text-[color:var(--accent)]" : "text-transparent"}>
                    x
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
