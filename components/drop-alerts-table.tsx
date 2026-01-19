"use client";

import * as React from "react";
import MultiSelect from "@/components/multi-select";
import type { DropAlert } from "@/lib/report";

type DropAlertsTableProps = {
  alerts: DropAlert[];
};

export default function DropAlertsTable({ alerts }: DropAlertsTableProps) {
  const [selectedOffers, setSelectedOffers] = React.useState<string[]>([]);
  const [selectedAffiliates, setSelectedAffiliates] = React.useState<string[]>([]);
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([]);
  const offersInit = React.useRef(false);
  const affiliatesInit = React.useRef(false);
  const codesInit = React.useRef(false);

  const offers = React.useMemo(() => {
    return Array.from(new Set(alerts.map((alert) => alert.offer))).sort();
  }, [alerts]);

  const affiliates = React.useMemo(() => {
    return Array.from(new Set(alerts.map((alert) => alert.partner))).sort();
  }, [alerts]);

  const codes = React.useMemo(() => {
    return Array.from(new Set(alerts.map((alert) => alert.code))).sort();
  }, [alerts]);

  React.useEffect(() => {
    if (!offersInit.current && offers.length) {
      setSelectedOffers(offers);
      offersInit.current = true;
    }
  }, [offers]);

  React.useEffect(() => {
    if (!affiliatesInit.current && affiliates.length) {
      setSelectedAffiliates(affiliates);
      affiliatesInit.current = true;
    }
  }, [affiliates]);

  React.useEffect(() => {
    if (!codesInit.current && codes.length) {
      setSelectedCodes(codes);
      codesInit.current = true;
    }
  }, [codes]);

  const filtered = React.useMemo(() => {
    return alerts.filter((alert) => {
      if (selectedOffers.length === 0 || selectedAffiliates.length === 0 || selectedCodes.length === 0) {
        return false;
      }
      if (!selectedOffers.includes(alert.offer)) return false;
      if (!selectedAffiliates.includes(alert.partner)) return false;
      if (!selectedCodes.includes(alert.code)) return false;
      return true;
    });
  }, [alerts, selectedOffers, selectedAffiliates, selectedCodes]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold uppercase tracking-normal text-[color:var(--ink-muted)]">
          Filters
          <span className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--paper-strong)] px-3 py-1 text-[10px] tracking-normal text-[color:var(--ink-muted)]">
            {filtered.length} results
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1.4fr]">
          <MultiSelect
            label="Offers"
            options={offers.map((offer) => ({ value: offer, label: offer }))}
            selected={selectedOffers}
            onChange={setSelectedOffers}
            searchPlaceholder="Search offers..."
          />
          <MultiSelect
            label="Affiliates"
            options={affiliates.map((affiliate) => ({ value: affiliate, label: affiliate }))}
            selected={selectedAffiliates}
            onChange={setSelectedAffiliates}
            searchPlaceholder="Search affiliates..."
          />
          <MultiSelect
            label="Codes"
            options={codes.map((code) => ({ value: code, label: code }))}
            selected={selectedCodes}
            onChange={setSelectedCodes}
            searchPlaceholder="Search codes..."
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-6 text-sm text-[color:var(--ink-muted)]">
          No drops found for the selected filters.
        </div>
      ) : (
        <div className="relative overflow-x-auto rounded-2xl border border-[color:var(--stroke)] bg-white/70">
          <table className="min-w-[720px] w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[color:var(--paper-strong)] text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
              <tr>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">
                  Offer Name
                </th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">
                  Aff Name
                </th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">
                  Code
                </th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">
                  Prev Day
                </th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">
                  Prev Orders
                </th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">
                  Day
                </th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">
                  Orders
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/60">
              {filtered.map((alert) => (
                <tr key={`${alert.offer}-${alert.partner}-${alert.code}-${alert.day}`}>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {alert.offer}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {alert.partner}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 font-medium text-[color:var(--ink)]">
                    {alert.code}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {alert.prevDayLabel}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {alert.prevDayCount}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {alert.dayLabel}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {alert.dayCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
