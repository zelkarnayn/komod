import type { Product } from '../model/types';
import { PRODUCTS } from './products.data';

/**
 * Загружает каталог товаров.
 * Сейчас отдаёт локальные тестовые данные. Позже здесь будет запрос
 * к таблице товаров (Google Sheets), а остальной код менять не придётся.
 */
export function fetchProducts(): Promise<readonly Product[]> {
  return Promise.resolve(PRODUCTS);
}
