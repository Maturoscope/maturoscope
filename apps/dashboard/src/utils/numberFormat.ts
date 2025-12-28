/**
 * Utility functions for formatting numbers in charts and KPIs
 */

/**
 * Base function to format numbers with K suffix
 * @param value - The number to format
 * @param useUpperCase - Whether to use uppercase "K" (default: false, uses lowercase "k")
 * @returns Formatted string (e.g., "0", "123", "1.3k", "5k" or "1.3K", "5K")
 */
const formatNumberWithK = (value: number, useUpperCase: boolean = false): string => {
  if (value === 0) return '0';
  if (value < 1000) return value.toString();
  const suffix = useUpperCase ? 'K' : 'k';
  if (value < 10000) return `${(value / 1000).toFixed(1)}${suffix}`;
  return `${Math.round(value / 1000)}${suffix}`;
};

/**
 * Formats a number for KPI display (e.g., 1.3k, 5k)
 * @param value - The number to format
 * @returns Formatted string (e.g., "0", "123", "1.3k", "5k")
 */
export const formatKPINumber = (value: number): string => {
  return formatNumberWithK(value, false);
};

/**
 * Formats a number for Y-axis labels in charts (e.g., 1.3K, 5K)
 * @param value - The number to format
 * @returns Formatted string (e.g., "0", "123", "1.3K", "5K")
 */
export const formatYAxisLabel = (value: number): string => {
  return formatNumberWithK(value, true);
};

/**
 * Formats a number for tooltip display with "users" suffix
 * @param value - The number to format
 * @returns Formatted string (e.g., "123 users", "1.3K users", "5K users")
 */
export const formatTooltipValue = (value: number): string => {
  if (value < 1000) return `${value} users`;
  if (value < 10000) return `${(value / 1000).toFixed(1)}K users`;
  return `${(value / 1000).toFixed(1)}K users`;
};

/**
 * Calculates tick values for Y-axis based on max value
 * Uses linear scale for small values, non-linear scale for larger values
 * @param maxValue - Maximum value in the dataset
 * @returns Array of tick values for the Y-axis
 */
export const getYTickValues = (maxValue: number): number[] => {
  // If maxValue is very small, use simple linear scale
  if (maxValue <= 10) {
    const simpleTicks: number[] = [];
    for (let i = 0; i <= maxValue; i++) {
      simpleTicks.push(i);
    }
    return simpleTicks;
  }
  
  // For larger values, use non-linear scale
  const ticks = [0, 1, 3, 5, 10, 25, 50, 100, 150, 200];
  return ticks.filter(tick => tick * 1000 <= maxValue * 1.1).map(tick => tick * 1000);
};

