import { readFile } from "fs/promises";
import path from "path";
import AnalysisDashboard from "@/components/analysis-dashboard";
import { buildAnalysisData } from "@/lib/report";

export default async function Page() {
  const csvPath = path.join(
    process.cwd(),
    "Partnership Teams View_Performance Overview_Table (40).csv"
  );
  const csvText = await readFile(csvPath, "utf8");
  const data = buildAnalysisData(csvText);

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-normal text-[color:var(--ink-muted)]">
            Analysis
          </p>
          <h1 className="text-3xl font-[var(--font-display)] tracking-tight md:text-5xl">
            Offer performance analysis
          </h1>
          <p className="max-w-2xl text-sm text-[color:var(--ink-muted)] md:text-base">
            Slice the data by offer, affiliate, code, date, and geo. Review KPIs, daily
            trends, and the latest update for each offer.
          </p>
        </header>

        <AnalysisDashboard data={data} />
      </div>
    </main>
  );
}
