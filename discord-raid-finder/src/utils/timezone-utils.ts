export const TIMEZONE_MAP: Record<string, string> = {
  "America/Sao_Paulo": "Horário de Brasília",
  "America/New_York": "Eastern Time",
  "America/Chicago": "Central Time",
  "America/Denver": "Mountain Time",
  "America/Los_Angeles": "Pacific Time",
  "Europe/London": "British Time",
  "Europe/Paris": "Central European Time",
  "Europe/Berlin": "Central European Time",
  "Australia/Sydney": "Australian Eastern Time",
  "Australia/Melbourne": "Australian Eastern Time",
  "Asia/Tokyo": "Japan Standard Time",
  "Asia/Shanghai": "China Standard Time",
  UTC: "UTC",
};

export const TIMEZONE_ABBREVIATIONS: Record<string, string> = {
  "America/Sao_Paulo": "BRT",
  "America/New_York": "EST/EDT",
  "America/Chicago": "CST/CDT",
  "America/Denver": "MST/MDT",
  "America/Los_Angeles": "PST/PDT",
  "Europe/London": "GMT/BST",
  "Europe/Paris": "CET/CEST",
  "Europe/Berlin": "CET/CEST",
  "Australia/Sydney": "AEDT/AEST",
  "Australia/Melbourne": "AEDT/AEST",
  "Asia/Tokyo": "JST",
  "Asia/Shanghai": "CST",
  UTC: "UTC",
};

export const getTimezoneName = (timezone: string): string => {
  return TIMEZONE_MAP[timezone] || timezone;
};

export const formatDateWithTimezone = (
  dateStr: string,
  timezone: string
): string => {
  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    hour12: false,
  };

  const formatted = new Intl.DateTimeFormat("pt-BR", options).format(date);
  const timezoneName = getTimezoneName(timezone);

  return `${formatted} (${timezoneName})`;
};

export const formatDateShort = (dateStr: string, timezone: string): string => {
  const date = new Date(dateStr);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    hour12: false,
  };

  return new Intl.DateTimeFormat("pt-BR", options).format(date);
};
