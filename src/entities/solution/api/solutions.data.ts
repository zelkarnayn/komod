import type { Solution } from '../model/types';

/**
 * ТЕСТОВЫЕ комплекты для макета: состав и цена комплекта придуманы.
 * Позже заменяются данными с листа «Комплекты» (см. solutions.api.ts).
 */
export const SOLUTIONS: readonly Solution[] = [
  {
    id: 'KS-001',
    name: 'Гостиная в оливковых тонах',
    room: 'living',
    style: 'modern-classic',
    description: 'Диван и буфет для гостиной в тёплых оливково-деревянных тонах.',
    productIds: ['KM-001', 'KM-004'],
    price: null,
    cover: null,
  },
  {
    id: 'KS-002',
    name: 'Столовая в стиле Прованс',
    room: 'dining',
    style: 'provence',
    description: 'Обеденный стол и буфет: место для семьи и для посуды и текстиля.',
    productIds: ['KM-002', 'KM-004'],
    price: null,
    cover: null,
  },
  {
    id: 'KS-003',
    name: 'Гостиная-столовая',
    room: 'living',
    style: 'modern-classic',
    description: 'Большое пространство: диван, стол и буфет в одной комнате.',
    productIds: ['KM-001', 'KM-002', 'KM-004'],
    price: 410000,
    cover: null,
  },
];
