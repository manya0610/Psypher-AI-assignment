export const TIER_ORDER = ["free", "silver", "gold", "platinum"];

export function getAllowedTiers(userTier: string) {
  const index = TIER_ORDER.indexOf(userTier);
  return TIER_ORDER.slice(0, index + 1);
}

export function isLockedEvent(userTier: string, eventTier: string) {
  return TIER_ORDER.indexOf(eventTier) > TIER_ORDER.indexOf(userTier);
}