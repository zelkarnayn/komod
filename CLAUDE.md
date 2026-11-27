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
Тестовые данные: entities/product/api/products.data.ts и entities/solution/api/solutions.data.ts.
Боевой источник — таблица Google Sheets с листами «Товары» и «Комплекты» (формат столбцов в komod-catalog.xlsx)
и фото в папках товаров на Google Диске. Сборка читает их через API сервисным аккаунтом (build/google.ts),
в файлы сайта попадают только столбцы из shared/config/sheet-columns.ts. Фото пережимаются в WebP (build/photos.ts).
Товары заводят через админку на Apps Script (admin/, это обычный JS без сборки, вне lint и tsconfig).
Таблица читается только при сборке (build/catalog-source.ts), страницы пререндерятся
в HTML (build/prerender.ts, src/app/entry-server.tsx). Код страниц должен рисоваться без
window/document вне эффектов. Хостинг — Yandex Object Storage, выкладка .github/workflows/deploy.yml.

## Проверки перед завершением задачи
npm run typecheck, npm run lint, npm run build.