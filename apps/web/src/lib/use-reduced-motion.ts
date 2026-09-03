"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function read(): boolean {
  return window.matchMedia(QUERY).matches;
}

function readOnServer(): null {
  return null;
}

/**
 * The visitor's motion preference, live: `null` on the server and during the
 * hydration frame (nothing should move until we know), then a boolean that
 * follows the system setting if it changes mid-visit.
 */
export function usePrefersReducedMotion(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, read, readOnServer);
}
