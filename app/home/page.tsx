import { readFile } from "fs/promises";
import path from "path";
import DropAlertsTable from "@/components/drop-alerts-table";
import { buildDropAlerts, getMaxPastDay } from "@/lib/report";

export default async function Page() {
  const csvPath = path.join(
    process.cwd(),
    "Partnership Teams View_Performance Overview_Table (41).csv"
  );
  const csvText = await readFile(csvPath, "utf8");
  const dropReport = buildDropAlerts(csvText);
  const maxPastDay = getMaxPastDay(
    dropReport.monthIndex,
    dropReport.year,
    dropReport.daysInMonth
  );
  const alerts = dropReport.alerts.filter((alert) => alert.day <= maxPastDay);

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
            Home
          </p>
          <h1 className="text-3xl font-[var(--font-display)] tracking-tight md:text-5xl">
            50%+ drops from the previous day
          </h1>
          <p className="max-w-2xl text-sm text-[color:var(--ink-muted)] md:text-base">
            Codes that dropped at least 50% compared to the previous day.
          </p>
        </header>

        <section className="rounded-[32px] border border-[color:var(--stroke)] bg-[color:var(--card)]/80 p-5 shadow-[0_24px_60px_-40px_rgba(27,21,15,0.45)] md:p-8">
          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-[color:var(--stroke)] bg-white/80 p-6 text-sm text-[color:var(--ink-muted)]">
              No drops found for the selected month.
            </div>
          ) : (
            <DropAlertsTable alerts={alerts} />
          )}
        </section>
      </div>
    </main>
  );
}
