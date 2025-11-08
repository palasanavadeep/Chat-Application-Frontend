import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a plain Base64 string into a valid Data URL.
 * 
 * @param base64String - The Base64 string (without prefix)
 * @param mimeType - Optional MIME type (default: 'image/png')
 * @returns Data URL string (e.g. "data:image/png;base64,AAAA...")
 */
export function base64ToDataUrl(base64String: string, mimeType = 'image/*'): string {
  if (!base64String) {
    throw new Error('base64ToDataUrl: input base64 string is empty or undefined')
  }

  // remove accidental prefix if already a data URL
  if (base64String.startsWith('data:')) {
    return base64String
  }

  // ensure no line breaks or spaces
  const cleanBase64 = base64String.replace(/\s/g, '')

  return `data:${mimeType};base64,${cleanBase64}`
}

/**
 * Formats a millisecond timestamp into a locale-aware date and time string.
 *
 * Converts a numeric millisecond value (milliseconds since the Unix epoch) to a
 * Date object and returns a localized string representation using the runtime's
 * locale and timezone via Date.prototype.toLocaleString().
 *
 * @param millis - Number of milliseconds since 1970-01-01T00:00:00Z.
 * @returns A locale-formatted date and time string (uses the client's locale and timezone).
 * @throws {Error} If `millis` is not a finite number (e.g., undefined, null, NaN, or a non-number).
 */
function formatMillisToLocalDateTime(millis : number) {
  if (typeof millis !== 'number' || isNaN(millis)) {
    throw new Error("Invalid input: millis must be a number");
  }

  const date = new Date(millis);
  return date.toLocaleString(); // uses the client’s local timezone by default
}


/**
 * Convert a File object to a Base64-encoded data URL.
 * 
 * @param file - The File to read and encode as a Base64 data URL.
 * @returns A Promise that resolves with the FileReader result which is typically
 *          a string containing the data URL. In rare cases the result may be null
 *          (e.g. if no data was read). The resolved value type is the raw
 *          FileReader.result (string | ArrayBuffer | null), but when using
 *          readAsDataURL it will normally be a string.
 * @throws Will reject the returned Promise if FileReader encounters an error.
 */
export const getBase64StringFromFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string; // FileReader.result is string | ArrayBuffer
      // Strip "data:<mime>;base64," prefix so you only get the base64 content
      const base64 = result.split(",")[1];
      resolve(base64);
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

