import { useEffect } from 'react';
import { SITE } from '../config';

/**
 * Задаёт заголовок вкладки браузера: «Название — Комод».
 * Без названия (главная, данные ещё грузятся) ставит общий заголовок сайта.
 * @param title - название страницы
 */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} — ${SITE.name}` : SITE.defaultTitle;
  }, [title]);
}
