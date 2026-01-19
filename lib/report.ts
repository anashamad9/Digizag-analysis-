export type CodeSummary = {
  code: string;
  counts: number[];
  total: number;
};

export type OfferSummary = {
  offer: string;
  total: number;
  codes: CodeSummary[];
};

export type OfferReport = {
  offers: OfferSummary[];
  daysInMonth: number;
  monthLabel: string;
  monthIndex: number | null;
  year: number | null;
};

export type DropAlert = {
  offer: string;
  partner: string;
  code: string;
  day: number;
  prevDay: number;
  dayLabel: string;
  prevDayLabel: string;
  dayCount: number;
  prevDayCount: number;
};

export type AnalysisRow = {
  offer: string;
  partner: string;
  code: string;
  day: number;
  geo: string;
  payout: number;
  revenue: number;
  saleAmount: number;
};

export type OfferLastUpdate = {
  offer: string;
  day: number;
  label: string;
};

export type AnalysisData = {
  rows: AnalysisRow[];
  offers: string[];
  affiliates: string[];
  codes: string[];
  geos: string[];
  daysInMonth: number;
  monthIndex: number | null;
  year: number | null;
  monthLabel: string;
  lastUpdates: OfferLastUpdate[];
};

const MONTHS: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11
};

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function parseCsvLine(line: string) {
  const result: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(value);
      value = "";
      continue;
    }

    value += char;
  }

  result.push(value);
  return result;
}

function parseDateParts(dateStr: string) {
  const cleaned = dateStr.replace(/\s+/g, " ").trim();
  const match = cleaned.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) {
    return null;
  }

  const monthIndex = MONTHS[match[1]];
  const day = Number(match[2]);
  const year = Number(match[3]);

  if (monthIndex === undefined || Number.isNaN(day) || Number.isNaN(year)) {
    return null;
  }

  return { monthIndex, day, year };
}

export function buildOfferReport(csvText: string): OfferReport {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { offers: [], daysInMonth: 31, monthLabel: "", monthIndex: null, year: null };
  }

  const header = parseCsvLine(lines[0]).map((value) => value.trim());
  const offerIndex = header.indexOf("Offer Name");
  const dateIndex = header.indexOf("Date");
  const codeIndex = header.indexOf("Code");

  if (offerIndex === -1 || dateIndex === -1 || codeIndex === -1) {
    return { offers: [], daysInMonth: 31, monthLabel: "", monthIndex: null, year: null };
  }

  let targetMonthKey: string | null = null;
  let daysInMonth = 31;
  let monthLabel = "";
  let monthIndex: number | null = null;
  let year: number | null = null;

  const offerMap = new Map<string, { total: number; codes: Map<string, number[]> }>();

  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const offer = row[offerIndex]?.trim();
    const code = row[codeIndex]?.trim();
    const dateStr = row[dateIndex]?.trim();

    if (!offer || !code || !dateStr) {
      continue;
    }

    const parsed = parseDateParts(dateStr);
    if (!parsed) {
      continue;
    }

    const { monthIndex: parsedMonthIndex, day, year: parsedYear } = parsed;
    const monthKey = `${parsedYear}-${parsedMonthIndex}`;

    if (!targetMonthKey) {
      targetMonthKey = monthKey;
      daysInMonth = new Date(parsedYear, parsedMonthIndex + 1, 0).getDate();
      monthLabel = `${MONTH_LABELS[parsedMonthIndex]} ${parsedYear}`;
      monthIndex = parsedMonthIndex;
      year = parsedYear;
    }

    if (monthKey !== targetMonthKey || day < 1 || day > daysInMonth) {
      continue;
    }

    let offerEntry = offerMap.get(offer);
    if (!offerEntry) {
      offerEntry = { total: 0, codes: new Map() };
      offerMap.set(offer, offerEntry);
    }

    let counts = offerEntry.codes.get(code);
    if (!counts) {
      counts = Array.from({ length: daysInMonth }, () => 0);
      offerEntry.codes.set(code, counts);
    }

    counts[day - 1] += 1;
    offerEntry.total += 1;
  }

  const offers = Array.from(offerMap.entries()).map(([offer, data]) => {
    const codes = Array.from(data.codes.entries())
      .map(([code, counts]) => ({
        code,
        counts,
        total: counts.reduce((sum, value) => sum + value, 0)
      }))
      .sort((a, b) => {
        if (b.total !== a.total) return b.total - a.total;
        return a.code.localeCompare(b.code);
      });

    return { offer, total: data.total, codes };
  });

  offers.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    return a.offer.localeCompare(b.offer);
  });

  return { offers, daysInMonth, monthLabel, monthIndex, year };
}

export function getMaxPastDay(
  monthIndex: number | null,
  year: number | null,
  daysInMonth: number
) {
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
}

export function buildDropAlerts(csvText: string, maxPastDay?: number) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return {
      alerts: [] as DropAlert[],
      monthLabel: "",
      monthIndex: null as number | null,
      year: null as number | null,
      daysInMonth: 31
    };
  }

  const header = parseCsvLine(lines[0]).map((value) => value.trim());
  const offerIndex = header.indexOf("Offer Name");
  const partnerIndex = header.indexOf("Partner");
  const dateIndex = header.indexOf("Date");
  const codeIndex = header.indexOf("Code");

  if (offerIndex === -1 || partnerIndex === -1 || dateIndex === -1 || codeIndex === -1) {
    return {
      alerts: [] as DropAlert[],
      monthLabel: "",
      monthIndex: null as number | null,
      year: null as number | null,
      daysInMonth: 31
    };
  }

  let targetMonthKey: string | null = null;
  let daysInMonth = 31;
  let monthLabel = "";
  let monthIndex: number | null = null;
  let year: number | null = null;

  const keyMap = new Map<string, { offer: string; partner: string; code: string; counts: number[] }>();
  const offerTotals = new Map<string, number[]>();

  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const offer = row[offerIndex]?.trim();
    const partner = row[partnerIndex]?.trim();
    const code = row[codeIndex]?.trim();
    const dateStr = row[dateIndex]?.trim();

    if (!offer || !partner || !code || !dateStr) {
      continue;
    }

    const parsed = parseDateParts(dateStr);
    if (!parsed) {
      continue;
    }

    const { monthIndex: parsedMonthIndex, day, year: parsedYear } = parsed;
    const monthKey = `${parsedYear}-${parsedMonthIndex}`;

    if (!targetMonthKey) {
      targetMonthKey = monthKey;
      daysInMonth = new Date(parsedYear, parsedMonthIndex + 1, 0).getDate();
      monthLabel = `${MONTH_LABELS[parsedMonthIndex]} ${parsedYear}`;
      monthIndex = parsedMonthIndex;
      year = parsedYear;
    }

    if (monthKey !== targetMonthKey || day < 1 || day > daysInMonth) {
      continue;
    }

    const key = `${offer}__${partner}__${code}`;
    let entry = keyMap.get(key);
    if (!entry) {
      entry = {
        offer,
        partner,
        code,
        counts: Array.from({ length: daysInMonth }, () => 0)
      };
      keyMap.set(key, entry);
    }

    entry.counts[day - 1] += 1;

    let offerCounts = offerTotals.get(offer);
    if (!offerCounts) {
      offerCounts = Array.from({ length: daysInMonth }, () => 0);
      offerTotals.set(offer, offerCounts);
    }
    offerCounts[day - 1] += 1;
  }

  const maxDay = maxPastDay ?? daysInMonth;
  const alerts: DropAlert[] = [];
  const alertKeys = new Set<string>();
  const monthName = monthIndex !== null ? MONTH_LABELS[monthIndex] : "";
  const yearLabel = year !== null ? ` ${year}` : "";

  for (const entry of keyMap.values()) {
    const totalOrders = entry.counts.reduce((sum, value) => sum + value, 0);
    if (totalOrders < 5) {
      continue;
    }
    for (let day = 2; day <= daysInMonth; day += 1) {
      if (day > maxDay) {
        continue;
      }
      const prevCount = entry.counts[day - 2];
      const count = entry.counts[day - 1];

      const offerCounts = offerTotals.get(entry.offer);
      const offerHasSalesNextDay = Boolean(offerCounts && offerCounts[day - 1] > 0);
      const isDrop = prevCount > 20 && count <= prevCount * 0.5;
      const isZeroAfterSales = prevCount >= 6 && count === 0 && offerHasSalesNextDay;
      const shouldInclude = offerHasSalesNextDay && (isDrop || isZeroAfterSales);

      if (shouldInclude) {
        const alertKey = `${entry.offer}__${entry.partner}__${entry.code}__${day}`;
        if (alertKeys.has(alertKey)) {
          continue;
        }
        alertKeys.add(alertKey);
        alerts.push({
          offer: entry.offer,
          partner: entry.partner,
          code: entry.code,
          day,
          prevDay: day - 1,
          dayLabel: `${monthName} ${day}${yearLabel}`,
          prevDayLabel: `${monthName} ${day - 1}${yearLabel}`,
          dayCount: count,
          prevDayCount: prevCount
        });
      }
    }
  }

  alerts.sort((a, b) => b.day - a.day);
  return { alerts, monthLabel, monthIndex, year, daysInMonth };
}

function toNumber(value: string | undefined) {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function buildAnalysisData(csvText: string): AnalysisData {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return {
      rows: [],
      offers: [],
      affiliates: [],
      codes: [],
      geos: [],
      daysInMonth: 31,
      monthIndex: null,
      year: null,
      monthLabel: "",
      lastUpdates: []
    };
  }

  const header = parseCsvLine(lines[0]).map((value) => value.trim());
  const offerIndex = header.indexOf("Offer Name");
  const partnerIndex = header.indexOf("Partner");
  const dateIndex = header.indexOf("Date");
  const codeIndex = header.indexOf("Code");
  const geoIndex = header.indexOf("Lower_Geo");
  const payoutIndex = header.indexOf("Payout");
  const revenueIndex = header.indexOf("Revenue");
  const saleAmountIndex = header.indexOf("Sale Amount");

  if (
    offerIndex === -1 ||
    partnerIndex === -1 ||
    dateIndex === -1 ||
    codeIndex === -1 ||
    geoIndex === -1 ||
    payoutIndex === -1 ||
    revenueIndex === -1 ||
    saleAmountIndex === -1
  ) {
    return {
      rows: [],
      offers: [],
      affiliates: [],
      codes: [],
      geos: [],
      daysInMonth: 31,
      monthIndex: null,
      year: null,
      monthLabel: "",
      lastUpdates: []
    };
  }

  let targetMonthKey: string | null = null;
  let daysInMonth = 31;
  let monthLabel = "";
  let monthIndex: number | null = null;
  let year: number | null = null;

  const rows: AnalysisRow[] = [];
  const offersSet = new Set<string>();
  const affiliatesSet = new Set<string>();
  const codesSet = new Set<string>();
  const geosSet = new Set<string>();
  const offerLastDay = new Map<string, number>();

  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const offer = row[offerIndex]?.trim();
    const partner = row[partnerIndex]?.trim();
    const code = row[codeIndex]?.trim();
    const dateStr = row[dateIndex]?.trim();
    const geo = row[geoIndex]?.trim() || "no-geo";

    if (!offer || !partner || !code || !dateStr) {
      continue;
    }

    const parsed = parseDateParts(dateStr);
    if (!parsed) {
      continue;
    }

    const { monthIndex: parsedMonthIndex, day, year: parsedYear } = parsed;
    const monthKey = `${parsedYear}-${parsedMonthIndex}`;

    if (!targetMonthKey) {
      targetMonthKey = monthKey;
      daysInMonth = new Date(parsedYear, parsedMonthIndex + 1, 0).getDate();
      monthLabel = `${MONTH_LABELS[parsedMonthIndex]} ${parsedYear}`;
      monthIndex = parsedMonthIndex;
      year = parsedYear;
    }

    if (monthKey !== targetMonthKey || day < 1 || day > daysInMonth) {
      continue;
    }

    rows.push({
      offer,
      partner,
      code,
      day,
      geo,
      payout: toNumber(row[payoutIndex]),
      revenue: toNumber(row[revenueIndex]),
      saleAmount: toNumber(row[saleAmountIndex])
    });

    offersSet.add(offer);
    affiliatesSet.add(partner);
    codesSet.add(code);
    geosSet.add(geo);

    const currentLast = offerLastDay.get(offer) ?? 0;
    if (day > currentLast) {
      offerLastDay.set(offer, day);
    }
  }

  const offers = Array.from(offersSet).sort();
  const affiliates = Array.from(affiliatesSet).sort();
  const codes = Array.from(codesSet).sort();
  const geos = Array.from(geosSet).sort();

  const lastUpdates = Array.from(offerLastDay.entries())
    .map(([offer, day]) => ({
      offer,
      day,
      label: `${MONTH_LABELS[monthIndex ?? 0]} ${day}${year ? ` ${year}` : ""}`
    }))
    .sort((a, b) => b.day - a.day);

  return {
    rows,
    offers,
    affiliates,
    codes,
    geos,
    daysInMonth,
    monthIndex,
    year,
    monthLabel,
    lastUpdates
  };
}
