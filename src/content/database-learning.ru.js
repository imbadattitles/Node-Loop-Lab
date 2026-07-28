const postgresDocumentation = {
  label: 'Официальная документация PostgreSQL',
  href: 'https://www.postgresql.org/docs/current/',
  description:
    'Основной источник по SQL, planner, индексам, MVCC, транзакциям и обслуживанию PostgreSQL.',
};

const databaseLayers = [
  {
    title: 'КОД ПРИЛОЖЕНИЯ',
    detail: 'repository · use case · transaction',
    active: true,
  },
  {
    title: 'SQL + DRIVER',
    detail: 'parameters · pool · protocol',
  },
  {
    title: 'POSTGRESQL',
    detail: 'parser · planner · executor · MVCC',
  },
  {
    title: 'STORAGE',
    detail: 'heap pages · indexes · WAL · disk',
  },
];

export const databaseLearningRu = {
  'database-sql-foundations': {
    plain:
      'База данных — не большой JSON-файл и не пассивное хранилище. Это отдельная система, которая одновременно проверяет правила, координирует конкурирующие изменения и решает, как физически получить строки. Хорошая схема не только хранит данные, но и не позволяет записать состояние, невозможное для бизнеса.',
    foundation:
      'Реляционная модель описывает сущности таблицами, строки идентифицирует ключами, а связи и допустимые значения закрепляет constraints. PostgreSQL разбирает SQL, строит возможные планы, выбирает план по статистике и выполняет его в рамках транзакции. ACID описывает свойства изменений: atomicity, consistency, isolation и durability. При этом consistency — совместная ответственность схемы и бизнес-логики, а не автоматическая магия СУБД.',
    why:
      'На production большая часть трудноуловимых ошибок появляется на границе между конкурентным кодом и состоянием. Если инвариант существует только в Nest-сервисе, другой worker, миграция или ручной SQL может его нарушить. Constraints и транзакции делают важные правила общими для всех клиентов.',
    resources: [
      postgresDocumentation,
      {
        label: 'Data Definition и constraints',
        href: 'https://www.postgresql.org/docs/current/ddl-constraints.html',
        description:
          'NOT NULL, CHECK, UNIQUE, PRIMARY KEY, FOREIGN KEY и ограничения исключения.',
      },
      {
        label: 'Transactions',
        href: 'https://www.postgresql.org/docs/current/tutorial-transactions.html',
        description:
          'BEGIN, COMMIT, ROLLBACK, savepoints и атомарная группа изменений.',
      },
      {
        label: 'Query planning',
        href: 'https://www.postgresql.org/docs/current/planner-optimizer.html',
        description:
          'Как PostgreSQL превращает декларативный SQL в исполняемый план.',
      },
    ],
    runtimeLayers: databaseLayers,
    terms: [
      {
        name: 'Relational model',
        description:
          'Модель данных из отношений: таблиц, строк, столбцов, ключей и ограничений. SQL описывает желаемый результат, а не пошаговый алгоритм обхода.',
      },
      {
        name: 'Constraint',
        description:
          'Правило, которое СУБД проверяет при записи: NOT NULL, CHECK, UNIQUE, PRIMARY KEY или FOREIGN KEY.',
      },
      {
        name: 'Invariant',
        description:
          'Условие, которое обязано оставаться истинным: сумма заказа положительна, email уникален, заказ ссылается на существующего клиента.',
      },
      {
        name: 'ACID',
        description:
          'Atomicity, Consistency, Isolation, Durability — свойства надёжных транзакционных изменений.',
      },
      {
        name: 'WAL',
        description:
          'Write-Ahead Log: журнал изменений записывается раньше соответствующих страниц данных и помогает восстановлению после сбоя.',
      },
      {
        name: 'SQLSTATE',
        description:
          'Стабильный машинный код ошибки PostgreSQL. Приложение должно проверять его, а не разбирать локализованный текст сообщения.',
      },
    ],
    steps: [
      {
        title: 'Моделируем инварианты',
        description:
          'Определяем сущности, идентичность, обязательность, допустимые состояния и связи до выбора ORM.',
      },
      {
        title: 'Закрепляем правила в DDL',
        description:
          'PRIMARY KEY, UNIQUE, CHECK и FOREIGN KEY защищают данные независимо от того, какой сервис выполняет запись.',
      },
      {
        title: 'Передаём значения параметрами',
        description:
          'Драйвер отправляет SQL и значения отдельно: $1 не склеивается со строкой запроса и не превращает пользовательский ввод в синтаксис.',
      },
      {
        title: 'Открываем транзакцию',
        description:
          'BEGIN создаёт единицу работы. Все связанные изменения либо COMMIT-ятся вместе, либо откатываются.',
      },
      {
        title: 'Получаем структурированную ошибку',
        description:
          'Нарушение CHECK возвращает SQLSTATE 23514; приложение преобразует техническую ошибку в доменный результат.',
      },
      {
        title: 'Проверяем откат',
        description:
          'Runtime вставляет строку внутри транзакции, выполняет ROLLBACK и подтверждает, что постоянное состояние не изменилось.',
      },
    ],
    nuances: [
      {
        title: 'Consistency — не только буква C',
        description:
          'СУБД гарантирует объявленные constraints, но не угадывает бизнес-инварианты. Если правило не выражено схемой или транзакционным кодом, ACID его не создаст.',
      },
      {
        title: 'NULL использует трёхзначную логику',
        description:
          'Сравнение с NULL даёт UNKNOWN, поэтому нужен IS NULL. CHECK пропускает выражение UNKNOWN, если отдельно не задан NOT NULL.',
      },
      {
        title: 'Типы — часть модели',
        description:
          'numeric подходит точным денежным вычислениям лучше float; timestamptz хранит момент времени, а не отображаемый часовой пояс.',
      },
      {
        title: 'Миграция — production-операция',
        description:
          'ALTER TABLE может взять тяжёлую блокировку или переписать таблицу. Миграцию оценивают по объёму данных, lock level и возможности отката.',
      },
      {
        title: 'Pool не является транзакцией',
        description:
          'Все запросы одной транзакции должны идти через один выделенный client. Отдельные pool.query могут попасть на разные соединения.',
      },
    ],
    codeIntro:
      'Драйвер pg передаёт значения отдельно, а правила находятся в самой схеме. Транзакция обязательно выполняется через один client и освобождает его в finally.',
    codeNotes: [
      'CHECK защищает инвариант даже от другого приложения.',
      '$1 — параметр протокола, а не подстановка строки.',
      'BEGIN и ROLLBACK должны выполняться на одном соединении.',
      'Код приложения сопоставляет SQLSTATE с доменной ошибкой.',
    ],
    examples: [
      {
        title: 'Constraint вместо условности',
        goal: 'Не позволить отрицательный остаток любому клиенту БД.',
        code: `CREATE TABLE accounts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  balance numeric(14, 2) NOT NULL CHECK (balance >= 0)
);`,
        notes: [
          'Проверка только в контроллере не защищает от worker или ручного SQL.',
          'Для сложного межстрочного правила может понадобиться транзакция.',
        ],
      },
      {
        title: 'Параметризованный SQL',
        goal: 'Передать пользовательское значение без SQL injection.',
        code: `const result = await pool.query(
  'SELECT id, email FROM users WHERE email = $1',
  [email],
);`,
        notes: [
          'Имена таблиц и направление сортировки нельзя параметризовать как значения — используйте allowlist.',
        ],
      },
      {
        title: 'Транзакция через один client',
        goal: 'Создать заказ и ledger entry атомарно.',
        code: `const client = await pool.connect();
try {
  await client.query('BEGIN');
  const order = await client.query(insertOrderSql, values);
  await client.query(insertLedgerSql, [order.rows[0].id]);
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}`,
        notes: ['Нельзя заменить client.query двумя независимыми pool.query.'],
      },
      {
        title: 'Constraint как domain result',
        goal: 'Обработать race на уникальном email корректно.',
        code: `try {
  await users.insert(email);
} catch (error) {
  if (error.code === '23505') {
    throw new EmailAlreadyExistsError(email);
  }
  throw error;
}`,
        notes: ['Предварительный SELECT не заменяет UNIQUE: между SELECT и INSERT есть race.'],
      },
    ],
    pitfalls: [
      {
        myth: 'Валидации DTO достаточно для целостности данных.',
        fact: 'DTO защищает один вход. Constraint защищает данные от всех входов и конкурирующих записей.',
      },
      {
        myth: 'ACID означает, что любое бизнес-правило соблюдается автоматически.',
        fact: 'СУБД соблюдает только выраженные ограничения и корректно написанные транзакции.',
      },
      {
        myth: 'Строковая интерполяция безопасна, если значение экранировать вручную.',
        fact: 'Для значений нужны параметры драйвера; динамические идентификаторы строятся только из allowlist.',
      },
      {
        myth: 'BEGIN на pool.query охватывает следующие pool.query.',
        fact: 'Pool может выбрать другое соединение. Транзакции принадлежат физическому соединению.',
      },
    ],
    questions: [
      'Какие инварианты вашего последнего проекта должны находиться в БД, а не только в сервисе?',
      'Почему SELECT перед INSERT не гарантирует уникальность?',
      'Чем atomicity отличается от consistency?',
      'Почему SQLSTATE надёжнее текста ошибки?',
      'Какие риски у миграции NOT NULL на большой таблице?',
    ],
  },

  'database-indexes-explain': {
    plain:
      'Индекс похож на отдельный указатель к книге. По нему можно быстро найти небольшой набор страниц, но указатель занимает место, обновляется при каждой записи и иногда читать книгу подряд дешевле, чем постоянно прыгать между страницами.',
    foundation:
      'PostgreSQL хранит таблицу как heap страниц, а индекс — отдельной структурой. Planner оценивает селективность условия по статистике и сравнивает стоимость Seq Scan, Index Scan, Index Only Scan и Bitmap Scan. B-tree поддерживает равенство, диапазоны и порядок; Hash — равенство; GIN — составные значения вроде массивов и full-text; BRIN хранит сводки диапазонов физических блоков и особенно полезен при корреляции значения с порядком строк.',
    why:
      'Индексирование без чтения плана приводит к двум противоположным проблемам: медленным запросам без подходящего пути доступа и дорогим записям с десятками бесполезных индексов. На собеседовании важнее объяснить trade-off и измерение, чем перечислить CREATE INDEX.',
    resources: [
      postgresDocumentation,
      {
        label: 'Index types',
        href: 'https://www.postgresql.org/docs/current/indexes-types.html',
        description:
          'B-tree, Hash, GiST, SP-GiST, GIN и BRIN: операторы и подходящие задачи.',
      },
      {
        label: 'Using EXPLAIN',
        href: 'https://www.postgresql.org/docs/current/using-explain.html',
        description:
          'Дерево плана, cost, rows, actual time, loops, buffers и ограничения EXPLAIN ANALYZE.',
      },
      {
        label: 'Multicolumn indexes',
        href: 'https://www.postgresql.org/docs/current/indexes-multicolumn.html',
        description:
          'Порядок колонок, leading columns и особенности разных типов индексов.',
      },
    ],
    runtimeLayers: databaseLayers,
    terms: [
      {
        name: 'Selectivity',
        description:
          'Доля строк, прошедших условие. Чем меньше подходящих строк, тем привлекательнее обычно становится индексный доступ.',
      },
      {
        name: 'B-tree',
        description:
          'Сбалансированное дерево для =, диапазонов, сортировки и prefix-поиска при подходящем operator class.',
      },
      {
        name: 'Hash index',
        description:
          'Индекс хэшей для сравнения на равенство. Он не помогает диапазонам и ORDER BY.',
      },
      {
        name: 'GIN',
        description:
          'Inverted index для значений с несколькими компонентами: массивов, jsonb и полнотекстовых lexemes.',
      },
      {
        name: 'BRIN',
        description:
          'Компактные сводки по диапазонам блоков. Эффективен, когда значение коррелирует с физическим порядком строк.',
      },
      {
        name: 'EXPLAIN ANALYZE',
        description:
          'Команда, которая не только строит план, но и реально выполняет запрос, показывая actual rows/time/loops.',
      },
      {
        name: 'Cardinality estimate',
        description:
          'Оценка числа строк planner-ом. Большой разрыв между Plan Rows и Actual Rows часто указывает на плохую статистику или зависимые признаки.',
      },
    ],
    steps: [
      {
        title: 'Фиксируем реальный запрос',
        description:
          'Оптимизируют конкретный SQL с конкретными параметрами, объёмом и распределением данных, а не таблицу в абстракции.',
      },
      {
        title: 'Получаем baseline',
        description:
          'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) показывает дерево плана до изменения схемы.',
      },
      {
        title: 'Читаем снизу вверх',
        description:
          'Нижние scan nodes получают строки, верхние фильтруют, соединяют, агрегируют, сортируют и ограничивают результат.',
      },
      {
        title: 'Сравниваем estimates с actual',
        description:
          'Проверяем rows, loops, время, removed rows и buffers. Ошибка оценки может привести к неправильному join algorithm.',
      },
      {
        title: 'Добавляем узкий индекс',
        description:
          'Составной B-tree соответствует tenant filter и ORDER BY; INCLUDE может помочь index-only scan.',
      },
      {
        title: 'Повторяем измерение',
        description:
          'После ANALYZE повторно читаем план и учитываем cache warmup, стоимость записи и размер новых структур.',
      },
    ],
    nuances: [
      {
        title: 'Seq Scan не означает ошибку',
        description:
          'Если запрос возвращает большую часть таблицы, последовательное чтение часто дешевле случайных обращений через индекс.',
      },
      {
        title: 'Cost — не миллисекунды',
        description:
          'Planner cost выражен в относительных единицах. Actual Time — измерение конкретного запуска и тоже зависит от cache и нагрузки.',
      },
      {
        title: 'Порядок колонок важен',
        description:
          'B-tree (tenant_id, created_at) хорошо обслуживает tenant_id и tenant_id+created_at, но обычно не поиск только по created_at.',
      },
      {
        title: 'EXPLAIN ANALYZE выполняет запрос',
        description:
          'Для UPDATE/DELETE он изменит данные. Исследование опасной команды проводят внутри BEGIN/ROLLBACK или на безопасной копии.',
      },
      {
        title: 'Index Only Scan не гарантирует отсутствие heap',
        description:
          'Visibility map должна подтверждать видимость страниц; иначе executor всё равно выполняет heap fetches.',
      },
    ],
    codeIntro:
      'Один и тот же параметризованный SELECT измеряется до и после составного B-tree. Дополнительные Hash, BRIN и GIN создаются для сравнения размеров и назначения, а не как рекомендация добавить все сразу.',
    codeNotes: [
      'ANALYZE обновляет статистику распределения данных.',
      'FORMAT JSON позволяет программе разобрать дерево плана.',
      'Порядок B-tree повторяет равенство tenant_id и диапазон/сортировку created_at.',
      'Решение planner-а важнее самого факта существования индекса.',
    ],
    examples: [
      {
        title: 'Составной B-tree',
        goal: 'Фильтровать tenant и отдавать свежие события без отдельной сортировки.',
        code: `CREATE INDEX events_tenant_created_idx
ON events (tenant_id, created_at DESC)
INCLUDE (status);`,
        notes: [
          'Равенства обычно ставят перед диапазоном.',
          'INCLUDE увеличивает индекс и стоимость записи.',
        ],
      },
      {
        title: 'Partial index',
        goal: 'Индексировать только незавершённую небольшую часть заказов.',
        code: `CREATE INDEX orders_pending_idx
ON orders (created_at)
WHERE status = 'pending';`,
        notes: ['Условие запроса должно позволять planner-у вывести predicate индекса.'],
      },
      {
        title: 'GIN для массива',
        goal: 'Искать события, содержащие определённый тег.',
        code: `CREATE INDEX events_tags_gin ON events USING gin (tags);

SELECT * FROM events WHERE tags @> ARRAY['priority'];`,
        notes: ['GIN ускоряет чтение, но может быть заметно дороже при записи.'],
      },
      {
        title: 'Безопасный EXPLAIN для UPDATE',
        goal: 'Получить actual plan и не сохранить изменение.',
        code: `BEGIN;
EXPLAIN (ANALYZE, BUFFERS)
UPDATE accounts SET balance = balance + 10 WHERE id = 42;
ROLLBACK;`,
        notes: ['Триггеры и блокировки всё равно реально сработают до ROLLBACK.'],
      },
    ],
    pitfalls: [
      {
        myth: 'Индекс всегда ускоряет запрос.',
        fact: 'Planner может предпочесть Seq Scan; индекс замедляет INSERT/UPDATE/DELETE и занимает память/диск.',
      },
      {
        myth: 'Чем больше индексов, тем лучше.',
        fact: 'Перекрывающиеся и неиспользуемые индексы создают write amplification и усложняют vacuum.',
      },
      {
        myth: 'Первый столбец составного индекса не важен.',
        fact: 'Для B-tree leading columns определяют, какие условия эффективно сужают диапазон.',
      },
      {
        myth: 'EXPLAIN ANALYZE безопасно только показывает план.',
        fact: 'Он выполняет запрос. Изменяющая команда действительно изменит данные без явного отката.',
      },
    ],
    questions: [
      'Почему planner выбирает Seq Scan при существующем индексе?',
      'Чем Bitmap Heap Scan отличается от обычного Index Scan?',
      'Для каких данных BRIN может быть лучше B-tree?',
      'Что означает большой разрыв между estimated rows и actual rows?',
      'Как индекс влияет на INSERT и VACUUM?',
      'Почему порядок (tenant_id, created_at) выбран именно таким?',
    ],
  },

  'database-transactions-locks': {
    plain:
      'Две операции могут быть правильными по отдельности и вместе испортить данные. Изоляция определяет, какие изменения видит каждая транзакция, а блокировки и проверки версии решают, кто имеет право изменить одну и ту же строку.',
    foundation:
      'PostgreSQL использует MVCC: изменения создают новые версии строк, а транзакция читает подходящий snapshot. READ COMMITTED получает новый snapshot на каждый statement; REPEATABLE READ сохраняет снимок транзакции и в PostgreSQL также не допускает phantom reads; SERIALIZABLE обнаруживает опасные зависимости и может завершить транзакцию SQLSTATE 40001. SELECT FOR UPDATE берёт row-level lock. Optimistic locking обновляет строку только при совпадении version.',
    why:
      'Проблемы lost update, overselling, двойного списания и write skew редко воспроизводятся одиночным тестом. Senior-разработчик проектирует единицу транзакции, выбирает уровень изоляции, ограничивает время ожидания и умеет повторять serialization/deadlock failures.',
    resources: [
      postgresDocumentation,
      {
        label: 'Transaction isolation',
        href: 'https://www.postgresql.org/docs/current/transaction-iso.html',
        description:
          'Уровни изоляции PostgreSQL, snapshots, serialization anomalies и retry.',
      },
      {
        label: 'Explicit locking',
        href: 'https://www.postgresql.org/docs/current/explicit-locking.html',
        description:
          'Table-level, row-level и advisory locks, deadlocks и время удержания.',
      },
      {
        label: 'MVCC introduction',
        href: 'https://www.postgresql.org/docs/current/mvcc-intro.html',
        description:
          'Модель конкурентного доступа и преимущества multiversion concurrency control.',
      },
    ],
    runtimeLayers: databaseLayers,
    terms: [
      {
        name: 'MVCC',
        description:
          'Multiversion Concurrency Control: readers видят подходящие версии строк и обычно не блокируют writers.',
      },
      {
        name: 'Snapshot',
        description:
          'Набор правил видимости версий данных для statement или транзакции.',
      },
      {
        name: 'Isolation level',
        description:
          'Контракт видимости и допустимых аномалий: Read Committed, Repeatable Read или Serializable.',
      },
      {
        name: 'Pessimistic lock',
        description:
          'Предварительное получение блокировки, например SELECT FOR UPDATE, перед изменением спорного ресурса.',
      },
      {
        name: 'Optimistic lock',
        description:
          'Условный UPDATE по старой version; rowCount=0 означает, что конкурент уже изменил строку.',
      },
      {
        name: 'Deadlock',
        description:
          'Цикл ожиданий: A держит ресурс 1 и ждёт 2, B держит 2 и ждёт 1. PostgreSQL прерывает одного участника.',
      },
      {
        name: 'Serialization failure',
        description:
          'SQLSTATE 40001: результат нельзя безопасно представить как последовательное выполнение; всю транзакцию нужно повторить.',
      },
    ],
    steps: [
      {
        title: 'Открываем два соединения',
        description:
          'Конкуренция моделируется разными PostgreSQL sessions, а не двумя Promise на одном занятом client.',
      },
      {
        title: 'Сравниваем snapshots',
        description:
          'В READ COMMITTED повторный SELECT видит чужой COMMIT; в REPEATABLE READ продолжает видеть снимок транзакции.',
      },
      {
        title: 'Берём FOR UPDATE',
        description:
          'Первая транзакция блокирует строку; вторая ждёт до COMMIT или timeout.',
      },
      {
        title: 'Изменяем под блокировкой',
        description:
          'Обе операции читают актуальный остаток последовательно, поэтому итог не теряет одно из изменений.',
      },
      {
        title: 'Проверяем version',
        description:
          'Первый optimistic UPDATE увеличивает version, второй UPDATE со старой version меняет ноль строк.',
      },
      {
        title: 'Ограничиваем и повторяем',
        description:
          'lock_timeout и statement_timeout ограничивают зависание; deadlock/serialization failures обрабатываются bounded retry всей транзакции.',
      },
    ],
    nuances: [
      {
        title: 'Read Committed — default PostgreSQL',
        description:
          'Каждая команда получает новый snapshot. Два SELECT внутри одной транзакции могут увидеть разные committed значения.',
      },
      {
        title: 'PostgreSQL Repeatable Read сильнее минимума SQL',
        description:
          'Документация PostgreSQL отмечает, что на этом уровне phantom reads не допускаются, хотя стандарт SQL разрешает их.',
      },
      {
        title: 'Serializable требует retry',
        description:
          'Это не глобальная очередь. PostgreSQL допускает параллельную работу, обнаруживает опасный граф зависимостей и отменяет одну транзакцию.',
      },
      {
        title: 'Row lock живёт до конца транзакции',
        description:
          'Сетевой вызов или тяжёлое вычисление внутри открытой транзакции увеличивает contention, bloat и риск timeout.',
      },
      {
        title: 'Deadlock возможен и с правильными запросами',
        description:
          'Единый порядок захвата ресурсов уменьшает вероятность, но приложение всё равно должно корректно обрабатывать SQLSTATE 40P01.',
      },
    ],
    codeIntro:
      'Runtime открывает две настоящие sessions. Сначала он сравнивает snapshots, затем показывает ожидание SELECT FOR UPDATE и конфликт optimistic version без бесконечных блокировок.',
    codeNotes: [
      'Изоляция задаётся сразу после BEGIN.',
      'FOR UPDATE блокирует найденную строку до COMMIT/ROLLBACK.',
      'Вторая session действительно ждёт освобождения row lock.',
      'Optimistic conflict определяется по rowCount, а не по исключению.',
    ],
    examples: [
      {
        title: 'Пессимистичное списание',
        goal: 'Не дать двум операциям одновременно списать один остаток.',
        code: `BEGIN;

SELECT balance
FROM accounts
WHERE id = $1
FOR UPDATE;

UPDATE accounts
SET balance = balance - $2
WHERE id = $1;

COMMIT;`,
        notes: ['Транзакция должна быть короткой; всегда задавайте timeout.'],
      },
      {
        title: 'Optimistic version',
        goal: 'Обнаружить конфликт без предварительного row lock.',
        code: `UPDATE documents
SET body = $1, version = version + 1
WHERE id = $2 AND version = $3;

// rowCount === 0 -> reload or report conflict`,
        notes: ['Подходит, когда конфликты редки и повторение/отказ дешевле ожидания.'],
      },
      {
        title: 'Retry Serializable',
        goal: 'Повторить всю единицу работы после SQLSTATE 40001.',
        code: `for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    return await runSerializableTransaction();
  } catch (error) {
    if (error.code !== '40001' || attempt === 3) throw error;
    await backoff(attempt);
  }
}`,
        notes: [
          'Повторяется вся транзакция, а не только последняя команда.',
          'Внешний side effect нельзя бездумно выполнять внутри retry.',
        ],
      },
      {
        title: 'Единый порядок locks',
        goal: 'Снизить вероятность deadlock при переводе.',
        code: `const [firstId, secondId] = [fromId, toId].sort();

SELECT id FROM accounts
WHERE id IN ($1, $2)
ORDER BY id
FOR UPDATE;`,
        notes: ['SQLSTATE 40P01 всё равно должен обрабатываться.'],
      },
    ],
    pitfalls: [
      {
        myth: 'Транзакция автоматически устраняет все race conditions.',
        fact: 'Результат зависит от уровня изоляции, запросов, locks и выраженных constraints.',
      },
      {
        myth: 'READ COMMITTED повторяет одно и то же чтение.',
        fact: 'В PostgreSQL новый statement получает новый snapshot и может увидеть чужой COMMIT.',
      },
      {
        myth: 'SELECT FOR UPDATE ускоряет конкурентный код.',
        fact: 'Он сериализует доступ к строке и может создать очередь ожидания.',
      },
      {
        myth: 'Serializable означает отсутствие ошибок.',
        fact: 'Для сохранения сериального результата СУБД может отменить транзакцию, поэтому нужен retry.',
      },
    ],
    questions: [
      'Почему два Promise на одном client не моделируют две конкурентные транзакции?',
      'Что изменится между двумя SELECT в READ COMMITTED?',
      'Когда optimistic locking предпочтительнее SELECT FOR UPDATE?',
      'Почему нельзя отправлять HTTP-запрос, удерживая row lock?',
      'Какие SQLSTATE требуют повторения всей транзакции?',
      'Как единый порядок захвата ресурсов уменьшает deadlock?',
    ],
  },

  'database-joins-materialized-views': {
    plain:
      'JOIN собирает связанные данные, но для этого СУБД должна прочитать два набора строк и найти пары. Materialized View заранее сохраняет результат тяжёлого запроса: чтение становится дешевле, зато сохранённые данные устаревают до следующего REFRESH.',
    foundation:
      'INNER JOIN оставляет совпавшие пары, LEFT JOIN сохраняет все строки слева и дополняет отсутствующие правые значения NULL. Planner выбирает nested loop, hash join или merge join по размерам, порядку и индексам. Агрегация и сортировка требуют CPU и памяти, а иногда временных файлов. Materialized View физически хранит результат SELECT и обновляется явно. ORM может ускорять CRUD и mapping, но не отменяет SQL, plans, транзакции и стоимость round trips.',
    why:
      'Большинство production-проблем «ORM тормозит» на деле оказываются N+1, лишними колонками, неверной cardinality estimate, отсутствующим индексом на join key или слишком широким transaction scope. Контроль начинается с видимого SQL и измеряемого плана.',
    resources: [
      postgresDocumentation,
      {
        label: 'Joins between tables',
        href: 'https://www.postgresql.org/docs/current/tutorial-join.html',
        description:
          'Базовая семантика INNER и OUTER JOIN, aliases и условия соединения.',
      },
      {
        label: 'Planner join strategies',
        href: 'https://www.postgresql.org/docs/current/planner-optimizer.html',
        description:
          'Поиск путей доступа и комбинаций join-ов в PostgreSQL planner.',
      },
      {
        label: 'Materialized Views',
        href: 'https://www.postgresql.org/docs/current/rules-materializedviews.html',
        description:
          'Физически сохранённый результат, REFRESH и trade-off свежести против скорости.',
      },
    ],
    runtimeLayers: databaseLayers,
    terms: [
      {
        name: 'INNER JOIN',
        description:
          'Возвращает только комбинации строк, удовлетворяющие условию ON.',
      },
      {
        name: 'LEFT JOIN',
        description:
          'Сохраняет каждую строку слева; при отсутствии пары правые столбцы становятся NULL.',
      },
      {
        name: 'Nested Loop',
        description:
          'Для каждой строки outer input ищет строки inner input. Особенно хорош для маленького outer и индексного lookup.',
      },
      {
        name: 'Hash Join',
        description:
          'Строит hash table по одному входу и проверяет второй. Подходит большим неотсортированным наборам и равенству.',
      },
      {
        name: 'Merge Join',
        description:
          'Идёт по двум отсортированным входам. Может использовать порядок индексов и поддерживает некоторые неравенства.',
      },
      {
        name: 'N+1 query',
        description:
          'Один запрос получает N сущностей, затем ещё N запросов загружают связанные данные — много лишних round trips.',
      },
      {
        name: 'Materialized View',
        description:
          'Физически сохранённый результат запроса, который остаётся устаревшим до REFRESH.',
      },
    ],
    steps: [
      {
        title: 'Создаём связанную модель',
        description:
          'customers и orders соединяются через FOREIGN KEY; индекс на orders.customer_id поддерживает lookup.',
      },
      {
        title: 'Выполняем JOIN',
        description:
          'Planner выбирает scan и join algorithms, затем aggregation и top-N sort.',
      },
      {
        title: 'Читаем план',
        description:
          'Runtime показывает дерево, actual rows и время: JOIN — это оператор над двумя входами, а не бесплатное склеивание.',
      },
      {
        title: 'Воспроизводим N+1',
        description:
          'Двадцать связанных выборок создают 21 round trip; один grouped JOIN выполняет ту же форму загрузки одним запросом.',
      },
      {
        title: 'Сохраняем агрегацию',
        description:
          'Materialized View записывает totals и получает собственный индекс для быстрого поиска.',
      },
      {
        title: 'Наблюдаем staleness',
        description:
          'Новый заказ не меняет сохранённый total до REFRESH MATERIALIZED VIEW.',
      },
    ],
    nuances: [
      {
        title: 'JOIN — не обязательно плохо',
        description:
          'Один хорошо спланированный JOIN часто дешевле N+1. Проблема определяется объёмом, селективностью, indexes, spills и количеством возвращаемых строк.',
      },
      {
        title: 'WHERE может сломать LEFT JOIN',
        description:
          'Условие WHERE по правой таблице отбрасывает NULL-строки и фактически может превратить outer join в inner. Иногда условие должно находиться в ON.',
      },
      {
        title: 'Rows multiply',
        description:
          'Связь one-to-many размножает строку родителя. JOIN нескольких коллекций может создать декартово произведение до aggregation.',
      },
      {
        title: 'Materialized View — не автоматический cache',
        description:
          'PostgreSQL не обновляет его при каждой записи. Нужна стратегия refresh, допустимая задержка и мониторинг неуспешного обновления.',
      },
      {
        title: 'REFRESH CONCURRENTLY имеет условия',
        description:
          'Нужен подходящий UNIQUE index; concurrent refresh обычно дольше, но позволяет продолжать чтение старой версии.',
      },
      {
        title: 'ORM — trade-off, не религия',
        description:
          'ORM полезен для mapping, migrations и простого CRUD. Опасность начинается, когда команда не видит generated SQL, N+1 и transaction boundaries.',
      },
    ],
    codeIntro:
      'Runtime сравнивает 21 последовательный round trip с одним JOIN, показывает настоящее дерево плана и доказывает, что materialized result остаётся старым до REFRESH.',
    codeNotes: [
      'FOREIGN KEY задаёт семантическую связь, индекс — физический путь доступа.',
      'JOIN algorithm выбирает planner, а не текст SQL напрямую.',
      'N+1 — проблема количества запросов, даже если каждый запрос быстрый.',
      'Materialized View имеет собственное состояние и indexes.',
    ],
    examples: [
      {
        title: 'LEFT JOIN с условием в ON',
        goal: 'Сохранить клиентов без оплаченных заказов.',
        code: `SELECT c.id, count(o.id)
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.id
 AND o.status = 'paid'
GROUP BY c.id;`,
        notes: ['Если перенести o.status в WHERE, клиенты без заказов исчезнут.'],
      },
      {
        title: 'DataLoader-style batching',
        goal: 'Убрать N+1, не создавая огромный JOIN.',
        code: `SELECT customer_id, id, amount
FROM orders
WHERE customer_id = ANY($1::bigint[]);`,
        notes: ['Результат группируется в приложении по customer_id.'],
      },
      {
        title: 'Materialized View',
        goal: 'Предварительно вычислять дневную аналитику.',
        code: `CREATE MATERIALIZED VIEW daily_sales AS
SELECT date_trunc('day', created_at) AS day,
       sum(amount) AS total
FROM orders
GROUP BY 1;

REFRESH MATERIALIZED VIEW daily_sales;`,
        notes: ['Нужно явно определить допустимую задержку данных.'],
      },
      {
        title: 'Repository с видимым SQL',
        goal: 'Сохранить Nest DI без потери контроля над запросом.',
        code: `@Injectable()
export class OrdersRepository {
  constructor(@Inject(PG_POOL) private readonly db: Pool) {}

  findRecent(customerId: number) {
    return this.db.query(
      \`SELECT id, amount
       FROM orders
       WHERE customer_id = $1
       ORDER BY created_at DESC
       LIMIT 20\`,
      [customerId],
    );
  }
}`,
        notes: [
          'Репозиторий — граница инфраструктуры, а не место для скрытия неизвестного SQL.',
        ],
      },
    ],
    pitfalls: [
      {
        myth: 'JOIN всегда медленнее нескольких простых запросов.',
        fact: 'Один set-based запрос часто уменьшает round trips; решение подтверждается планом и измерением.',
      },
      {
        myth: 'Индекс нужен только на PRIMARY KEY.',
        fact: 'Внешний ключ не создаёт автоматический индекс на referencing column; join/delete parent могут нуждаться в нём.',
      },
      {
        myth: 'Materialized View всегда содержит свежие данные.',
        fact: 'Он показывает результат последнего успешного REFRESH.',
      },
      {
        myth: 'Отказ от ORM автоматически делает SQL быстрым.',
        fact: 'Плохой raw SQL остаётся плохим. Важны модель, параметры, plans, indexes и observability.',
      },
    ],
    questions: [
      'Когда nested loop лучше hash join?',
      'Как WHERE по правой таблице меняет LEFT JOIN?',
      'Почему N+1 остаётся проблемой при быстрых индексных lookup?',
      'Как определить допустимую staleness Materialized View?',
      'Что требуется для REFRESH MATERIALIZED VIEW CONCURRENTLY?',
      'Какие гарантии должен предоставлять repository независимо от ORM?',
    ],
  },
};
