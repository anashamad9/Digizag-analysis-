import { readFile } from "fs/promises";
import path from "path";
import OfferTabs from "@/components/offer-tabs";
import { buildOfferReport } from "@/lib/report";

export default async function Page() {
  const csvPath = path.join(
    process.cwd(),
    "Partnership Teams View_Performance Overview_Table (40).csv"
  );
  const csvText = await readFile(csvPath, "utf8");
  const report = buildOfferReport(csvText);

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
            Code performance
          </p>
          <h1 className="text-3xl font-[var(--font-display)] tracking-tight md:text-5xl">
            Code performance by day
          </h1>
          <p className="max-w-2xl text-sm text-[color:var(--ink-muted)] md:text-base">
            Tabs group each offer. Inside, every coupon code shows its daily conversion
            count across the month.
          </p>
        </header>

        <section className="rounded-[32px] border border-[color:var(--stroke)] bg-[color:var(--card)]/80 p-5 shadow-[0_24px_60px_-40px_rgba(27,21,15,0.45)] md:p-8">
          <OfferTabs
            offers={report.offers}
            daysInMonth={report.daysInMonth}
            monthLabel={report.monthLabel}
            monthIndex={report.monthIndex}
            year={report.year}
          />
        </section>
      </div>
    </main>
  );
}
