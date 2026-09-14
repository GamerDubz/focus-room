/** Generates a short, non-cryptographic id for client-only list items (tasks). */
export function generateId(): string {
  return Math.random().toString(36).slice(2)
}
