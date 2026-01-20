import { readFile } from "fs/promises";
import path from "path";
import { buildAnalysisData, getMaxPastDay } from "@/lib/report";

export default async function Page() {
  const csvPath = path.join(
    process.cwd(),
    "Partnership Teams View_Performance Overview_Table (41).csv"
  );
  const csvText = await readFile(csvPath, "utf8");
  const report = buildAnalysisData(csvText);
  const maxPastDay = getMaxPastDay(report.monthIndex, report.year, report.daysInMonth);
  const days = Array.from({ length: report.daysInMonth }, (_, index) => index + 1);

  const offerMap = new Map<
    string,
    { counts: number[]; total: number; nonZeroDays: number }
  >();

  for (const row of report.rows) {
    let entry = offerMap.get(row.offer);
    if (!entry) {
      entry = {
        counts: Array.from({ length: report.daysInMonth }, () => 0),
        total: 0,
        nonZeroDays: 0
      };
      offerMap.set(row.offer, entry);
    }
    entry.counts[row.day - 1] += 1;
    entry.total += 1;
  }

  for (const entry of offerMap.values()) {
    entry.nonZeroDays = entry.counts.filter((value) => value > 0).length;
  }

  const offers = Array.from(offerMap.entries())
    .map(([offer, data]) => ({
      offer,
      counts: data.counts,
      total: data.total,
      avg: data.nonZeroDays ? data.total / data.nonZeroDays : 0
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
            Offer performance
          </p>
          <h1 className="text-3xl font-[var(--font-display)] tracking-tight md:text-5xl">
            Offer performance summary
          </h1>
          <p className="max-w-2xl text-sm text-[color:var(--ink-muted)] md:text-base">
            Daily orders per offer for {report.monthLabel || "the month"}, colored by
            each offer's average.
          </p>
        </header>

        <section className="rounded-[32px] border border-[color:var(--stroke)] bg-[color:var(--card)]/80 p-5 shadow-[0_24px_60px_-40px_rgba(27,21,15,0.45)] md:p-8">
          {offers.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-6 text-sm text-[color:var(--ink-muted)]">
              No rows found for the selected month.
            </div>
          ) : (
            <div className="relative overflow-x-auto rounded-2xl border border-[color:var(--stroke)] bg-white/70">
              <table className="min-w-[900px] w-full border-separate border-spacing-0 text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[color:var(--paper-strong)] text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
                  <tr>
                    <th className="border-b border-[color:var(--stroke)] px-4 py-3 text-left">
                      Offer
                    </th>
                    {days.map((day) => (
                      <th
                        key={`day-${day}`}
                        className="border-b border-[color:var(--stroke)] px-3 py-3 text-center"
                      >
                        {day}
                      </th>
                    ))}
                    <th className="border-b border-[color:var(--stroke)] px-3 py-3 text-center">
                      Avg
                    </th>
                    <th className="border-b border-[color:var(--stroke)] px-3 py-3 text-center">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/60">
                  {offers.map((offer) => (
                    <tr key={offer.offer}>
                      <td className="border-b border-[color:var(--stroke)] px-4 py-2 text-[color:var(--ink)]">
                        {offer.offer}
                      </td>
                      {offer.counts.map((value, index) => {
                        const day = index + 1;
                        const ratio = offer.avg > 0 ? value / offer.avg : 1;
                        const isLowAvg = ratio < 0.75 && ratio >= 0.5;
                        const isVeryLowAvg = ratio < 0.5;
                        const isHighAvg = ratio > 1.4;
                        const isFutureDay = day > maxPastDay;

                        return (
                          <td
                            key={`${offer.offer}-${day}`}
                            className={
                              "border-b border-[color:var(--stroke)] px-3 py-2 text-center tabular-nums text-[color:var(--ink)]" +
                              (!isFutureDay && isVeryLowAvg
                                ? " bg-rose-300 text-rose-900 font-semibold"
                                : "") +
                              (!isFutureDay && !isVeryLowAvg && isLowAvg
                                ? " bg-rose-100 text-rose-800 font-semibold"
                                : "") +
                              (!isFutureDay && !isVeryLowAvg && !isLowAvg && isHighAvg
                                ? " bg-emerald-100 text-emerald-800 font-semibold"
                                : "")
                            }
                          >
                            {value === 0 ? "–" : value}
                          </td>
                        );
                      })}
                      <td className="border-b border-[color:var(--stroke)] px-3 py-2 text-center font-semibold text-[color:var(--ink)]">
                        {offer.avg === 0 ? "–" : offer.avg.toFixed(1)}
                      </td>
                      <td className="border-b border-[color:var(--stroke)] px-3 py-2 text-center font-semibold text-[color:var(--ink)]">
                        {offer.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
