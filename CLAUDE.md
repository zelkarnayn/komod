# Комод — сайт салона интерьера

Сайт-витрина (продажи только офлайн в шоуруме, оплаты и корзины на сайте нет).
Клиент выбирает товар и пишет в WhatsApp. Стек: React 19, TypeScript (strict), Vite,
React Router, TanStack Query, CSS Modules. Архитектура Feature-Sliced Design.

## Правила
- Слои FSD: app → pages → widgets → features → entities → shared; импорт только вниз.
  Снаружи слайса импортируем только через его index.ts.
  Между сущностями только через `@x` (см. entities/product/@x/solution.ts).
- Строгий TypeScript, @typescript-eslint, минимум шаблонного кода.
- Комментарии и JSDoc писать на русском; JSDoc у всех утилит.
- Не выдумывать данные: если значения нет, показываем «Цена по запросу» и т. п.
- Артикул поставщика и название поставщика на сайт не попадают (их нет в типе Product).

## Данные
Сейчас тестовые данные: entities/product/api/products.data.ts и
entities/solution/api/solutions.data.ts. Источник данных будет таблица Google Sheets
с листами «Товары» и «Комплекты» (формат столбцов в файле komod-catalog.xlsx).
Таблица скачивается только при сборке (build/catalog-source.ts), страницы пререндерятся
в HTML (build/prerender.ts, src/app/entry-server.tsx). Код страниц должен рисоваться без
window/document вне эффектов. Хостинг — Yandex Object Storage, выкладка .github/workflows/deploy.yml.

## Проверки перед завершением задачи
npm run typecheck, npm run lint, npm run build.