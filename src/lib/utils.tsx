import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and normalizes using Tailwind merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Media breakpoints used throughout the app
 * These should match the values in tailwind.config.js
 */
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Utility to create responsive styles for different screen sizes
 * @param baseStyles - Default styles for all screen sizes
 * @param responsiveStyles - Object containing styles for specific breakpoints
 * @returns Combined responsive class string
 */
export function responsive(
  baseStyles: string,
  responsiveStyles: Partial<Record<keyof typeof BREAKPOINTS, string>>
): string {
  let result = baseStyles;
  
  Object.entries(responsiveStyles).forEach(([breakpoint, styles]) => {
    if (styles) {
      const breakpointPrefix = breakpoint as keyof typeof BREAKPOINTS;
      result = `${result} ${breakpointPrefix}:${styles}`;
    }
  });
  
  return result;
}

/**
 * Truncates text to a specific length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Checks if the current device is likely a mobile device
 * This is a client-side only function
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < BREAKPOINTS.md;
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
} 