# Комод — сайт салона интерьера

React + TypeScript + Vite, архитектура Feature-Sliced Design.
Сейчас каталог читает тестовые данные из `src/entities/product/api/products.data.ts`.

## Запуск

```bash
cd komod-web          # cd — «change directory» («сменить каталог»): переходит в папку проекта
npm install           # npm — «Node Package Manager», install — «установить»: скачивает библиотеки из package.json в node_modules
npm run dev           # run — «запустить», dev — «development» («разработка»): поднимает локальный сервер, сайт откроется на http://localhost:5173
```

Остальные команды:

```bash
npm run build         # build — «собрать»: проверяет типы и собирает готовый сайт в папку dist
npm run typecheck     # typecheck — «проверка типов»: запускает TypeScript без сборки
npm run lint          # lint — «проверка кода»: ищет ошибки и сомнительные места через ESLint
```

## Структура (FSD)

Слои импортируют только то, что лежит ниже: `app → pages → widgets → features → entities → shared`.
У каждого слайса есть `index.ts` — публичный интерфейс, снаружи импортируем только через него.

| Слой | Что внутри |
|---|---|
| `app` | запуск приложения, роутер, общий каркас страниц, глобальные стили и цвета |
| `pages` | `home`, `catalog`, `product`, `solutions`, `solution`, `not-found` |
| `widgets` | крупные блоки: шапка, подвал, hero, готовые решения, комнаты, каталог, карточка товара, контакты и т. д. |
| `features` | `filter-products` (фильтры в адресной строке), `ask-in-whatsapp` (кнопки WhatsApp) |
| `entities` | `product`: типы, подписи, форматирование, загрузка данных, карточка и сетка; `solution`: готовое решение, загрузка данных и расчёт цены комплекта по товарам |
| `shared` | `config` (данные салона, маршруты), `lib` (цена, ссылка WhatsApp, склонения), `ui` (кнопка, контейнер, секция) |

## Что заменить перед запуском

- `src/shared/config/site.ts` — номер WhatsApp, адрес, часы работы (сейчас заглушки).
- `src/entities/product/api/products.data.ts` и `src/entities/solution/api/solutions.data.ts` — тестовые товары и комплекты.
- `public/products/` — тестовые фото поставщика (на двух есть артикулы фабрики).
- `src/widgets/hero`, `showroom-info`, `contacts` — места с пометками TODO (фото шоурума, карта).

## Как подключить таблицу товаров

Меняется одна функция на каждый лист: `fetchProducts` в `src/entities/product/api/products.api.ts` (лист «Товары») и `fetchSolutions` в `src/entities/solution/api/solutions.api.ts` (лист «Комплекты»).
Она должна загрузить таблицу (например, опубликованный CSV из Google Sheets), превратить строки в `Product[]` и вернуть их.
Артикул поставщика и поставщика в `Product` намеренно нет: на сайт они не попадают.

## Готовые решения

Комплект хранит только артикулы товаров. Сумма считается из цен каталога, а если у комплекта задана своя цена ниже суммы, сайт показывает выгоду.
Если у какого-то товара нет цены или он пропал из каталога, цена комплекта не выдумывается: показывается «Цена по запросу».
