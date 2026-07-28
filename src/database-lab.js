import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import pg from 'pg';

const { Pool } = pg;
const STATEMENT_TIMEOUT_MS = 8_000;
const CONNECTION_TIMEOUT_MS = 1_500;

function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || null;
}

function safeIdentifier(prefix) {
  return `${prefix}_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
}

function planReport(result) {
  const raw = result.rows[0]['QUERY PLAN'];
  const report = Array.isArray(raw) ? raw[0] : JSON.parse(raw)[0];
  const nodes = [];

  function visit(node, depth = 0) {
    nodes.push({
      depth,
      type: node['Node Type'],
      relation: node['Relation Name'] ?? null,
      index: node['Index Name'] ?? null,
      estimatedRows: node['Plan Rows'],
      actualRows: node['Actual Rows'],
      loops: node['Actual Loops'],
    });
    for (const child of node.Plans ?? []) visit(child, depth + 1);
  }

  visit(report.Plan);
  return {
    nodes,
    executionMs: Number(report['Execution Time'] ?? 0),
    planningMs: Number(report['Planning Time'] ?? 0),
  };
}

function planLine(plan) {
  return plan.nodes
    .map((node) => {
      const target = node.index ?? node.relation;
      return `${'  '.repeat(node.depth)}${node.type}${target ? ` [${target}]` : ''}`;
    })
    .join(' → ');
}

async function configureClient(client) {
  await client.query(`SET statement_timeout = '${STATEMENT_TIMEOUT_MS}ms'`);
  await client.query(
    `SET idle_in_transaction_session_timeout = '${STATEMENT_TIMEOUT_MS}ms'`,
  );
  await client.query("SET lock_timeout = '2500ms'");
}

async function rollbackQuietly(client) {
  if (!client) return;
  try {
    await client.query('ROLLBACK');
  } catch {
    // The client may not currently be in a transaction.
  }
}

async function withDatabaseLab(emit, run) {
  const connectionString = databaseUrl();
  if (!connectionString) {
    emit(
      'postgres',
      'skip',
      'PostgreSQL не подключён: задайте DATABASE_URL или запустите проект через Docker Compose',
    );
    return false;
  }

  const pool = new Pool({
    connectionString,
    max: 4,
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    idleTimeoutMillis: 5_000,
    allowExitOnIdle: true,
    application_name: 'node-loop-lab',
  });
  const schema = safeIdentifier('node_loop_lab');

  try {
    const versionResult = await pool.query(
      "SELECT current_setting('server_version') AS version",
    );
    emit(
      'postgres',
      'connect',
      `Подключён PostgreSQL ${versionResult.rows[0].version}; создаём изолированную схему ${schema}`,
    );
    await pool.query(`CREATE SCHEMA ${schema}`);
    await run({ pool, schema });
    return true;
  } catch (error) {
    const safeMessage =
      error?.code === 'ECONNREFUSED'
        ? 'соединение отклонено'
        : error?.code
          ? `SQLSTATE ${error.code}`
          : 'ошибка подключения';
    emit('postgres', 'error', `Сценарий PostgreSQL остановлен: ${safeMessage}`);
    return false;
  } finally {
    try {
      await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      emit('cleanup', 'drop', 'Учебная схема удалена; постоянные данные не создавались');
    } catch {
      // Connection failures can make cleanup impossible; the schema name is unique
      // and contains no user data.
    }
    await pool.end().catch(() => {});
  }
}

export async function databaseConstraintsAndAcid(emit) {
  await withDatabaseLab(emit, async ({ pool, schema }) => {
    const client = await pool.connect();
    try {
      await configureClient(client);
      emit(
        'ddl',
        'schema',
        'Создаём PRIMARY KEY, UNIQUE, CHECK и FOREIGN KEY как правила целостности внутри БД',
      );
      await client.query(`
        CREATE TABLE ${schema}.customers (
          id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          email text NOT NULL UNIQUE,
          name text NOT NULL CHECK (char_length(name) >= 2)
        );

        CREATE TABLE ${schema}.orders (
          id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          customer_id bigint NOT NULL
            REFERENCES ${schema}.customers(id) ON DELETE RESTRICT,
          amount numeric(12, 2) NOT NULL CHECK (amount > 0),
          status text NOT NULL DEFAULT 'new'
            CHECK (status IN ('new', 'paid', 'cancelled'))
        );
      `);

      const customer = await client.query(
        `INSERT INTO ${schema}.customers (email, name)
         VALUES ($1, $2)
         RETURNING id`,
        ['learner@example.com', 'Learner'],
      );
      emit(
        'query',
        'parameters',
        'Параметры $1/$2 переданы отдельно от SQL: значения не становятся частью синтаксиса запроса',
      );

      try {
        await client.query(
          `INSERT INTO ${schema}.orders (customer_id, amount)
           VALUES ($1, $2)`,
          [customer.rows[0].id, -50],
        );
      } catch (error) {
        emit(
          'constraint',
          'check',
          `CHECK отклонил отрицательную сумму: SQLSTATE ${error.code}`,
        );
      }

      await client.query('BEGIN');
      await client.query(
        `INSERT INTO ${schema}.orders (customer_id, amount, status)
         VALUES ($1, $2, $3)`,
        [customer.rows[0].id, 1250, 'paid'],
      );
      const inside = await client.query(
        `SELECT count(*)::int AS count FROM ${schema}.orders`,
      );
      await client.query('ROLLBACK');
      const after = await client.query(
        `SELECT count(*)::int AS count FROM ${schema}.orders`,
      );
      emit(
        'transaction',
        'rollback',
        `Внутри транзакции строк=${inside.rows[0].count}; после ROLLBACK строк=${after.rows[0].count}`,
      );

      emit(
        'acid',
        'model',
        'ACID: constraints поддерживают consistency, транзакция даёт atomicity, WAL/disk — durability, а isolation управляет видимостью параллельных изменений',
      );
    } finally {
      await rollbackQuietly(client);
      client.release();
    }
  });
}

export async function databaseIndexesAndExplain(emit) {
  await withDatabaseLab(emit, async ({ pool, schema }) => {
    const client = await pool.connect();
    try {
      await configureClient(client);
      emit(
        'dataset',
        'seed',
        'Создаём 40 000 событий с коррелированным временем, tenant_id, status и массивом tags',
      );
      await client.query(`
        CREATE TABLE ${schema}.events (
          id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          tenant_id integer NOT NULL,
          created_at timestamptz NOT NULL,
          status text NOT NULL,
          tags text[] NOT NULL
        );

        INSERT INTO ${schema}.events (tenant_id, created_at, status, tags)
        SELECT
          (g % 100) + 1,
          now() - (g * interval '1 second'),
          CASE WHEN g % 5 = 0 THEN 'failed' ELSE 'processed' END,
          ARRAY[
            CASE WHEN g % 3 = 0 THEN 'api' ELSE 'worker' END,
            CASE WHEN g % 7 = 0 THEN 'priority' ELSE 'normal' END
          ]
        FROM generate_series(1, 40000) AS g;

        ANALYZE ${schema}.events;
      `);

      const query = `
        SELECT id, created_at, status
        FROM ${schema}.events
        WHERE tenant_id = 37
          AND created_at >= now() - interval '6 hours'
        ORDER BY created_at DESC
      `;
      const before = planReport(
        await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`),
      );
      emit(
        'planner',
        'before-index',
        `До составного индекса: ${planLine(before)}; execution=${before.executionMs.toFixed(2)} ms`,
      );

      await client.query(`
        CREATE INDEX events_tenant_created_btree
          ON ${schema}.events USING btree (tenant_id, created_at DESC)
          INCLUDE (status);
        CREATE INDEX events_status_hash
          ON ${schema}.events USING hash (status);
        CREATE INDEX events_created_brin
          ON ${schema}.events USING brin (created_at);
        CREATE INDEX events_tags_gin
          ON ${schema}.events USING gin (tags);
        ANALYZE ${schema}.events;
      `);

      const after = planReport(
        await client.query(`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`),
      );
      emit(
        'planner',
        'after-index',
        `После B-tree: ${planLine(after)}; execution=${after.executionMs.toFixed(2)} ms`,
      );

      const sizes = await client.query(
        `
          SELECT c.relname, pg_relation_size(c.oid)::bigint AS bytes
          FROM pg_class AS c
          JOIN pg_namespace AS n ON n.oid = c.relnamespace
          WHERE n.nspname = $1 AND c.relkind = 'i'
          ORDER BY bytes DESC
        `,
        [schema],
      );
      emit(
        'indexes',
        'size',
        `Размеры индексов: ${sizes.rows
          .map((row) => `${row.relname}=${Math.round(Number(row.bytes) / 1024)} KiB`)
          .join(', ')}`,
      );
      emit(
        'optimizer',
        'decision',
        'Индекс не является приказом: planner выбирает Seq Scan, Index Scan или Bitmap Scan по статистике, селективности и стоимости',
      );
    } finally {
      client.release();
    }
  });
}

export async function databaseTransactionsAndLocks(emit) {
  await withDatabaseLab(emit, async ({ pool, schema }) => {
    await pool.query(`
      CREATE TABLE ${schema}.accounts (
        id integer PRIMARY KEY,
        balance integer NOT NULL CHECK (balance >= 0),
        version integer NOT NULL DEFAULT 0
      );
      INSERT INTO ${schema}.accounts (id, balance) VALUES (1, 1000);
    `);

    const first = await pool.connect();
    const second = await pool.connect();
    try {
      await Promise.all([configureClient(first), configureClient(second)]);

      await first.query('BEGIN ISOLATION LEVEL READ COMMITTED');
      const rcBefore = await first.query(
        `SELECT balance FROM ${schema}.accounts WHERE id = 1`,
      );
      await second.query(
        `UPDATE ${schema}.accounts SET balance = 1100 WHERE id = 1`,
      );
      const rcAfter = await first.query(
        `SELECT balance FROM ${schema}.accounts WHERE id = 1`,
      );
      await first.query('ROLLBACK');
      emit(
        'isolation',
        'read-committed',
        `READ COMMITTED: первый SELECT=${rcBefore.rows[0].balance}, второй SELECT=${rcAfter.rows[0].balance}`,
      );

      await pool.query(
        `UPDATE ${schema}.accounts SET balance = 1000, version = 0 WHERE id = 1`,
      );
      await first.query('BEGIN ISOLATION LEVEL REPEATABLE READ');
      const rrBefore = await first.query(
        `SELECT balance FROM ${schema}.accounts WHERE id = 1`,
      );
      await second.query(
        `UPDATE ${schema}.accounts SET balance = 1100 WHERE id = 1`,
      );
      const rrAfter = await first.query(
        `SELECT balance FROM ${schema}.accounts WHERE id = 1`,
      );
      await first.query('ROLLBACK');
      emit(
        'isolation',
        'repeatable-read',
        `REPEATABLE READ: первый SELECT=${rrBefore.rows[0].balance}, второй SELECT=${rrAfter.rows[0].balance}`,
      );

      await pool.query(
        `UPDATE ${schema}.accounts SET balance = 1000, version = 0 WHERE id = 1`,
      );
      await first.query('BEGIN');
      await first.query(
        `SELECT balance FROM ${schema}.accounts WHERE id = 1 FOR UPDATE`,
      );
      await second.query('BEGIN');
      let secondAcquired = false;
      const waitStarted = performance.now();
      const secondLock = second
        .query(
          `SELECT balance FROM ${schema}.accounts WHERE id = 1 FOR UPDATE`,
        )
        .then((result) => {
          secondAcquired = true;
          return result;
        });
      await new Promise((resolve) => setTimeout(resolve, 120));
      emit(
        'lock',
        'wait',
        `SELECT FOR UPDATE: вторая транзакция ждёт блокировку=${!secondAcquired}`,
      );
      await first.query(
        `UPDATE ${schema}.accounts SET balance = balance - 100 WHERE id = 1`,
      );
      await first.query('COMMIT');
      await secondLock;
      const waitedMs = performance.now() - waitStarted;
      await second.query(
        `UPDATE ${schema}.accounts SET balance = balance - 200 WHERE id = 1`,
      );
      await second.query('COMMIT');
      const pessimistic = await pool.query(
        `SELECT balance FROM ${schema}.accounts WHERE id = 1`,
      );
      emit(
        'lock',
        'pessimistic',
        `Пессимистичная блокировка ждала ${waitedMs.toFixed(0)} ms; итоговый balance=${pessimistic.rows[0].balance}`,
      );

      await pool.query(
        `UPDATE ${schema}.accounts SET balance = 1000, version = 0 WHERE id = 1`,
      );
      const snapshotA = await first.query(
        `SELECT balance, version FROM ${schema}.accounts WHERE id = 1`,
      );
      const snapshotB = await second.query(
        `SELECT balance, version FROM ${schema}.accounts WHERE id = 1`,
      );
      const updateA = await first.query(
        `UPDATE ${schema}.accounts
         SET balance = $1, version = version + 1
         WHERE id = 1 AND version = $2`,
        [snapshotA.rows[0].balance - 100, snapshotA.rows[0].version],
      );
      const updateB = await second.query(
        `UPDATE ${schema}.accounts
         SET balance = $1, version = version + 1
         WHERE id = 1 AND version = $2`,
        [snapshotB.rows[0].balance - 200, snapshotB.rows[0].version],
      );
      emit(
        'lock',
        'optimistic',
        `Оптимистичная версия: update A=${updateA.rowCount}, stale update B=${updateB.rowCount}; 0 означает конфликт`,
      );
    } finally {
      await Promise.all([rollbackQuietly(first), rollbackQuietly(second)]);
      first.release();
      second.release();
    }
  });
}

export async function databaseJoinsAndMaterializedViews(emit) {
  await withDatabaseLab(emit, async ({ pool, schema }) => {
    const client = await pool.connect();
    try {
      await configureClient(client);
      emit(
        'dataset',
        'seed',
        'Создаём 2 000 клиентов и 30 000 заказов для JOIN и агрегирования',
      );
      await client.query(`
        CREATE TABLE ${schema}.customers (
          id integer PRIMARY KEY,
          name text NOT NULL,
          active boolean NOT NULL
        );
        CREATE TABLE ${schema}.orders (
          id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          customer_id integer NOT NULL REFERENCES ${schema}.customers(id),
          amount numeric(12, 2) NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        );
        INSERT INTO ${schema}.customers (id, name, active)
        SELECT g, 'customer-' || g, g % 5 <> 0
        FROM generate_series(1, 2000) AS g;
        INSERT INTO ${schema}.orders (customer_id, amount, created_at)
        SELECT
          (g % 2000) + 1,
          ((g % 5000) + 100)::numeric / 10,
          now() - (g * interval '1 minute')
        FROM generate_series(1, 30000) AS g;
        CREATE INDEX orders_customer_id_idx
          ON ${schema}.orders (customer_id);
        ANALYZE ${schema}.customers;
        ANALYZE ${schema}.orders;
      `);

      const joinPlan = planReport(
        await client.query(`
          EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
          SELECT c.id, c.name, sum(o.amount) AS total
          FROM ${schema}.customers AS c
          JOIN ${schema}.orders AS o ON o.customer_id = c.id
          WHERE c.active
          GROUP BY c.id, c.name
          ORDER BY total DESC
          LIMIT 20
        `),
      );
      emit(
        'join',
        'plan',
        `JOIN plan: ${planLine(joinPlan)}; execution=${joinPlan.executionMs.toFixed(2)} ms`,
      );

      const sampleCustomers = await client.query(
        `SELECT id FROM ${schema}.customers ORDER BY id LIMIT 20`,
      );
      const nPlusOneStarted = performance.now();
      for (const customer of sampleCustomers.rows) {
        await client.query(
          `SELECT count(*) FROM ${schema}.orders WHERE customer_id = $1`,
          [customer.id],
        );
      }
      const nPlusOneMs = performance.now() - nPlusOneStarted;
      const oneQueryStarted = performance.now();
      await client.query(`
        SELECT c.id, count(o.id)
        FROM ${schema}.customers AS c
        LEFT JOIN ${schema}.orders AS o ON o.customer_id = c.id
        WHERE c.id <= 20
        GROUP BY c.id
      `);
      const oneQueryMs = performance.now() - oneQueryStarted;
      emit(
        'query-shape',
        'n-plus-one',
        `N+1: 21 round trips=${nPlusOneMs.toFixed(2)} ms; один JOIN=1 round trip=${oneQueryMs.toFixed(2)} ms`,
      );

      await client.query(`
        CREATE MATERIALIZED VIEW ${schema}.customer_totals AS
        SELECT customer_id, count(*)::int AS orders_count, sum(amount) AS total
        FROM ${schema}.orders
        GROUP BY customer_id;
        CREATE UNIQUE INDEX customer_totals_customer_id_idx
          ON ${schema}.customer_totals (customer_id);
      `);
      const before = await client.query(
        `SELECT total FROM ${schema}.customer_totals WHERE customer_id = $1`,
        [42],
      );
      await client.query(
        `INSERT INTO ${schema}.orders (customer_id, amount) VALUES ($1, $2)`,
        [42, 999],
      );
      const stale = await client.query(
        `SELECT total FROM ${schema}.customer_totals WHERE customer_id = $1`,
        [42],
      );
      await client.query(`REFRESH MATERIALIZED VIEW ${schema}.customer_totals`);
      const refreshed = await client.query(
        `SELECT total FROM ${schema}.customer_totals WHERE customer_id = $1`,
        [42],
      );
      emit(
        'materialized-view',
        'refresh',
        `Materialized View: было=${before.rows[0].total}, до REFRESH=${stale.rows[0].total}, после=${refreshed.rows[0].total}`,
      );
      emit(
        'sql',
        'control',
        'Raw SQL здесь параметризован и видим; ORM полезен, пока команда проверяет сгенерированный SQL, планы, N+1 и границы транзакций',
      );
    } finally {
      client.release();
    }
  });
}
