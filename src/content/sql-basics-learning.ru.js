const sqlLayers = [
  {
    title: 'NEST SERVICE',
    detail: 'use case · repository · DTO',
    active: true,
  },
  {
    title: 'PG DRIVER',
    detail: 'query text · values · result.rows',
  },
  {
    title: 'POSTGRESQL',
    detail: 'parse · plan · execute',
  },
  {
    title: 'TABLES',
    detail: 'columns · rows · constraints',
  },
];

export const sqlBasicsLearningRu = {
  'database-sql-basics': {
    plain:
      'Представьте таблицу как строгую электронную ведомость. Столбцы заранее описывают, какие данные разрешены, строки хранят отдельные объекты, а SQL-команда формулирует, что нужно получить или изменить. В отличие от массива JavaScript, база может одновременно обслуживать много процессов и сама проверяет часть правил.',
    foundation:
      'SQL — декларативный язык: вы описываете желаемый результат, а PostgreSQL выбирает способ его получить. Команда состоит из clauses: SELECT выбирает выражения результата, FROM задаёт источник, WHERE фильтрует строки, GROUP BY образует группы, HAVING фильтрует группы, ORDER BY сортирует, LIMIT ограничивает ответ. INSERT, UPDATE и DELETE изменяют данные; RETURNING сразу возвращает изменённые строки.',
    why:
      'Без чтения SQL невозможно уверенно пользоваться ORM: ORM всё равно генерирует запросы, которые могут быть медленными, небезопасными или логически неверными. Базовый синтаксис позволяет увидеть реальную операцию, проверить параметры и понять план дальнейших DB-глав.',
    resources: [
      {
        label: 'PostgreSQL documentation',
        href: 'https://www.postgresql.org/docs/current/',
        description:
          'Главная официальная документация PostgreSQL и точка входа во все SQL-разделы.',
      },
      {
        label: 'PostgreSQL: The SQL Language',
        href: 'https://www.postgresql.org/docs/current/tutorial-sql.html',
        description:
          'Официальное введение в таблицы, запросы, JOIN, aggregate functions, UPDATE и DELETE.',
      },
      {
        label: 'SELECT',
        href: 'https://www.postgresql.org/docs/current/sql-select.html',
        description:
          'Полный синтаксис SELECT и логический порядок его clauses.',
      },
      {
        label: 'Value expressions',
        href: 'https://www.postgresql.org/docs/current/sql-expressions.html',
        description:
          'Литералы, ссылки на columns, operators, functions, casts и выражения.',
      },
      {
        label: 'node-postgres queries',
        href: 'https://node-postgres.com/features/queries',
        description:
          'Параметры $1, prepared statements и структура результата pg driver.',
      },
    ],
    runtimeLayers: sqlLayers,
    terms: [
      {
        name: 'Table / row / column',
        description:
          'Table хранит однотипные сущности, row — одну запись, column — именованное поле с определённым data type.',
      },
      {
        name: 'Statement',
        description:
          'Законченная SQL-команда: SELECT, INSERT, UPDATE, DELETE или CREATE TABLE. Обычно завершается точкой с запятой.',
      },
      {
        name: 'Clause',
        description:
          'Часть statement со своей задачей: FROM задаёт источник, WHERE — условие, ORDER BY — сортировку.',
      },
      {
        name: 'Expression',
        description:
          'Вычисляемый фрагмент: price * stock, lower(email), count(*) или сравнение price <= $1.',
      },
      {
        name: 'NULL',
        description:
          'Отсутствующее или неизвестное значение. NULL не равен даже NULL; для проверки используют IS NULL и IS NOT NULL.',
      },
      {
        name: 'Parameter $1',
        description:
          'Placeholder значения, которое driver передаёт отдельно от SQL. Номер соответствует позиции в values array.',
      },
      {
        name: 'Alias AS',
        description:
          'Временное имя column, expression или table внутри результата запроса: name AS product_name.',
      },
      {
        name: 'Result set',
        description:
          'Набор строк, возвращённый запросом. node-postgres помещает его в result.rows.',
      },
    ],
    steps: [
      {
        title: 'Опишите table',
        description:
          'CREATE TABLE задаёт columns, data types, defaults и constraints.',
      },
      {
        title: 'Добавьте rows',
        description:
          'INSERT INTO перечисляет целевые columns, VALUES передаёт данные, RETURNING показывает созданные строки.',
      },
      {
        title: 'Прочитайте rows',
        description:
          'SELECT формирует columns результата, FROM выбирает table, WHERE оставляет подходящие rows.',
      },
      {
        title: 'Упорядочьте ответ',
        description:
          'ORDER BY сортирует, LIMIT ограничивает количество, OFFSET пропускает начало набора.',
      },
      {
        title: 'Измените безопасно',
        description:
          'UPDATE использует SET и обязательно осмысленный WHERE; RETURNING показывает фактический outcome.',
      },
      {
        title: 'Сгруппируйте',
        description:
          'Aggregate functions считают значения, GROUP BY создаёт группы, HAVING фильтрует уже готовые группы.',
      },
      {
        title: 'Удалите осознанно',
        description:
          'DELETE FROM без WHERE затронет всю table, поэтому сначала проверяют тот же predicate через SELECT.',
      },
    ],
    nuances: [
      {
        title: 'Синтаксический и логический порядок отличаются',
        description:
          'SELECT записан первым, но логически FROM и WHERE определяют входные rows раньше формирования SELECT list. Это объясняет часть ограничений aliases.',
      },
      {
        title: 'SQL keywords не обязаны быть uppercase',
        description:
          'PostgreSQL понимает select и SELECT одинаково. Верхний регистр — соглашение для визуального отделения keywords от identifiers.',
      },
      {
        title: 'NULL создаёт трёхзначную логику',
        description:
          'Сравнение с NULL обычно даёт UNKNOWN, а WHERE оставляет только TRUE. Поэтому column = NULL не находит отсутствующие значения.',
      },
      {
        title: 'Parameters защищают values, не identifiers',
        description:
          '$1 подходит значению email или price, но не имени table, column или направлению сортировки. Такие части выбирают из allowlist.',
      },
      {
        title: 'LIMIT без ORDER BY нестабилен',
        description:
          'Без явно заданного порядка база может вернуть любые подходящие rows. Физический порядок table не является API-контрактом.',
      },
      {
        title: 'UPDATE и DELETE сообщают масштаб',
        description:
          'Проверяйте result.rowCount и RETURNING. Ноль строк часто является бизнес-событием, а неожиданно большое число — защитным сигналом.',
      },
    ],
    pitfalls: [
      {
        myth: 'SQL выполняется буквально сверху вниз.',
        fact: 'Parser строит statement, затем clauses имеют логический порядок, а planner выбирает физический plan.',
      },
      {
        myth: 'SELECT * удобен и поэтому подходит production API.',
        fact: 'Явный список columns стабилизирует контракт, уменьшает передачу данных и показывает зависимости кода.',
      },
      {
        myth: 'Строковая интерполяция безопасна после ручного escaping.',
        fact: 'Values передают параметрами driver-а; identifiers выбирают из заранее разрешённого списка.',
      },
      {
        myth: 'WHERE description = NULL найдёт пустые descriptions.',
        fact: 'Нужен IS NULL; NULL означает unknown/absent, а не строку и не обычное значение.',
      },
      {
        myth: 'DELETE удаляет только одну строку.',
        fact: 'DELETE затрагивает все rows, удовлетворяющие WHERE, а без WHERE — всю table.',
      },
    ],
    codeIntro:
      'Runtime создаёт изолированную products table, добавляет три rows и последовательно показывает чтение, NULL, изменение, aggregation и удаление. Каждое значение пользователя передаётся через $1, $2 и values array.',
    codeNotes: [
      'SELECT list определяет форму result.rows.',
      'AS переименовывает поле только в результате запроса.',
      'WHERE работает с отдельными rows до GROUP BY.',
      'HAVING работает с группами после aggregation.',
      'RETURNING избавляет от второго запроса после INSERT/UPDATE/DELETE.',
      'rowCount показывает число реально затронутых rows.',
    ],
    examples: [
      {
        title: 'SELECT: выбрать columns',
        goal:
          'Получить только id, name и вычисленную стоимость остатка.',
        code: `SELECT
  id,
  name,
  price * stock AS inventory_value
FROM products;`,
        notes: [
          'Запятая разделяет expressions в SELECT list.',
          'FROM указывает table-источник.',
          'AS задаёт имя вычисленного поля результата.',
        ],
      },
      {
        title: 'WHERE: отфильтровать rows',
        goal:
          'Найти активные книги не дороже переданного значения.',
        code: `SELECT id, name, price
FROM products
WHERE category = $1
  AND price <= $2
  AND active IS TRUE;`,
        notes: [
          '$1 и $2 приходят из values array driver-а.',
          'AND требует истинности всех условий.',
          'Строки SQL заключают в одинарные кавычки, identifiers — обычно без них.',
        ],
      },
      {
        title: 'INSERT: добавить row',
        goal:
          'Создать product и сразу получить сгенерированный id.',
        code: `INSERT INTO products (name, price, stock)
VALUES ($1, $2, $3)
RETURNING id, name, price, stock;`,
        notes: [
          'Порядок VALUES соответствует списку columns.',
          'RETURNING возвращает уже записанную row.',
        ],
      },
      {
        title: 'UPDATE: изменить подходящие rows',
        goal:
          'Атомарно уменьшить stock, только если товара достаточно.',
        code: `UPDATE products
SET stock = stock - $1
WHERE id = $2
  AND stock >= $1
RETURNING id, stock;`,
        notes: [
          'SET описывает новое значение.',
          'Правая stock — текущее значение row.',
          'Нулевой rowCount означает, что условие не прошло.',
        ],
      },
      {
        title: 'DELETE: удалить явно',
        goal:
          'Удалить только неактивные products и увидеть их id.',
        code: `DELETE FROM products
WHERE active IS FALSE
RETURNING id;`,
        notes: [
          'Сначала выполните SELECT с тем же WHERE.',
          'Без WHERE команда удалит все rows.',
        ],
      },
      {
        title: 'ORDER BY, LIMIT и OFFSET',
        goal:
          'Получить вторую страницу дорогих products.',
        code: `SELECT id, name, price
FROM products
ORDER BY price DESC, id ASC
LIMIT $1
OFFSET $2;`,
        notes: [
          'DESC — по убыванию, ASC — по возрастанию.',
          'id даёт стабильный tie-breaker.',
          'Большой OFFSET со временем становится дорогим; позже изучите keyset pagination.',
        ],
      },
      {
        title: 'GROUP BY и aggregate functions',
        goal:
          'Посчитать количество и среднюю цену в каждой category.',
        code: `SELECT
  category,
  count(*) AS product_count,
  round(avg(price), 2) AS average_price
FROM products
GROUP BY category
HAVING count(*) >= $1
ORDER BY category;`,
        notes: [
          'count и avg получают много rows и возвращают одно значение на группу.',
          'HAVING фильтрует groups; WHERE фильтровал бы rows до aggregation.',
        ],
      },
      {
        title: 'NULL: проверить отсутствие',
        goal:
          'Найти products без description.',
        code: `SELECT id, name
FROM products
WHERE description IS NULL;`,
        notes: [
          'Не используйте description = NULL.',
          'Для обратной проверки существует IS NOT NULL.',
          'NULL отличается от пустой строки.',
        ],
      },
    ],
    questions: [
      'Какую роль отдельно выполняют SELECT, FROM и WHERE?',
      'Почему $1 нельзя заключать в кавычки внутри SQL?',
      'Чем WHERE отличается от HAVING?',
      'Почему LIMIT желательно использовать вместе с ORDER BY?',
      'Что вернёт UPDATE, если его WHERE не нашёл ни одной row?',
      'Почему NULL проверяется через IS NULL?',
      'Что произойдёт с DELETE без WHERE?',
    ],
  },
};
