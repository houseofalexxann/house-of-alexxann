/**
 * Dev reminder scheduler: checks for due 24h reminders every 10 minutes so
 * the reminder flow works without external cron. Production should also set
 * a real cron hitting /api/cron/reminders (belt and suspenders).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { sendDueReminders } = await import("@/lib/bookings");

  const tick = async () => {
    try {
      const sent = await sendDueReminders();
      if (sent > 0) console.log(`[reminders] sent ${sent}`);
    } catch (err) {
      console.error("[reminders] tick failed:", err);
    }
  };
  setTimeout(tick, 15_000);
  setInterval(tick, 10 * 60_000);
}
