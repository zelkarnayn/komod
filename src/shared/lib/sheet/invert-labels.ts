import { normalizeKey } from './normalize-key';

/**
 * Строит обратный словарь «русская подпись → код» из словаря подписей.
 * Ключи нормализованы через normalizeKey, поэтому «гостиная » и «Гостиная» совпадут.
 * @param labels - словарь «код → подпись», например ROOM_LABELS
 */
export function invertLabels<K extends string>(labels: Readonly<Record<K, string>>): ReadonlyMap<string, K> {
  const entries = Object.entries(labels) as [K, string][];
  return new Map(entries.map(([code, label]) => [normalizeKey(label), code]));
}
