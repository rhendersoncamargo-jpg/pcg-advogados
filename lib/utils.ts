import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Official System Timezone Constant
export const SYSTEM_TIMEZONE = 'America/Campo_Grande';
export const SYSTEM_TIMEZONE_LABEL = 'UTC-4 (Horário de Campo Grande / AMT)';

/**
 * Formats date and time into Campo Grande (MS) local time string (DD/MM/YYYY HH:mm:ss).
 */
export function formatCampoGrandeDateTime(
  dateInput?: string | Date | number | null,
  includeSeconds = true
): string {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: SYSTEM_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {}),
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats a date into DD/MM/YYYY in Campo Grande (MS) timezone.
 */
export function formatCampoGrandeDate(dateInput?: string | Date | number | null): string {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: SYSTEM_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Formats time into HH:mm in Campo Grande (MS) timezone.
 */
export function formatCampoGrandeTime(dateInput?: string | Date | number | null): string {
  if (!dateInput) return '-';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: SYSTEM_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

