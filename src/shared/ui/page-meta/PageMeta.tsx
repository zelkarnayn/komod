import { SITE } from '../../config';

interface PageMetaProps {
  /** Название страницы; без него — общий заголовок сайта */
  title?: string;
  /** Описание для поисковиков; без него — общее описание сайта */
  description?: string;
}

/**
 * Заголовок вкладки «Название — Комод» и описание страницы.
 * React сам переносит эти теги в <head>, а при пререндере они попадают в готовый HTML,
 * поэтому поисковики видят свой заголовок у каждой страницы.
 */
export function PageMeta({ title, description }: PageMetaProps) {
  return (
    <>
      <title>{title ? `${title} — ${SITE.name}` : SITE.defaultTitle}</title>
      <meta name="description" content={description || SITE.defaultDescription} />
    </>
  );
}
