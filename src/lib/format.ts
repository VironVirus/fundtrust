import { format } from "date-fns";

export const APP_LOCALE = "en-NG";
export const APP_TIME_ZONE = "Africa/Lagos";

const currencyNumberFormatter = new Intl.NumberFormat(APP_LOCALE, {
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat(APP_LOCALE, {
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  const normalized = Number.isFinite(value) ? value : 0;
  const sign = normalized < 0 ? "-" : "";
  return `${sign}N${currencyNumberFormatter.format(Math.abs(normalized))}`;
}

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(APP_LOCALE, {
    dateStyle: "medium",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatDateTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(APP_LOCALE, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function formatTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(APP_LOCALE, {
    timeStyle: "short",
    timeZone: APP_TIME_ZONE,
  }).format(date);
}

export function getNowIsoString() {
  return new Date().toISOString();
}

export function getCalendarDate(value: Date | string = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not format the calendar date for the application timezone.");
  }

  return `${year}-${month}-${day}`;
}

export function isDateWithinRange(
  value: Date | string,
  startDate?: string,
  endDate?: string,
) {
  const calendarDate = getCalendarDate(value);

  if (startDate && calendarDate < startDate) {
    return false;
  }

  if (endDate && calendarDate > endDate) {
    return false;
  }

  return true;
}

export function coerceNumber(value: unknown) {
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDayStamp(value: Date | string = new Date()) {
  return format(value instanceof Date ? value : new Date(value), "yyyy-MM-dd");
}

const monthNames = [
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
  "December",
];

function getOrdinalSuffix(day: number) {
  const remainder = day % 100;

  if (remainder >= 11 && remainder <= 13) {
    return "th";
  }

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function getCalendarDateParts(value: Date | string) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);

    return { year, month, day };
  }

  const calendarDate = getCalendarDate(value);
  const [year, month, day] = calendarDate.split("-").map(Number);

  return { year, month, day };
}

export function formatLongDateWithOrdinal(value: Date | string) {
  const { year, month, day } = getCalendarDateParts(value);
  return `${monthNames[month - 1]} ${day}${getOrdinalSuffix(day)}, ${year}`;
}

export function sanitizeFilenameSegment(value: string) {
  return value
    .replace(/[<>:"/\\|?*]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createDailyReportFileName(marketerName: string, value: Date | string) {
  const safeMarketerName = sanitizeFilenameSegment(marketerName) || "Marketer";
  return `${safeMarketerName} Daily Report for ${formatLongDateWithOrdinal(value)}`;
}

const smallNumberWords = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const tensWords = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

function numberBelowOneThousandToWords(value: number): string {
  if (value < 20) {
    return smallNumberWords[value];
  }

  if (value < 100) {
    const tens = Math.floor(value / 10);
    const remainder = value % 10;
    return remainder
      ? `${tensWords[tens]}-${smallNumberWords[remainder]}`
      : tensWords[tens];
  }

  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;
  const prefix = `${smallNumberWords[hundreds]} hundred`;

  return remainder
    ? `${prefix} ${numberBelowOneThousandToWords(remainder)}`
    : prefix;
}

function wholeNumberToWords(value: number): string {
  if (value === 0) {
    return "zero";
  }

  const scales = [
    { size: 1_000_000_000, label: "billion" },
    { size: 1_000_000, label: "million" },
    { size: 1_000, label: "thousand" },
  ] as const;

  let remainder = value;
  const words: string[] = [];

  for (const scale of scales) {
    if (remainder >= scale.size) {
      const chunk = Math.floor(remainder / scale.size);
      words.push(`${numberBelowOneThousandToWords(chunk)} ${scale.label}`);
      remainder %= scale.size;
    }
  }

  if (remainder > 0) {
    words.push(numberBelowOneThousandToWords(remainder));
  }

  return words.join(" ");
}

export function formatCurrencyInWords(value: number) {
  const normalized = Number.isFinite(value) ? Math.max(0, value) : 0;
  const whole = Math.floor(normalized);
  const kobo = Math.round((normalized - whole) * 100);
  const nairaWords = `${wholeNumberToWords(whole)} naira`;

  if (kobo > 0) {
    return `${nairaWords} and ${wholeNumberToWords(kobo)} kobo only`.toUpperCase();
  }

  return `${nairaWords} only`.toUpperCase();
}
