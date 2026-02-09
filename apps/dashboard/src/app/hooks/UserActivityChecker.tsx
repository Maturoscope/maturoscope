"use client"

import { useUserActivityCheck } from './useUserActivityCheck';

/**
 * Component that uses the useUserActivityCheck hook to monitor user activity.
 * This component doesn't render anything, it just sets up the click listener.
 */
export function UserActivityChecker() {
  useUserActivityCheck();
  return null;
}

