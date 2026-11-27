/**
 * Админка товаров «Комода»: веб-приложение Google Apps Script, привязанное к таблице каталога.
 * Записывает товары в лист «Товары», фото — в папку товара на Google Диске.
 * Сайт сам подхватывает изменения при ежечасной сборке.
 *
 * Работает от имени сотрудницы, которая открыла админку: доступ к таблице и папке с фото
 * выдаётся обычным «Поделиться» (редактор). Установка — admin/README.md.
 */

/** Лист с товарами */
const PRODUCTS_SHEET = 'Товары';
/** Лист со списками для выпадающих полей */
const DICTIONARY_SHEET = 'Справочники';
/** Начало артикула салона: KM-001, KM-002… */
const ID_PREFIX = 'KM-';
/** Свойство скрипта с ID корневой папки фото (Настройки проекта → Свойства скрипта) */
const PHOTOS_FOLDER_PROPERTY = 'PHOTOS_FOLDER_ID';

/**
 * Поля формы и столбцы листа. Столбец ищется по началу заголовка до запятой или скобки,
 * как на сайте: «Цена, ₽» → «Цена». Остальные столбцы (например, «Актуальность») админка не трогает.
 */
const FIELDS = {
  id: 'Артикул',
  supplierSku: 'Артикул поставщика',
  name: 'Название',
  room: 'Комната',
  kind: 'Тип товара',
  style: 'Стиль',
  color: 'Цвет',
  material: 'Материал',
  width: 'Ширина',
  depth: 'Глубина',
  height: 'Высота',
  price: 'Цена',
  availability: 'Наличие',
  leadTimeDays: 'Срок поставки',
  supplier: 'Поставщик',
  related: 'Сочетается с',
  description: 'Описание',
  checkedAt: 'Дата проверки цены и наличия',
  onSite: 'На сайте',
};
/** Числовые поля: в ячейку пишется число */
const NUMBER_FIELDS = ['width', 'depth', 'height', 'price', 'leadTimeDays'];
/** Поля, которые пишет только сама админка */
const SERVICE_FIELDS = ['id', 'checkedAt', 'onSite'];
/** Столбцы, которых может не быть в старой таблице: админка их добавит */
const OPTIONAL_FIELDS = ['onSite'];
/** Столбцы листа «Справочники» для выпадающих списков */
const DICTIONARIES = { room: 'Комната', kind: 'Тип товара', style: 'Стиль', availability: 'Наличие' };

/**
 * Открывает админку.
 * @return {GoogleAppsScript.HTML.HtmlOutput}
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Комод — товары')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

// ─── Данные для экранов ───────────────────────────────────────────────

/**
 * Всё для первого экрана: товары с фото и списки для полей формы.
 * @return {{products: Object[], dictionaries: Object<string, string[]>}}
 */
function getCatalog() {
  const table = readTable_();
  const photos = listAllPhotos_();
  return {
    products: table.rows.map((row) => toProduct_(table, row, photos[cell_(table, row, 'id')] || [])),
    dictionaries: readDictionaries_(),
  };
}

/**
 * Миниатюры фото для списка и формы.
 * @param {string[]} fileIds - ID файлов на Диске
 * @return {Object<string, ?string>} ID → картинка data:…; null, если Диск ещё не сделал миниатюру
 */
function getThumbnails(fileIds) {
  const result = {};
  fileIds.slice(0, 20).forEach((id) => {
    try {
      const thumbnail = DriveApp.getFileById(id).getThumbnail();
      result[id] = thumbnail ? toDataUrl_(thumbnail) : null;
    } catch (error) {
      result[id] = null;
    }
  });
  return result;
}

// ─── Сохранение товара ────────────────────────────────────────────────

/**
 * Создаёт или обновляет товар. Новый получает следующий свободный артикул.
 * Перед записью значения проверяются так же строго, как при сборке сайта:
 * товар с ошибкой не сохранится, вместо этого сотрудница увидит понятное сообщение.
 * @param {Object} input - поля формы; id пустой — новый товар
 * @return {Object} сохранённый товар
 */
function saveProduct(input) {
  return withLock_(() => {
    const table = readTable_();
    const clean = validateProduct_(input, table, readDictionaries_());
    let row = clean.id ? findRow_(table, clean.id) : null;
    if (clean.id && !row) throw new Error(`Товара ${clean.id} больше нет в таблице. Обновите страницу.`);

    if (!row) {
      clean.id = nextId_(table);
      row = appendRow_(table);
      if (clean.onSite === undefined) clean.onSite = 'Да';
    }
    // Сохранение карточки = цена и наличие проверены сегодня
    clean.checkedAt = new Date();
    ensureColumns_(table);
    writeRow_(table, row, clean);
    SpreadsheetApp.flush();

    const fresh = readTable_();
    return toProduct_(fresh, findRow_(fresh, clean.id), listPhotos_(clean.id));
  });
}

/**
 * Скрывает товар с сайта или возвращает его. Строка и фото остаются.
 * @param {string} id - артикул
 * @param {boolean} onSite - показывать ли на сайте
 */
function setOnSite(id, onSite) {
  return withLock_(() => {
    const table = readTable_();
    const row = findRow_(table, id);
    if (!row) throw new Error(`Товара ${id} больше нет в таблице. Обновите страницу.`);
    ensureColumns_(table);
    table.sheet.getRange(row.number, table.columns.onSite + 1).setValue(onSite ? 'Да' : 'Нет');
    return onSite;
  });
}

// ─── Фото ─────────────────────────────────────────────────────────────

/**
 * Добавляет фото в конец списка товара. Фото уже сжато на телефоне.
 * @param {string} id - артикул
 * @param {string} dataUrl - картинка data:image/jpeg;base64,…
 * @return {Object[]} фото товара по порядку
 */
function uploadPhoto(id, dataUrl) {
  return withLock_(() => {
    if (!findRow_(readTable_(), id)) throw new Error(`Товара ${id} нет в таблице: сначала сохраните его`);
    const match = /^data:(image\/[\w+.-]+);base64,(.+)$/.exec(dataUrl);
    if (!match) throw new Error('Это не картинка');
    const folder = productFolder_(id, true);
    const count = sortedFiles_(folder).length;
    const blob = Utilities.newBlob(Utilities.base64Decode(match[2]), match[1], `${photoName_(id, count + 1)}.jpg`);
    folder.createFile(blob);
    return listPhotos_(id);
  });
}

/**
 * Задаёт порядок фото: первое — главное. Файлы переименовываются в KM-001_01.jpg, KM-001_02.jpg…
 * @param {string} id - артикул
 * @param {string[]} fileIds - ID файлов в новом порядке
 * @return {Object[]} фото товара по порядку
 */
function setPhotoOrder(id, fileIds) {
  return withLock_(() => {
    const folder = productFolder_(id, false);
    if (!folder) throw new Error(`У товара ${id} нет фото`);
    const files = sortedFiles_(folder);
    const byId = new Map(files.map((file) => [file.getId(), file]));
    const ordered = fileIds.map((fileId) => byId.get(fileId)).filter(Boolean);
    // Фото, загруженные с другого телефона за это время, не теряем: они идут в конец
    files.forEach((file) => {
      if (!ordered.includes(file)) ordered.push(file);
    });
    renumber_(id, ordered);
    return listPhotos_(id);
  });
}

/**
 * Убирает фото в корзину Диска (оттуда его можно вернуть 30 дней).
 * @param {string} id - артикул
 * @param {string} fileId - ID файла
 * @return {Object[]} оставшиеся фото по порядку
 */
function trashPhoto(id, fileId) {
  return withLock_(() => {
    const folder = productFolder_(id, false);
    const file = folder && sortedFiles_(folder).find((item) => item.getId() === fileId);
    if (!file) throw new Error('Фото уже удалено');
    file.setTrashed(true);
    renumber_(id, sortedFiles_(folder));
    return listPhotos_(id);
  });
}

// ─── Таблица ──────────────────────────────────────────────────────────

/**
 * Основа заголовка для поиска столбца, как на сайте: до запятой или скобки, без регистра и «ё».
 * @param {string} header - заголовок
 * @return {string}
 */
function headerKey_(header) {
  return String(header).split(/[(,]/)[0].toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
}

/**
 * Читает лист «Товары»: столбцы по полям и строки с артикулом.
 * @return {{sheet: GoogleAppsScript.Spreadsheet.Sheet, columns: Object<string, number>, rows: Object[], lastRow: number}}
 */
function readTable_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(PRODUCTS_SHEET);
  if (!sheet) throw new Error(`В таблице нет листа «${PRODUCTS_SHEET}»`);
  const range = sheet.getDataRange();
  const values = range.getValues();
  const display = range.getDisplayValues();
  const keys = display[0].map(headerKey_);

  const columns = {};
  const missing = [];
  Object.keys(FIELDS).forEach((field) => {
    const index = keys.indexOf(headerKey_(FIELDS[field]));
    if (index !== -1) columns[field] = index;
    else if (!OPTIONAL_FIELDS.includes(field)) missing.push(`«${FIELDS[field]}»`);
  });
  if (missing.length) throw new Error(`На листе «${PRODUCTS_SHEET}» не найдены столбцы ${missing.join(', ')}`);

  const rows = [];
  let lastRow = 1;
  for (let index = 1; index < values.length; index += 1) {
    if (String(display[index][columns.id]).trim() === '') continue;
    rows.push({ number: index + 1, values: values[index], display: display[index] });
    lastRow = index + 1;
  }
  return { sheet, columns, rows, lastRow, width: display[0].length };
}

/**
 * Значение ячейки строки как текст (так, как оно видно в таблице).
 * @param {Object} table - результат readTable_
 * @param {Object} row - строка
 * @param {string} field - поле
 * @return {string}
 */
function cell_(table, row, field) {
  const index = table.columns[field];
  return index === undefined ? '' : String(row.display[index]).trim();
}

/**
 * Число из ячейки; пустая или нечисловая — ''.
 * @param {Object} table - результат readTable_
 * @param {Object} row - строка
 * @param {string} field - поле
 * @return {number|string}
 */
function numberCell_(table, row, field) {
  const value = row.values[table.columns[field]];
  if (typeof value === 'number') return value;
  const parsed = parseNumber_(value);
  return parsed === null || Number.isNaN(parsed) ? '' : parsed;
}

/**
 * Товар для экранов админки.
 * @param {Object} table - результат readTable_
 * @param {Object} row - строка
 * @param {Object[]} photos - фото товара по порядку
 * @return {Object}
 */
function toProduct_(table, row, photos) {
  const product = {};
  Object.keys(FIELDS).forEach((field) => {
    product[field] = NUMBER_FIELDS.includes(field) ? numberCell_(table, row, field) : cell_(table, row, field);
  });
  product.onSite = headerKey_(product.onSite) !== 'нет';
  product.related = splitList_(product.related);
  product.photos = photos;
  return product;
}

/**
 * Ищет строку товара по артикулу.
 * @param {Object} table - результат readTable_
 * @param {string} id - артикул
 * @return {?Object}
 */
function findRow_(table, id) {
  return table.rows.find((row) => cell_(table, row, 'id').toUpperCase() === String(id).toUpperCase()) || null;
}

/**
 * Следующий свободный артикул: KM-001 → KM-002, считая от наибольшего номера.
 * @param {Object} table - результат readTable_
 * @return {string}
 */
function nextId_(table) {
  const pattern = new RegExp(`^${ID_PREFIX}(\\d+)$`, 'i');
  const max = table.rows.reduce((result, row) => {
    const match = pattern.exec(cell_(table, row, 'id'));
    return match ? Math.max(result, Number(match[1])) : result;
  }, 0);
  return ID_PREFIX + String(max + 1).padStart(3, '0');
}

/**
 * Готовит строку для нового товара сразу после последнего товара.
 * Формулы из соседней строки (например, «Актуальность») копируются, если в новой их нет.
 * @param {Object} table - результат readTable_
 * @return {Object} новая строка
 */
function appendRow_(table) {
  const number = table.lastRow + 1;
  if (number > 2) {
    const previous = table.sheet.getRange(number - 1, 1, 1, table.width).getFormulasR1C1()[0];
    const target = table.sheet.getRange(number, 1, 1, table.width);
    const current = target.getFormulasR1C1()[0];
    const values = target.getValues()[0];
    previous.forEach((formula, index) => {
      if (formula && !current[index] && values[index] === '') table.sheet.getRange(number, index + 1).setFormulaR1C1(formula);
    });
  }
  return { number };
}

/**
 * Добавляет на лист столбцы, которых не было в старой таблице («На сайте»).
 * @param {Object} table - результат readTable_ (обновляется на месте)
 */
function ensureColumns_(table) {
  OPTIONAL_FIELDS.forEach((field) => {
    if (table.columns[field] !== undefined) return;
    const column = table.sheet.getLastColumn() + 1;
    table.sheet.getRange(1, column).setValue(FIELDS[field]);
    table.columns[field] = column - 1;
    table.width = column;
  });
}

/**
 * Записывает поля товара в строку. Пишутся только ячейки админки, остальные не трогаются.
 * @param {Object} table - результат readTable_
 * @param {{number: number}} row - строка
 * @param {Object} product - проверенные поля
 */
function writeRow_(table, row, product) {
  Object.keys(FIELDS).forEach((field) => {
    if (!(field in product) || table.columns[field] === undefined) return;
    let value = product[field];
    if (Array.isArray(value)) value = value.join(', ');
    // Текст, начинающийся с «=», таблица приняла бы за формулу
    if (typeof value === 'string' && /^[=+]/.test(value)) value = `'${value}`;
    table.sheet.getRange(row.number, table.columns[field] + 1).setValue(value === null ? '' : value);
  });
}

/**
 * Читает списки для выпадающих полей с листа «Справочники».
 * @return {Object<string, string[]>}
 */
function readDictionaries_() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(DICTIONARY_SHEET);
  if (!sheet) throw new Error(`В таблице нет листа «${DICTIONARY_SHEET}»`);
  const values = sheet.getDataRange().getDisplayValues();
  const keys = values[0].map(headerKey_);
  const result = {};
  Object.keys(DICTIONARIES).forEach((field) => {
    const index = keys.indexOf(headerKey_(DICTIONARIES[field]));
    result[field] =
      index === -1 ? [] : values.slice(1).map((row) => String(row[index]).trim()).filter((value) => value !== '');
  });
  return result;
}

// ─── Проверка ─────────────────────────────────────────────────────────

/**
 * Число из текста формы или ячейки: «185 000», «4,5». Пустое — null, мусор — NaN.
 * @param {*} value - значение
 * @return {?number}
 */
function parseNumber_(value) {
  if (typeof value === 'number') return value;
  const text = String(value === undefined || value === null ? '' : value).replace(/[\s ₽]/g, '').replace(',', '.');
  if (text === '') return null;
  return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : NaN;
}

/**
 * Делит список артикулов: «KM-001, KM-004» → ['KM-001', 'KM-004'].
 * @param {string|string[]} value - текст или список
 * @return {string[]}
 */
function splitList_(value) {
  const items = Array.isArray(value) ? value : String(value || '').split(/[,;\n]/);
  return items.map((item) => String(item).trim().toUpperCase()).filter((item) => item !== '');
}

/**
 * Проверяет поля формы по тем же правилам, что и сборка сайта.
 * @param {Object} input - поля формы
 * @param {Object} table - результат readTable_
 * @param {Object<string, string[]>} dictionaries - списки для полей
 * @return {Object} очищенные поля для записи
 * @throws {Error} с перечнем ошибок, понятным сотруднице
 */
function validateProduct_(input, table, dictionaries) {
  const errors = [];
  const text = (field) => String(input[field] === undefined || input[field] === null ? '' : input[field]).trim();
  const clean = {};
  Object.keys(FIELDS).forEach((field) => {
    if (!SERVICE_FIELDS.includes(field) && !NUMBER_FIELDS.includes(field) && field !== 'related') clean[field] = text(field);
  });
  clean.id = text('id').toUpperCase();
  if (typeof input.onSite === 'boolean') clean.onSite = input.onSite ? 'Да' : 'Нет';

  if (!clean.name) errors.push('Укажите название');
  Object.keys(DICTIONARIES).forEach((field) => {
    const list = dictionaries[field];
    const value = clean[field];
    const isRequired = field !== 'kind';
    if (!value) {
      if (isRequired) errors.push(`Выберите «${FIELDS[field]}»`);
      return;
    }
    const found = list.find((item) => headerKey_(item) === headerKey_(value));
    if (list.length && !found) errors.push(`«${FIELDS[field]}»: значения «${value}» нет в справочнике`);
    else if (found) clean[field] = found;
  });

  const number = (field, { integer = false } = {}) => {
    const value = parseNumber_(input[field]);
    if (value === null) return '';
    if (Number.isNaN(value)) errors.push(`«${FIELDS[field]}»: нужно число`);
    else if (value <= 0) errors.push(`«${FIELDS[field]}»: нужно число больше нуля`);
    else if (integer && !Number.isInteger(value)) errors.push(`«${FIELDS[field]}»: нужно целое число`);
    else return value;
    return '';
  };
  clean.price = number('price');
  clean.leadTimeDays = number('leadTimeDays', { integer: true });
  clean.width = number('width');
  clean.depth = number('depth');
  clean.height = number('height');
  const filled = ['width', 'depth', 'height'].filter((field) => clean[field] !== '').length;
  if (filled > 0 && filled < 3) errors.push('Размеры: заполните ширину, глубину и высоту или оставьте все три пустыми');

  const known = new Set(table.rows.map((row) => cell_(table, row, 'id').toUpperCase()));
  clean.related = splitList_(input.related).filter((id, index, list) => list.indexOf(id) === index && id !== clean.id);
  const unknown = clean.related.filter((id) => !known.has(id));
  if (unknown.length) errors.push(`«Сочетается с»: нет товаров ${unknown.join(', ')}`);

  if (errors.length) throw new Error(errors.join('\n'));
  return clean;
}

// ─── Диск ─────────────────────────────────────────────────────────────

/**
 * Корневая папка с фото товаров.
 * @return {GoogleAppsScript.Drive.Folder}
 */
function photosRoot_() {
  const id = PropertiesService.getScriptProperties().getProperty(PHOTOS_FOLDER_PROPERTY);
  if (!id) throw new Error(`Не настроена папка с фото: задайте свойство скрипта ${PHOTOS_FOLDER_PROPERTY}`);
  try {
    return DriveApp.getFolderById(id);
  } catch (error) {
    throw new Error('Нет доступа к папке с фото: попросите владелицу поделиться ею с вами (редактор)');
  }
}

/**
 * Папка товара внутри корневой, названная артикулом.
 * @param {string} id - артикул
 * @param {boolean} create - создать, если её нет
 * @return {?GoogleAppsScript.Drive.Folder}
 */
function productFolder_(id, create) {
  const root = photosRoot_();
  const folders = root.getFoldersByName(id);
  if (folders.hasNext()) return folders.next();
  return create ? root.createFolder(id) : null;
}

/**
 * Картинки папки в порядке имён (как их упорядочит сборка сайта).
 * @param {GoogleAppsScript.Drive.Folder} folder - папка товара
 * @return {GoogleAppsScript.Drive.File[]}
 */
function sortedFiles_(folder) {
  const files = [];
  const iterator = folder.getFiles();
  while (iterator.hasNext()) {
    const file = iterator.next();
    if (file.getMimeType().indexOf('image/') === 0) files.push(file);
  }
  return files.sort((a, b) => a.getName().localeCompare(b.getName(), 'ru', { numeric: true }));
}

/**
 * Имя фото без расширения: KM-001_01.
 * @param {string} id - артикул
 * @param {number} position - номер с единицы
 * @return {string}
 */
function photoName_(id, position) {
  return `${id}_${String(position).padStart(2, '0')}`;
}

/**
 * Переименовывает фото по порядку. Сначала во временные имена, чтобы новые имена не столкнулись со старыми.
 * @param {string} id - артикул
 * @param {GoogleAppsScript.Drive.File[]} files - фото в нужном порядке
 */
function renumber_(id, files) {
  const extension = (file) => (/\.\w+$/.exec(file.getName()) || ['.jpg'])[0].toLowerCase();
  const targets = files.map((file, index) => `${photoName_(id, index + 1)}${extension(file)}`);
  files.forEach((file, index) => {
    if (file.getName() !== targets[index]) file.setName(`~${index}_${file.getId()}`);
  });
  files.forEach((file, index) => {
    if (file.getName() !== targets[index]) file.setName(targets[index]);
  });
}

/**
 * Фото одного товара по порядку.
 * @param {string} id - артикул
 * @return {{id: string, name: string}[]}
 */
function listPhotos_(id) {
  const folder = productFolder_(id, false);
  return folder ? sortedFiles_(folder).map((file) => ({ id: file.getId(), name: file.getName() })) : [];
}

/**
 * Фото всех товаров за несколько запросов к Drive API (по одной папке было бы слишком долго).
 * @return {Object<string, {id: string, name: string}[]>} артикул → фото по порядку
 */
function listAllPhotos_() {
  const root = photosRoot_().getId();
  const folders = driveList_(`'${root}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const idByFolder = new Map(folders.map((folder) => [folder.id, folder.name]));
  const result = {};
  for (let start = 0; start < folders.length; start += 40) {
    const parents = folders.slice(start, start + 40).map((folder) => `'${folder.id}' in parents`).join(' or ');
    driveList_(`(${parents}) and mimeType contains 'image/' and trashed = false`).forEach((file) => {
      const productId = idByFolder.get(file.parents[0]);
      (result[productId] = result[productId] || []).push({ id: file.id, name: file.name });
    });
  }
  Object.keys(result).forEach((productId) => result[productId].sort((a, b) => a.name.localeCompare(b.name, 'ru', { numeric: true })));
  return result;
}

/**
 * Все страницы ответа Drive API files.list.
 * @param {string} query - условие поиска
 * @return {{id: string, name: string, parents: string[]}[]}
 */
function driveList_(query) {
  const files = [];
  let pageToken;
  do {
    const page = Drive.Files.list({ q: query, fields: 'nextPageToken, files(id, name, parents)', pageSize: 1000, pageToken });
    files.push(...(page.files || []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return files;
}

// ─── Служебное ────────────────────────────────────────────────────────

/**
 * Выполняет запись под блокировкой: две сотрудницы не затрут правки друг друга.
 * @param {Function} action - что сделать
 * @return {*} результат action
 */
function withLock_(action) {
  const lock = LockService.getDocumentLock();
  if (!lock.tryLock(30000)) throw new Error('Таблицу сейчас сохраняет кто-то другой. Попробуйте ещё раз через минуту.');
  try {
    return action();
  } finally {
    lock.releaseLock();
  }
}

/**
 * Картинка в виде data:…, чтобы показать её без отдельного доступа к Диску.
 * @param {GoogleAppsScript.Base.Blob} blob - картинка
 * @return {string}
 */
function toDataUrl_(blob) {
  return `data:${blob.getContentType()};base64,${Utilities.base64Encode(blob.getBytes())}`;
}
