"use client";

import * as React from "react";
import type { OfferSummary } from "@/lib/report";

type OfferTabsProps = {
  offers: OfferSummary[];
  daysInMonth: number;
  monthLabel: string;
  monthIndex: number | null;
  year: number | null;
};

const numberFormat = new Intl.NumberFormat("en-US");
const avgFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function toTabId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function buildAlertFlags(counts: number[], maxPastDay: number) {
  const dropFlags = counts.map((value, index) => {
    if (index === 0) return false;
    const prev = counts[index - 1];
    return prev > 15 && value < prev * 0.6;
  });

  const zeroRunFlags = counts.map(() => false);
  for (let i = 1; i < counts.length; i += 1) {
    if (i + 1 > maxPastDay) {
      continue;
    }
    if (counts[i - 1] <= 0 || counts[i] !== 0) {
      continue;
    }
    let j = i;
    while (j < counts.length && counts[j] === 0 && j + 1 <= maxPastDay) {
      j += 1;
    }
    const runLength = j - i;
    if (runLength >= 3) {
      for (let k = i; k < j; k += 1) {
        zeroRunFlags[k] = true;
      }
    }
    i = Math.max(i, j - 1);
  }

  return { dropFlags, zeroRunFlags };
}

export default function OfferTabs({ offers, daysInMonth, monthLabel, monthIndex, year }: OfferTabsProps) {
  const [active, setActive] = React.useState(offers[0]?.offer ?? "");
  const days = React.useMemo(
    () => Array.from({ length: daysInMonth }, (_, index) => index + 1),
    [daysInMonth]
  );

  const activeOffer = offers.find((offer) => offer.offer === active);
  const maxPastDay = React.useMemo(() => {
    if (monthIndex === null || year === null) {
      return daysInMonth;
    }
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    if (year < currentYear || (year === currentYear && monthIndex < currentMonth)) {
      return daysInMonth;
    }

    if (year === currentYear && monthIndex === currentMonth) {
      return Math.max(today.getDate() - 1, 0);
    }

    return 0;
  }, [daysInMonth, monthIndex, year]);

  if (!offers.length) {
    return (
      <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-6 text-sm text-[color:var(--ink-muted)]">
        No rows found for the selected month.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Offers"
        className="flex w-full gap-2 overflow-x-auto pb-2"
      >
        {offers.map((offer) => {
          const isActive = offer.offer === active;
          return (
            <button
              key={offer.offer}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${toTabId(offer.offer)}`}
              className={
                "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition" +
                " " +
                (isActive
                  ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white shadow"
                  : "border-[color:var(--stroke)] bg-white/70 text-[color:var(--ink-muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--ink)]")
              }
              onClick={() => setActive(offer.offer)}
            >
              <span className="font-[var(--font-display)] tracking-tight">
                {offer.offer}
              </span>
              <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs text-[color:var(--ink-muted)]">
                {numberFormat.format(offer.total)}
              </span>
            </button>
          );
        })}
      </div>

      {activeOffer ? (
        <section
          id={`panel-${toTabId(activeOffer.offer)}`}
          role="tabpanel"
          className="fade-up space-y-4"
        >
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl font-[var(--font-display)] tracking-tight">
              {activeOffer.offer}
            </h2>
            <p className="text-sm text-[color:var(--ink-muted)]">
              {monthLabel || "Monthly view"} · {numberFormat.format(activeOffer.total)} conversions
            </p>
          </div>

          <div className="relative overflow-x-auto rounded-2xl border border-[color:var(--stroke)] bg-white/70">
            <table className="min-w-[860px] w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[color:var(--paper-strong)] text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
                <tr>
                  <th className="sticky left-0 z-20 w-48 border-b border-[color:var(--stroke)] bg-[color:var(--paper-strong)] px-4 py-3 text-left">
                    Code
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="border-b border-[color:var(--stroke)] px-3 py-3 text-center"
                    >
                      {day}
                    </th>
                  ))}
                  <th className="border-b border-[color:var(--stroke)] px-3 py-3 text-center">
                    Total
                  </th>
                  <th className="border-b border-[color:var(--stroke)] px-3 py-3 text-center">
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/60">
                {activeOffer.codes.map((codeRow, index) => {
                  const { dropFlags, zeroRunFlags } = buildAlertFlags(codeRow.counts, maxPastDay);
                  const nonZeroDays = codeRow.counts.filter((value) => value > 0).length;
                  const avg = nonZeroDays ? codeRow.total / nonZeroDays : 0;
                  const shouldUseAvgAlerts = avg >= 10;

                  return (
                    <tr key={codeRow.code} className={index % 2 === 0 ? "bg-white/60" : "bg-white/30"}>
                    <td className="sticky left-0 z-10 border-b border-[color:var(--stroke)] bg-inherit px-4 py-2 font-medium text-[color:var(--ink)]">
                      {codeRow.code}
                    </td>
                    {codeRow.counts.map((value, idx) => {
                      const isDrop = dropFlags[idx];
                      const isZeroRun = zeroRunFlags[idx];
                      const isFutureDay = maxPastDay === 0 ? true : idx + 1 > maxPastDay;
                      const ratio = shouldUseAvgAlerts && avg > 0 ? value / avg : 1;
                      const isLowAvg = shouldUseAvgAlerts && ratio < 0.75 && ratio >= 0.5;
                      const isVeryLowAvg = shouldUseAvgAlerts && ratio < 0.5;
                      const isHighAvg = shouldUseAvgAlerts && ratio > 1.4;
                      return (
                      <td
                        key={`${codeRow.code}-${idx}`}
                        className={
                          "border-b border-[color:var(--stroke)] px-3 py-2 text-center tabular-nums text-[color:var(--ink)]" +
                          (isDrop ? " bg-emerald-100 text-emerald-800 font-semibold" : "") +
                          (!isFutureDay && isZeroRun ? " bg-rose-200 text-rose-900 font-semibold" : "") +
                          (!isFutureDay && !isZeroRun && isVeryLowAvg ? " bg-rose-300 text-rose-900 font-semibold" : "") +
                          (!isFutureDay && !isZeroRun && !isVeryLowAvg && isLowAvg ? " bg-rose-100 text-rose-800 font-semibold" : "") +
                          (!isFutureDay && !isZeroRun && !isVeryLowAvg && !isLowAvg && isHighAvg ? " bg-emerald-100 text-emerald-800 font-semibold" : "")
                        }
                      >
                        {value === 0 ? "–" : numberFormat.format(value)}
                      </td>
                      );
                    })}
                    <td className="border-b border-[color:var(--stroke)] px-3 py-2 text-center font-semibold text-[color:var(--ink)]">
                      {numberFormat.format(codeRow.total)}
                    </td>
                    <td className="border-b border-[color:var(--stroke)] px-3 py-2 text-center font-semibold text-[color:var(--ink)]">
                      {avg === 0 ? "–" : avgFormat.format(avg)}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
