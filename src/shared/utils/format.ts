/** Shows a 'YYYY-MM-DD' (or ISO) date as 05 Nov 2026. Returns '-' for empty values. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Empty/blank strings become undefined so optional API fields are omitted instead of sent as "". */
export function blankToUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** id -> name lookup for showing names instead of GUIDs in tables. */
export function nameLookup<T extends { id: string }>(items: T[] | undefined, pick: (item: T) => string | null) {
  const map = new Map((items ?? []).map((item) => [item.id, pick(item) ?? '-']));
  return (id: string | null | undefined) => (id ? (map.get(id) ?? '-') : '-');
}
