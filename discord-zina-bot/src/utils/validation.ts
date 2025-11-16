import { EventRole } from "../types";

export const validateRoles = (roles: EventRole[]): void => {
  if (!Array.isArray(roles) || roles.length === 0) {
    throw new Error("At least one role must be defined");
  }

  for (const role of roles) {
    if (!role.name || typeof role.name !== "string") {
      throw new Error("Role name is required and must be a string");
    }

    if (
      !role.maxCount ||
      typeof role.maxCount !== "number" ||
      role.maxCount < 1
    ) {
      throw new Error("Role maxCount must be a positive number");
    }

    if (!role.emoji || typeof role.emoji !== "string") {
      throw new Error("Role emoji is required and must be a string");
    }
  }

  const roleNames = roles.map((r) => r.name);
  const uniqueNames = new Set(roleNames);
  if (roleNames.length !== uniqueNames.size) {
    throw new Error("Role names must be unique");
  }
};

export const validateNoticeMinutes = (noticeMinutes: number[]): void => {
  if (!Array.isArray(noticeMinutes) || noticeMinutes.length === 0) {
    throw new Error("At least one notice time must be specified");
  }

  for (const minutes of noticeMinutes) {
    if (typeof minutes !== "number" || minutes < 1) {
      throw new Error("Notice minutes must be positive numbers");
    }
  }
};

export const validateEventDates = (
  startDate: string,
  endDate?: string
): void => {
  const start = new Date(startDate);
  const now = new Date();

  if (start.getTime() <= now.getTime()) {
    throw new Error("Start date must be in the future");
  }

  if (endDate) {
    const end = new Date(endDate);
    if (end.getTime() <= start.getTime()) {
      throw new Error("End date must be after start date");
    }
  }
};
