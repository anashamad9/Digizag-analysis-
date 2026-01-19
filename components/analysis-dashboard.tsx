"use client";

import * as React from "react";
import LineChart from "@/components/line-chart";
import MultiSelect from "@/components/multi-select";
import type { AnalysisData, AnalysisRow } from "@/lib/report";

type AnalysisDashboardProps = {
  data: AnalysisData;
};

const numberFormat = new Intl.NumberFormat("en-US");
const currencyFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

function aggregateByDay(rows: AnalysisRow[], daysInMonth: number) {
  const totals = Array.from({ length: daysInMonth }, () => ({
    orders: 0,
    revenue: 0,
    payout: 0,
    saleAmount: 0
  }));

  for (const row of rows) {
    const index = row.day - 1;
    if (index < 0 || index >= totals.length) continue;
    totals[index].orders += 1;
    totals[index].revenue += row.revenue;
    totals[index].payout += row.payout;
    totals[index].saleAmount += row.saleAmount;
  }

  return totals;
}

export default function AnalysisDashboard({ data }: AnalysisDashboardProps) {
  const [selectedOffers, setSelectedOffers] = React.useState<string[]>([]);
  const [selectedAffiliates, setSelectedAffiliates] = React.useState<string[]>([]);
  const [selectedCodes, setSelectedCodes] = React.useState<string[]>([]);
  const [selectedGeos, setSelectedGeos] = React.useState<string[]>([]);
  const [dateFrom, setDateFrom] = React.useState(1);
  const [dateTo, setDateTo] = React.useState(data.daysInMonth);
  const offersInit = React.useRef(false);
  const affiliatesInit = React.useRef(false);
  const codesInit = React.useRef(false);
  const geosInit = React.useRef(false);

  React.useEffect(() => {
    if (!offersInit.current && data.offers.length) {
      setSelectedOffers(data.offers);
      offersInit.current = true;
    }
  }, [data.offers]);

  React.useEffect(() => {
    if (!affiliatesInit.current && data.affiliates.length) {
      setSelectedAffiliates(data.affiliates);
      affiliatesInit.current = true;
    }
  }, [data.affiliates]);

  React.useEffect(() => {
    if (!codesInit.current && data.codes.length) {
      setSelectedCodes(data.codes);
      codesInit.current = true;
    }
  }, [data.codes]);

  React.useEffect(() => {
    if (!geosInit.current && data.geos.length) {
      setSelectedGeos(data.geos);
      geosInit.current = true;
    }
  }, [data.geos]);

  React.useEffect(() => {
    setDateFrom(1);
    setDateTo(data.daysInMonth);
  }, [data.daysInMonth]);

  const filteredRows = React.useMemo(() => {
    return data.rows.filter((row) => {
      if (
        selectedOffers.length === 0 ||
        selectedAffiliates.length === 0 ||
        selectedCodes.length === 0 ||
        selectedGeos.length === 0
      ) {
        return false;
      }
      if (!selectedOffers.includes(row.offer)) return false;
      if (!selectedAffiliates.includes(row.partner)) return false;
      if (!selectedCodes.includes(row.code)) return false;
      if (!selectedGeos.includes(row.geo)) return false;
      if (row.day < dateFrom || row.day > dateTo) return false;
      return true;
    });
  }, [data.rows, selectedOffers, selectedAffiliates, selectedCodes, selectedGeos, dateFrom, dateTo]);

  const dayTotals = React.useMemo(
    () => aggregateByDay(filteredRows, data.daysInMonth),
    [filteredRows, data.daysInMonth]
  );
  const lastUpdatedDay = React.useMemo(() => {
    if (!filteredRows.length) return 0;
    return filteredRows.reduce((max, row) => Math.max(max, row.day), 0);
  }, [filteredRows]);
  const chartDays = lastUpdatedDay > 0 ? lastUpdatedDay : data.daysInMonth;

  const totalOrders = filteredRows.length;
  const totalRevenue = filteredRows.reduce((sum, row) => sum + row.revenue, 0);
  const totalPayout = filteredRows.reduce((sum, row) => sum + row.payout, 0);
  const totalSale = filteredRows.reduce((sum, row) => sum + row.saleAmount, 0);
  const avgOrderValue = totalOrders ? totalSale / totalOrders : 0;

  const dayLabels = Array.from({ length: data.daysInMonth }, (_, index) => {
    const day = index + 1;
    const monthName = data.monthLabel ? data.monthLabel.split(" ")[0] : "Day";
    const shortMonth = monthName.slice(0, 3);
    return `${shortMonth} ${day}`;
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-[var(--font-display)] tracking-tight">Filters</h2>
          <span className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
            {filteredRows.length} rows
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <MultiSelect
            label="Offers"
            options={data.offers.map((offer) => ({ value: offer, label: offer }))}
            selected={selectedOffers}
            onChange={setSelectedOffers}
            searchPlaceholder="Search offers..."
          />
          <MultiSelect
            label="Affiliates"
            options={data.affiliates.map((affiliate) => ({
              value: affiliate,
              label: affiliate
            }))}
            selected={selectedAffiliates}
            onChange={setSelectedAffiliates}
            searchPlaceholder="Search affiliates..."
          />
          <MultiSelect
            label="Codes"
            options={data.codes.map((code) => ({ value: code, label: code }))}
            selected={selectedCodes}
            onChange={setSelectedCodes}
            searchPlaceholder="Search codes..."
          />
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-normal text-[color:var(--ink-muted)]">
              Date range
            </span>
            <div className="flex gap-2">
              <select
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--ink)]"
                value={dateFrom}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setDateFrom(next);
                  if (next > dateTo) setDateTo(next);
                }}
              >
                {Array.from({ length: data.daysInMonth }, (_, index) => {
                  const day = index + 1;
                  return (
                    <option key={`from-${day}`} value={day}>
                      {data.monthLabel} {day}
                    </option>
                  );
                })}
              </select>
              <select
                className="w-full rounded-full border border-[color:var(--stroke)] bg-white px-3 py-2 text-sm font-medium text-[color:var(--ink)]"
                value={dateTo}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setDateTo(next);
                  if (next < dateFrom) setDateFrom(next);
                }}
              >
                {Array.from({ length: data.daysInMonth }, (_, index) => {
                  const day = index + 1;
                  return (
                    <option key={`to-${day}`} value={day}>
                      {data.monthLabel} {day}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <MultiSelect
            label="Geos"
            options={data.geos.map((geo) => ({ value: geo, label: geo }))}
            selected={selectedGeos}
            onChange={setSelectedGeos}
            searchPlaceholder="Search geos..."
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {numberFormat.format(totalOrders)}
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {currencyFormat.format(totalRevenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">Payout</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {currencyFormat.format(totalPayout)}
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">Sale Amount</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {currencyFormat.format(totalSale)}
          </p>
        </div>
        <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-4">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">Avg Order</p>
          <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
            {currencyFormat.format(avgOrderValue)}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-5">
        <h2 className="mb-4 text-lg font-[var(--font-display)] tracking-tight">Daily Summary</h2>
        <div className="relative overflow-x-auto rounded-2xl border border-[color:var(--stroke)] bg-white/70">
          <table className="min-w-[720px] w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[color:var(--paper-strong)] text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
              <tr>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">Day</th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">Orders</th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">Revenue</th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">Payout</th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">Sale Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white/60">
              {dayTotals.map((dayTotal, index) => (
                <tr key={`day-${index}`}>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {data.monthLabel} {index + 1}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {numberFormat.format(dayTotal.orders)}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {currencyFormat.format(dayTotal.revenue)}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {currencyFormat.format(dayTotal.payout)}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {currencyFormat.format(dayTotal.saleAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4">
        <LineChart
          title="Orders per day"
          yLabel="Orders"
          xLabel="Date"
          data={dayTotals.slice(0, chartDays).map((item, index) => ({
            label: dayLabels[index],
            value: item.orders
          }))}
        />
        <LineChart
          title="Revenue per day"
          yLabel="Revenue"
          xLabel="Date"
          data={dayTotals.slice(0, chartDays).map((item, index) => ({
            label: dayLabels[index],
            value: item.revenue
          }))}
        />
        <LineChart
          title="Payout per day"
          yLabel="Payout"
          xLabel="Date"
          data={dayTotals.slice(0, chartDays).map((item, index) => ({
            label: dayLabels[index],
            value: item.payout
          }))}
        />
        <LineChart
          title="Sale amount per day"
          yLabel="Sale Amount"
          xLabel="Date"
          data={dayTotals.slice(0, chartDays).map((item, index) => ({
            label: dayLabels[index],
            value: item.saleAmount
          }))}
        />
      </section>

      <section className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-5">
        <h2 className="mb-4 text-lg font-[var(--font-display)] tracking-tight">
          Last update by offer
        </h2>
        <div className="relative overflow-x-auto rounded-2xl border border-[color:var(--stroke)] bg-white/70">
          <table className="min-w-[520px] w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-[color:var(--paper-strong)] text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
              <tr>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">Offer</th>
                <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">Last Update</th>
              </tr>
            </thead>
            <tbody className="bg-white/60">
              {data.lastUpdates.map((item) => (
                <tr key={item.offer}>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {item.offer}
                  </td>
                  <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                    {item.label}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
