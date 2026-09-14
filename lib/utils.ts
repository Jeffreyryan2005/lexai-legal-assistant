/**
 * @fileoverview Utility functions for class name composition.
 * Uses clsx for conditional classes and tailwind-merge to resolve conflicts.
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes with proper conflict resolution.
 * Example: cn("px-2 py-1", condition && "px-4") => "py-1 px-4"
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
