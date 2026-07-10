import { prisma } from "./db";

/** Practitioner scheduling settings with sensible Phase 1 defaults. */
export interface SchedulerSettings {
  /** IANA timezone the availability rules are written in. */
  practitionerTz: string;
  /** Minutes of breathing room after each session. */
  bufferMinutes: number;
  /** Minimum hours between "now" and the earliest bookable slot. */
  leadTimeHours: number;
  /** How many days ahead the calendar opens. */
  horizonDays: number;
  /** Slot start granularity in minutes. */
  slotStepMinutes: number;
  /** Delivery details per format. */
  videoLink: string;
  phoneNumber: string;
  inPersonAddress: string;
  /** Direct-pay handles (Venmo / Cash App / Zelle / PayPal.me). */
  venmoHandle: string;
  cashAppTag: string;
  zelleContact: string;
  paypalMeLink: string;
}

export const DEFAULT_SETTINGS: SchedulerSettings = {
  practitionerTz: "America/New_York",
  bufferMinutes: 15,
  leadTimeHours: 12,
  horizonDays: 30,
  slotStepMinutes: 30,
  videoLink: "A private video link arrives with your confirmation email.",
  phoneNumber: "Alexandria will call the number you provide.",
  inPersonAddress: "Location details arrive with your confirmation email.",
  venmoHandle: "",
  cashAppTag: "",
  zelleContact: "",
  paypalMeLink: "",
};

export async function getSettings(): Promise<SchedulerSettings> {
  const rows = await prisma.setting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    practitionerTz: map.practitionerTz ?? DEFAULT_SETTINGS.practitionerTz,
    bufferMinutes: Number(map.bufferMinutes ?? DEFAULT_SETTINGS.bufferMinutes),
    leadTimeHours: Number(map.leadTimeHours ?? DEFAULT_SETTINGS.leadTimeHours),
    horizonDays: Number(map.horizonDays ?? DEFAULT_SETTINGS.horizonDays),
    slotStepMinutes: Number(map.slotStepMinutes ?? DEFAULT_SETTINGS.slotStepMinutes),
    videoLink: map.videoLink ?? DEFAULT_SETTINGS.videoLink,
    phoneNumber: map.phoneNumber ?? DEFAULT_SETTINGS.phoneNumber,
    inPersonAddress: map.inPersonAddress ?? DEFAULT_SETTINGS.inPersonAddress,
    venmoHandle: map.venmoHandle ?? DEFAULT_SETTINGS.venmoHandle,
    cashAppTag: map.cashAppTag ?? DEFAULT_SETTINGS.cashAppTag,
    zelleContact: map.zelleContact ?? DEFAULT_SETTINGS.zelleContact,
    paypalMeLink: map.paypalMeLink ?? DEFAULT_SETTINGS.paypalMeLink,
  };
}

export async function saveSettings(patch: Partial<SchedulerSettings>): Promise<void> {
  const entries = Object.entries(patch).filter(([, v]) => v !== undefined);
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )
  );
}
