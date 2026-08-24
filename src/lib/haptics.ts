import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

async function safe(fn: () => Promise<void>) {
  try {
    await fn();
  } catch {
    // Not available on web/simulator — silently ignore
  }
}

export const haptics = {
  selectionChanged: () => safe(() => Haptics.selectionChanged()),
  impactLight: () => safe(() => Haptics.impact({ style: ImpactStyle.Light })),
  impactMedium: () => safe(() => Haptics.impact({ style: ImpactStyle.Medium })),
  impactHeavy: () => safe(() => Haptics.impact({ style: ImpactStyle.Heavy })),
  notificationSuccess: () => safe(() => Haptics.notification({ type: NotificationType.Success })),
};
