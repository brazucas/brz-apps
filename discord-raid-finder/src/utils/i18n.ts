export type Language = "en" | "pt";

type Translations = {
  [key: string]: {
    en: string;
    pt: string;
  };
};

const translations: Translations = {
  noSignups: {
    en: "No signups",
    pt: "Nenhum registro",
  },
  noBench: {
    en: "No one on bench",
    pt: "Ninguém no banco",
  },
  signups: {
    en: "Signups",
    pt: "Inscritos",
  },
  bench: {
    en: "Bench",
    pt: "Banco",
  },
  startTime: {
    en: "Start Time",
    pt: "Hora de Início",
  },
  endTime: {
    en: "End Time",
    pt: "Hora de Término",
  },
  cancelled: {
    en: "CANCELLED",
    pt: "CANCELADO",
  },
  eventCancelled: {
    en: "This event has been cancelled.",
    pt: "Este evento foi cancelado.",
  },
  signedUp: {
    en: "You have been signed up!",
    pt: "Você foi inscrito!",
  },
  removed: {
    en: "You have been removed from the event.",
    pt: "Você foi removido do evento.",
  },
  noPermission: {
    en: "You do not have permission to create events.",
    pt: "Você não tem permissão para criar eventos.",
  },
  noPermissionEdit: {
    en: "You don't have permission to edit events.",
    pt: "Você não tem permissão para editar eventos.",
  },
  noPermissionCancel: {
    en: "You don't have permission to cancel events.",
    pt: "Você não tem permissão para cancelar eventos.",
  },
  eventCreated: {
    en: "Event created successfully! Event ID:",
    pt: "Evento criado com sucesso! ID do Evento:",
  },
  eventUpdated: {
    en: "has been updated!",
    pt: "foi atualizado!",
  },
  eventCancelledSuccess: {
    en: "has been cancelled.",
    pt: "foi cancelado.",
  },
  eventNotFound: {
    en: "Event not found.",
    pt: "Evento não encontrado.",
  },
  eventNotFoundGuild: {
    en: "Event not found in this guild.",
    pt: "Evento não encontrado neste servidor.",
  },
  noUpcomingEvents: {
    en: "No upcoming events.",
    pt: "Nenhum evento futuro.",
  },
  upcomingEvents: {
    en: "Upcoming Events:",
    pt: "Eventos Futuros:",
  },
  starts: {
    en: "Starts:",
    pt: "Início:",
  },
  invalidRoles: {
    en: "Invalid roles:",
    pt: "Funções inválidas:",
  },
  invalidRolesFormat: {
    en: "Invalid roles format",
    pt: "Formato de funções inválido",
  },
  invalidNoticeMinutes: {
    en: "Invalid notice minutes:",
    pt: "Minutos de aviso inválidos:",
  },
  invalidStartDateFormat: {
    en: "Invalid start date format",
    pt: "Formato de data de início inválido",
  },
  invalidEndDateFormat: {
    en: "Invalid end date format",
    pt: "Formato de data de término inválido",
  },
  dateValidationError: {
    en: "Date validation error:",
    pt: "Erro de validação de data:",
  },
  error: {
    en: "Error:",
    pt: "Erro:",
  },
  reminderTitle: {
    en: "Raid Reminder",
    pt: "Lembrete de Raid",
  },
  reminderDescription: {
    en: "starts in",
    pt: "começa em",
  },
  minutes: {
    en: "minutes",
    pt: "minutos",
  },
  minute: {
    en: "minute",
    pt: "minuto",
  },
  in: {
    en: "In",
    pt: "Em",
  },
  hours: {
    en: "hours",
    pt: "horas",
  },
  hour: {
    en: "hour",
    pt: "hora",
  },
  days: {
    en: "days",
    pt: "dias",
  },
  day: {
    en: "day",
    pt: "dia",
  },
  now: {
    en: "Starting now!",
    pt: "Começando agora!",
  },
  eventStarted: {
    en: "Event started",
    pt: "Evento iniciado",
  },
};

export const t = (key: string, language: Language = "en"): string => {
  return translations[key]?.[language] || key;
};

export const formatMinutes = (
  minutes: number,
  language: Language = "en"
): string => {
  const minuteText =
    minutes === 1 ? t("minute", language) : t("minutes", language);
  return `${minutes} ${minuteText}`;
};

export const formatRelativeTime = (
  targetDate: string,
  language: Language = "en"
): string => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) {
    return t("eventStarted", language);
  }

  if (diffMs < 60000) {
    return t("now", language);
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays > 0) {
    const dayText = diffDays === 1 ? t("day", language) : t("days", language);
    return `${t("in", language)} ${diffDays} ${dayText}`;
  }

  if (diffHours > 0) {
    const hourText =
      diffHours === 1 ? t("hour", language) : t("hours", language);
    return `${t("in", language)} ${diffHours} ${hourText}`;
  }

  const minuteText =
    diffMinutes === 1 ? t("minute", language) : t("minutes", language);
  return `${t("in", language)} ${diffMinutes} ${minuteText}`;
};
