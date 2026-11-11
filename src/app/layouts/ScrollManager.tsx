import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Управляет прокруткой при переходах: к якорю (#showroom), если он есть,
 * иначе — в начало страницы. Без этого роутер оставляет прокрутку на месте.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}
