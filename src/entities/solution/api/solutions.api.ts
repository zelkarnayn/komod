import type { Solution } from '../model/types';
import { SOLUTIONS } from './solutions.data';

/**
 * Загружает готовые решения.
 * Сейчас отдаёт локальные тестовые данные. Позже здесь будет запрос
 * к листу «Комплекты» той же таблицы, что и каталог.
 */
export function fetchSolutions(): Promise<readonly Solution[]> {
  return Promise.resolve(SOLUTIONS);
}
