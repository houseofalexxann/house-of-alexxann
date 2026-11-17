/**
 * Server-side reads of saved birth profiles. An account can hold several
 * profiles now; exactly one of them is the account holder's own, and that
 * is the one the calendar, the weather and the prefilled forms read.
 */
import type { BirthProfile } from "@prisma/client";
import { prisma } from "./db";
import type { SavedProfile } from "./saved-charts";

/** The account holder's own chart, or null when none is saved yet. */
export function selfProfile(userId: string): Promise<BirthProfile | null> {
  return prisma.birthProfile.findFirst({
    where: { userId, isSelf: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Every chart on the account: the holder's own first, then newest first. */
export async function savedProfiles(userId: string): Promise<SavedProfile[]> {
  const rows = await prisma.birthProfile.findMany({
    where: { userId },
    orderBy: [{ isSelf: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toSaved);
}

export function toSaved(p: BirthProfile): SavedProfile {
  return {
    id: p.id,
    name: p.name,
    birthDate: p.birthDate,
    birthTime: p.birthTime,
    placeLabel: p.placeLabel,
    latitude: p.latitude,
    longitude: p.longitude,
    timezone: p.timezone,
    isSelf: p.isSelf,
  };
}
