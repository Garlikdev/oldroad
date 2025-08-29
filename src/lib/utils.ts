import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import moment from "moment-timezone"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Polish timezone utilities
export const POLISH_TIMEZONE = "Europe/Warsaw"

/**
 * Get the current date in Polish timezone
 */
export function getCurrentDateInPoland(): Date {
  return moment.tz(POLISH_TIMEZONE).toDate()
}

/**
 * Get today's date string in Polish timezone (YYYY-MM-DD format)
 */
export function getTodayInPoland(): string {
  return moment.tz(POLISH_TIMEZONE).format("YYYY-MM-DD")
}

/**
 * Get the start of today in Polish timezone
 */
export function getStartOfTodayInPoland(): Date {
  return moment.tz(POLISH_TIMEZONE).startOf("day").toDate()
}

/**
 * Get the end of today in Polish timezone
 */
export function getEndOfTodayInPoland(): Date {
  return moment.tz(POLISH_TIMEZONE).endOf("day").toDate()
}

/**
 * Check if a given date is today in Polish timezone
 */
export function isTodayInPoland(date: Date): boolean {
  const today = getTodayInPoland()
  const dateInPoland = moment.tz(date, POLISH_TIMEZONE).format("YYYY-MM-DD")
  return dateInPoland === today
}

/**
 * Format a date for display in Polish timezone
 */
export function formatDateInPoland(date: Date, format: string = "YYYY-MM-DD"): string {
  return moment.tz(date, POLISH_TIMEZONE).format(format)
}
