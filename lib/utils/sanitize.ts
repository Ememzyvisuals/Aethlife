/**
 * AethLife — Input Sanitization & Validation Utilities
 * Applied to all user-facing inputs before DB writes.
 */

/** Strip dangerous HTML/script tags from any string */
export function sanitizeString(input: string, maxLength = 500): string {
  return input
    .replace(/<[^>]*>/g, '')           // Remove HTML tags
    .replace(/javascript:/gi, '')       // Remove JS protocol
    .replace(/on\w+\s*=/gi, '')        // Remove event handlers
    .replace(/data:/gi, '')            // Remove data URIs
    .trim()
    .slice(0, maxLength);
}

/** Sanitize an object's string values recursively */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    const val = result[key];
    if (typeof val === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeString(val);
    } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(val as Record<string, unknown>);
    }
  }
  return result;
}

/** Validate that a number is within bounds */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Safely parse a number — returns null on failure */
export function safeParseNumber(value: unknown): number | null {
  const n = Number(value);
  return isNaN(n) || !isFinite(n) ? null : n;
}

/** Validate UUID format */
export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

/** Validate date string is a real YYYY-MM-DD date */
export function isValidDate(str: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return !isNaN(d.getTime()) && d.toISOString().startsWith(str);
}

/** Validate image MIME type for receipt uploads */
export function isAllowedImageType(mimeType: string): boolean {
  return ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(mimeType.toLowerCase());
}

/** Validate base64 image size (in bytes) */
export function validateBase64ImageSize(base64: string, maxMB = 5): boolean {
  const bytes = (base64.length * 3) / 4;
  return bytes <= maxMB * 1024 * 1024;
}

/** Safe JSON parse — returns null on failure instead of throwing */
export function safeJsonParse<T = unknown>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

/** Normalize currency to valid enum */
export function normalizeCurrency(currency: unknown): 'NGN' | 'USD' | 'EUR' | 'GBP' {
  const valid = ['NGN', 'USD', 'EUR', 'GBP'];
  return valid.includes(String(currency)) ? (String(currency) as 'NGN' | 'USD' | 'EUR' | 'GBP') : 'NGN';
}

/** Verify amount is a valid positive number within safe bounds */
export function validateAmount(amount: unknown): { valid: boolean; value: number } {
  const n = safeParseNumber(amount);
  if (n === null || n <= 0 || n > 999_999_999) return { valid: false, value: 0 };
  return { valid: true, value: Math.round(n * 100) / 100 };
}
