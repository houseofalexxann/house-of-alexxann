import type { Metadata } from "next";
import { DateTime } from "luxon";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import {
  ExceptionsEditor,
  SettingsEditor,
  WeeklyRulesEditor,
} from "@/components/admin/AvailabilityEditors";

export const metadata: Metadata = { title: "Admin — availability & settings" };

export default async function AdminAvailabilityPage() {
  await requireAdmin();

  const settings = await getSettings();
  // "Today" in the practitioner's timezone — exception dates are stored as
  // YYYY-MM-DD in that zone, so string comparison is safe. Falls back to UTC
  // if a bad timezone was ever saved.
  const zonedNow = DateTime.now().setZone(settings.practitionerTz);
  const today = (zonedNow.isValid ? zonedNow : DateTime.utc()).toISODate()!;

  const [rules, exceptions] = await Promise.all([
    prisma.availabilityRule.findMany({
      orderBy: [{ weekday: "asc" }, { startMinute: "asc" }],
    }),
    prisma.availabilityException.findMany({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-ink-900">Availability &amp; settings</h1>
      <WeeklyRulesEditor rules={rules} />
      <ExceptionsEditor exceptions={exceptions} />
      <SettingsEditor settings={settings} />
    </div>
  );
}
