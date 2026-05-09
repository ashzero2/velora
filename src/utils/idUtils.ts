// ============================================================
// Velora — ID Generation Utility
// React Native compatible — no crypto.getRandomValues dependency
// ============================================================

/**
 * Generate a new UUID v4 string.
 * Uses Math.random() which is sufficient for local-only database IDs.
 */
export function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}