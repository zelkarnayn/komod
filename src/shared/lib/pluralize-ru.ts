const pluralRules = new Intl.PluralRules('ru');

/**
 * Выбирает форму слова по числу: 1 товар, 2 товара, 5 товаров.
 * @param n - количество
 * @param forms - формы для «1», «2–4» и «5 и более»
 */
export function pluralizeRu(n: number, forms: readonly [one: string, few: string, many: string]): string {
  const rule = pluralRules.select(n);
  if (rule === 'one') return forms[0];
  if (rule === 'few') return forms[1];
  return forms[2];
}
