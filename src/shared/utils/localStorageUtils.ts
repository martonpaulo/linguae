const STORAGE_PREFIX = process.env.NEXT_PUBLIC_STORAGE_PREFIX ?? "linguae";
const STORAGE_VERSION =
  process.env.NEXT_PUBLIC_STORAGE_VERSION ?? "unknown-version";

export function buildStorageKey(key: string): string {
  return STORAGE_PREFIX
    ? `${STORAGE_PREFIX}.${key}.${STORAGE_VERSION}`
    : `${key}.${STORAGE_VERSION}`;
}

/**
 * Browser storage is best effort. It can be absent during server rendering, throw on access
 * in a locked-down context, refuse a read, or refuse a write when the origin is full. Every
 * operation below reports an outcome instead of throwing, so a caller can keep working
 * without persistence.
 */
function storage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** The raw stored text, or null when there is nothing usable to read. */
export function readStoredText(key: string): string | null {
  try {
    return storage()?.getItem(buildStorageKey(key)) ?? null;
  } catch {
    return null;
  }
}

/** True when the value was actually persisted. */
export function writeStoredText(key: string, value: string): boolean {
  try {
    const target = storage();
    if (!target) return false;

    target.setItem(buildStorageKey(key), value);
    return true;
  } catch {
    return false;
  }
}
