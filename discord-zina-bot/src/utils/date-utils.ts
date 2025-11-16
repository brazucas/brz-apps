export const parseDateTime = (dateTimeStr: string): Date => {
  if (dateTimeStr.includes("T")) {
    return new Date(dateTimeStr);
  }

  const [datePart, timePart] = dateTimeStr.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute);
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  return `${hours} hour${
    hours !== 1 ? "s" : ""
  } and ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
};

export const calculateTTL = (endDate: string | undefined): number => {
  if (!endDate) {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    return Math.floor(oneWeekFromNow.getTime() / 1000);
  }

  const end = new Date(endDate);
  const oneDayAfterEnd = new Date(end);
  oneDayAfterEnd.setDate(oneDayAfterEnd.getDate() + 1);

  return Math.floor(oneDayAfterEnd.getTime() / 1000);
};
