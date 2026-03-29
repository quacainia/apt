import { format, parseISO } from "date-fns";

export function formatDate(
  dateString: string,
  formatStr: string = "MMM d, yyyy",
): string {
  try {
    return format(parseISO(dateString), formatStr);
  } catch {
    return dateString;
  }
}

export function formatMonth(dateString: string): string {
  try {
    return format(parseISO(dateString), "MMMM yyyy");
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string): string {
  try {
    return format(parseISO(dateString), "HH:mm");
  } catch {
    return dateString;
  }
}

export function getMonthKey(dateString: string): string {
  try {
    return format(parseISO(dateString), "yyyy-MM");
  } catch {
    return dateString.slice(0, 7);
  }
}

export function getYear(dateString: string): string {
  try {
    return format(parseISO(dateString), "yyyy");
  } catch {
    return dateString.slice(0, 4);
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function formatViewCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return (count / 1000).toFixed(1) + "K";
  return (count / 1000000).toFixed(1) + "M";
}

export function formatRating(rating: number | undefined): string {
  if (rating === undefined || rating === null) return "—";
  return (Math.round(rating * 2) / 2).toFixed(1);
}
