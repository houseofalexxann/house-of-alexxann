"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Dev: never let a service worker cache-first stale assets — unregister
    // anything present and purge its caches (this bit us: stale CSS survived
    // server restarts because the SW served _next/static cache-first).
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          for (const k of keys) if (k.startsWith("hoa-")) void caches.delete(k);
        });
      }
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // PWA is progressive enhancement; never break the page over it.
      });
  }, []);
  return null;
}
