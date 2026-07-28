const postgresDocumentation = {
  label: 'Official PostgreSQL documentation',
  href: 'https://www.postgresql.org/docs/current/',
  description:
    'The primary source for SQL, the planner, indexes, MVCC, transactions, and PostgreSQL maintenance.',
};

const databaseLayers = [
  {
    title: 'APPLICATION CODE',
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

export const databaseEnglish = {
  'database-sql-foundations': {
    title: 'SQL foundations, ACID, and constraints',
    eyebrow: 'Invariant → transaction → durable state',
    summary:
      'Use real PostgreSQL constraints, parameterized SQL, and a rollback to see where data integrity actually lives.',
    theory:
      'A relational database is an active consistency boundary. Keys and constraints reject invalid states, transactions group related changes, the planner selects a physical execution strategy, and WAL supports recovery. ACID does not invent business rules: the schema and transactional application code must express them.',
    watchFor:
      'The driver sends values separately from SQL. PostgreSQL rejects a negative amount with SQLSTATE 23514, and a row visible inside a transaction disappears after ROLLBACK.',
    expected: [
      'PRIMARY KEY, UNIQUE, CHECK, and FOREIGN KEY live inside the database.',
      'Query values use protocol parameters rather than string interpolation.',
      'A constraint violation returns a machine-readable SQLSTATE.',
      'All statements in a transaction use one physical connection.',
      'ROLLBACK removes every uncommitted change from the unit of work.',
      'The isolated training schema is dropped after the run.',
    ],
    code: `const client = await pool.connect();
try {
  await client.query('BEGIN');
  const order = await client.query(
    'INSERT INTO orders(customer_id, amount) VALUES ($1, $2) RETURNING id',
    [customerId, amount],
  );
  await client.query('COMMIT');
  return order.rows[0];
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}`,
    learning: {
      plain:
        'A database is not a large JSON file or passive storage. It checks rules, coordinates competing changes, and chooses how to retrieve rows. A good schema does not merely store data; it prevents states that are impossible for the business.',
      foundation:
        'The relational model describes entities as tables, identifies rows with keys, and encodes relationships and valid values with constraints. PostgreSQL parses declarative SQL, evaluates possible plans, chooses one from statistics, and executes it inside a transaction. ACID describes atomicity, consistency, isolation, and durability. Consistency is a joint responsibility of the schema and business logic, not automatic database magic.',
      why:
        'Production bugs frequently live where concurrent code meets shared state. If an invariant exists only in one Nest service, another worker, migration, or manual query can violate it. Constraints and transactions make critical rules apply to every client.',
      resources: [
        postgresDocumentation,
        {
          label: 'Data definition and constraints',
          href: 'https://www.postgresql.org/docs/current/ddl-constraints.html',
          description:
            'NOT NULL, CHECK, UNIQUE, PRIMARY KEY, FOREIGN KEY, and exclusion constraints.',
        },
        {
          label: 'Transactions',
          href: 'https://www.postgresql.org/docs/current/tutorial-transactions.html',
          description:
            'BEGIN, COMMIT, ROLLBACK, savepoints, and atomic groups of changes.',
        },
        {
          label: 'Query planning',
          href: 'https://www.postgresql.org/docs/current/planner-optimizer.html',
          description:
            'How PostgreSQL turns declarative SQL into an executable plan.',
        },
      ],
      runtimeLayers: databaseLayers,
      terms: [
        ['Relational model', 'A data model built from tables, rows, columns, keys, and constraints. SQL describes a desired result rather than a row-by-row algorithm.'],
        ['Constraint', 'A rule checked by the database during writes: NOT NULL, CHECK, UNIQUE, PRIMARY KEY, or FOREIGN KEY.'],
        ['Invariant', 'A condition that must remain true, such as a positive order amount or an order referencing an existing customer.'],
        ['ACID', 'Atomicity, Consistency, Isolation, and Durability: properties of reliable transactional changes.'],
        ['WAL', 'Write-Ahead Log: changes are logged before corresponding data pages to support recovery.'],
        ['SQLSTATE', 'A stable machine-readable PostgreSQL error code. Applications should not parse localized error text.'],
      ],
      steps: [
        ['Model the invariants', 'Define entities, identity, required values, valid states, and relationships before choosing an ORM.'],
        ['Encode rules in DDL', 'PRIMARY KEY, UNIQUE, CHECK, and FOREIGN KEY protect data regardless of which service performs the write.'],
        ['Send values as parameters', 'The driver sends SQL and values separately; $1 does not turn user input into SQL syntax.'],
        ['Open a transaction', 'BEGIN creates one unit of work whose changes are committed or rolled back together.'],
        ['Receive a structured error', 'A CHECK violation returns SQLSTATE 23514, which the application maps to a domain result.'],
        ['Verify rollback', 'The runtime inserts a row inside a transaction, rolls back, and confirms that persistent state did not change.'],
      ],
      nuances: [
        ['Consistency is not automatic business logic', 'The database enforces declared constraints but cannot guess missing invariants. ACID does not create a rule that the schema and transaction never expressed.'],
        ['NULL uses three-valued logic', 'Comparing to NULL yields UNKNOWN, so use IS NULL. CHECK also accepts UNKNOWN unless NOT NULL is declared separately.'],
        ['Types are part of the model', 'numeric is appropriate for exact decimal arithmetic; timestamptz stores an instant rather than a display time zone.'],
        ['A migration is a production operation', 'ALTER TABLE can acquire a strong lock or rewrite a table. Evaluate data size, lock level, rollout, and rollback.'],
        ['A pool is not a transaction', 'Every query in one transaction must use the same checked-out client. Independent pool.query calls can use different connections.'],
      ],
      codeIntro:
        'The pg driver sends values separately while rules live in the schema. A transaction stays on one client and releases it in finally.',
      codeNotes: [
        'CHECK protects an invariant from every application.',
        '$1 is a protocol parameter, not string substitution.',
        'BEGIN and ROLLBACK must run on the same connection.',
        'Application code maps SQLSTATE to a domain error.',
      ],
      examples: [
        {
          title: 'Constraint instead of convention',
          goal: 'Prevent a negative balance for every database client.',
          code: `CREATE TABLE accounts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  balance numeric(14, 2) NOT NULL CHECK (balance >= 0)
);`,
          notes: [
            'A controller check does not protect writes from a worker or manual SQL.',
            'A cross-row invariant may require a transaction.',
          ],
        },
        {
          title: 'Parameterized SQL',
          goal: 'Pass user input without SQL injection.',
          code: `const result = await pool.query(
  'SELECT id, email FROM users WHERE email = $1',
  [email],
);`,
          notes: [
            'Table names and sort directions are identifiers, not values; choose them from an allowlist.',
          ],
        },
        {
          title: 'One client per transaction',
          goal: 'Create an order and ledger entry atomically.',
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
          notes: ['Two independent pool.query calls cannot replace this client.'],
        },
        {
          title: 'Constraint as a domain result',
          goal: 'Handle a race on a unique email correctly.',
          code: `try {
  await users.insert(email);
} catch (error) {
  if (error.code === '23505') {
    throw new EmailAlreadyExistsError(email);
  }
  throw error;
}`,
          notes: ['A preliminary SELECT does not replace UNIQUE; a race exists before INSERT.'],
        },
      ],
      pitfalls: [
        ['DTO validation is sufficient for integrity.', 'A DTO protects one input. A constraint protects the data from all inputs and concurrent writes.'],
        ['ACID automatically preserves every business rule.', 'The database preserves expressed constraints and correctly implemented transactions.'],
        ['Manual string escaping is a safe query API.', 'Use driver parameters for values and an allowlist for dynamic identifiers.'],
        ['BEGIN through pool.query covers later pool.query calls.', 'A pool can choose another connection; a transaction belongs to one physical connection.'],
      ],
      questions: [
        'Which invariants from your last project belong in the database?',
        'Why does SELECT before INSERT not guarantee uniqueness?',
        'How does atomicity differ from consistency?',
        'Why is SQLSTATE safer than error text?',
        'What risks accompany a NOT NULL migration on a large table?',
      ],
    },
  },

  'database-indexes-explain': {
    title: 'PostgreSQL indexes and EXPLAIN',
    eyebrow: 'Statistics → plan → measured trade-off',
    summary:
      'Build B-tree, Hash, BRIN, and GIN indexes, then compare a real EXPLAIN ANALYZE plan before and after indexing.',
    theory:
      'An index is a separate physical structure, not a performance switch. PostgreSQL estimates selectivity from statistics and compares sequential, index, index-only, and bitmap access. B-tree handles equality, ranges, and ordering; Hash handles equality; GIN indexes composite values; BRIN summarizes physical block ranges.',
    watchFor:
      'The same query is measured before and after a composite B-tree. The planner remains free to choose its scan, while every additional index consumes space and write work.',
    expected: [
      'ANALYZE creates statistics used for cardinality estimates.',
      'EXPLAIN output is a tree of plan nodes.',
      'EXPLAIN ANALYZE executes the query and reports actual values.',
      'A selective tenant/range query can switch away from Seq Scan.',
      'B-tree, Hash, BRIN, and GIN serve different operators and data shapes.',
      'Indexes consume storage and increase write amplification.',
    ],
    code: `const sql = \`
  SELECT id, created_at, status
  FROM events
  WHERE tenant_id = $1
    AND created_at >= $2
  ORDER BY created_at DESC
\`;

await db.query(\`
  CREATE INDEX events_tenant_created_idx
  ON events (tenant_id, created_at DESC)
  INCLUDE (status)
\`);

await db.query(
  'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ' + sql,
  [tenantId, since],
);`,
    learning: {
      plain:
        'An index is a separate guide to a book. It can find a small set of pages quickly, but it consumes space, must be updated on every write, and sometimes reading the whole book in order is cheaper.',
      foundation:
        'PostgreSQL stores a table as heap pages and an index as another structure. The planner estimates selectivity and compares Seq Scan, Index Scan, Index Only Scan, and Bitmap Scan costs. B-tree supports equality, ranges, and ordering; Hash supports equality; GIN handles multi-component values such as arrays and full text; BRIN stores summaries for physical block ranges and benefits from correlation with row order.',
      why:
        'Indexing without reading plans produces both missing access paths and expensive piles of unused indexes. The useful skill is explaining the trade-off and measurement, not merely remembering CREATE INDEX.',
      resources: [
        postgresDocumentation,
        {
          label: 'Index types',
          href: 'https://www.postgresql.org/docs/current/indexes-types.html',
          description:
            'B-tree, Hash, GiST, SP-GiST, GIN, and BRIN operators and use cases.',
        },
        {
          label: 'Using EXPLAIN',
          href: 'https://www.postgresql.org/docs/current/using-explain.html',
          description:
            'Plan trees, cost, rows, actual time, loops, buffers, and EXPLAIN ANALYZE caveats.',
        },
        {
          label: 'Multicolumn indexes',
          href: 'https://www.postgresql.org/docs/current/indexes-multicolumn.html',
          description:
            'Column order, leading columns, and behavior across index types.',
        },
      ],
      runtimeLayers: databaseLayers,
      terms: [
        ['Selectivity', 'The fraction of rows passing a predicate. A smaller result usually makes indexed access more attractive.'],
        ['B-tree', 'A balanced tree for equality, ranges, ordering, and compatible prefix searches.'],
        ['Hash index', 'A hash structure for equality comparisons only; it does not support ranges or ORDER BY.'],
        ['GIN', 'An inverted index for values with components, including arrays, jsonb, and full-text lexemes.'],
        ['BRIN', 'Compact summaries for block ranges, effective when values correlate with physical row order.'],
        ['EXPLAIN ANALYZE', 'A command that actually executes a query and reports actual rows, time, and loops.'],
        ['Cardinality estimate', 'The planner estimate of emitted rows. A large estimate error often signals weak statistics or correlated predicates.'],
      ],
      steps: [
        ['Capture the real query', 'Optimize concrete SQL with representative parameters, volume, and data distribution.'],
        ['Establish a baseline', 'EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) shows the tree before a schema change.'],
        ['Read from the leaves upward', 'Scan nodes obtain rows; parent nodes filter, join, aggregate, sort, and limit them.'],
        ['Compare estimates with actuals', 'Inspect rows, loops, time, filtered rows, and buffers. Estimate errors can select a poor join strategy.'],
        ['Add a narrow index', 'A composite B-tree matches tenant equality and created_at range/order; INCLUDE can help index-only access.'],
        ['Measure again', 'After ANALYZE, compare plans while accounting for cache warmup, write cost, and index size.'],
      ],
      nuances: [
        ['Seq Scan is not automatically bad', 'When a query returns much of a table, sequential reads can be cheaper than random heap access through an index.'],
        ['Cost is not milliseconds', 'Planner cost uses relative units. Actual Time measures one execution and depends on cache and system load.'],
        ['Column order matters', 'A B-tree on (tenant_id, created_at) serves tenant and tenant-plus-date predicates, but usually not date alone.'],
        ['EXPLAIN ANALYZE executes writes', 'UPDATE and DELETE will change data. Investigate inside BEGIN/ROLLBACK or on a safe copy.'],
        ['Index Only Scan can still visit the heap', 'The visibility map must prove tuple visibility; otherwise the executor performs heap fetches.'],
      ],
      codeIntro:
        'The same parameterized SELECT is measured before and after a composite B-tree. Hash, BRIN, and GIN are created to compare purpose and size, not as a recommendation to add every index.',
      codeNotes: [
        'ANALYZE refreshes distribution statistics.',
        'FORMAT JSON lets the application inspect the plan tree.',
        'B-tree order follows tenant equality and created_at range/order.',
        'The planner decision matters more than index existence.',
      ],
      examples: [
        {
          title: 'Composite B-tree',
          goal: 'Filter a tenant and return recent events without a separate sort.',
          code: `CREATE INDEX events_tenant_created_idx
ON events (tenant_id, created_at DESC)
INCLUDE (status);`,
          notes: [
            'Equality columns generally precede the range column.',
            'INCLUDE increases index size and write work.',
          ],
        },
        {
          title: 'Partial index',
          goal: 'Index only the small unfinished subset of orders.',
          code: `CREATE INDEX orders_pending_idx
ON orders (created_at)
WHERE status = 'pending';`,
          notes: ['The query predicate must imply the index predicate.'],
        },
        {
          title: 'GIN for an array',
          goal: 'Find events containing a tag.',
          code: `CREATE INDEX events_tags_gin ON events USING gin (tags);

SELECT * FROM events WHERE tags @> ARRAY['priority'];`,
          notes: ['GIN can make writes materially more expensive.'],
        },
        {
          title: 'Safe write EXPLAIN',
          goal: 'Obtain actual execution data without retaining a change.',
          code: `BEGIN;
EXPLAIN (ANALYZE, BUFFERS)
UPDATE accounts SET balance = balance + 10 WHERE id = 42;
ROLLBACK;`,
          notes: ['Triggers and locks still execute before ROLLBACK.'],
        },
      ],
      pitfalls: [
        ['An index always accelerates a query.', 'The planner may prefer Seq Scan; every index also slows writes and uses memory or disk.'],
        ['More indexes are always better.', 'Overlapping and unused indexes create write amplification and additional maintenance.'],
        ['The first column of a composite index does not matter.', 'Leading B-tree columns determine which predicates efficiently narrow the search range.'],
        ['EXPLAIN ANALYZE only displays a plan.', 'It executes the statement; a write changes data unless explicitly rolled back.'],
      ],
      questions: [
        'Why can the planner choose Seq Scan when an index exists?',
        'How does Bitmap Heap Scan differ from Index Scan?',
        'For which data can BRIN beat B-tree?',
        'What does a large estimated-versus-actual row gap suggest?',
        'How does an index affect INSERT and VACUUM?',
        'Why is the index ordered as (tenant_id, created_at)?',
      ],
    },
  },

  'database-transactions-locks': {
    title: 'Transaction isolation and locking',
    eyebrow: 'Snapshots → contention → conflict handling',
    summary:
      'Open two real PostgreSQL sessions and compare Read Committed, Repeatable Read, SELECT FOR UPDATE, and optimistic versioning.',
    theory:
      'PostgreSQL uses MVCC. READ COMMITTED takes a new snapshot for every statement, while REPEATABLE READ retains a transaction snapshot. SERIALIZABLE detects dangerous dependencies and may abort with SQLSTATE 40001. SELECT FOR UPDATE acquires a row lock; optimistic locking updates only when the expected version still matches.',
    watchFor:
      'A second Read Committed SELECT sees a concurrent commit, Repeatable Read does not, SELECT FOR UPDATE really waits, and a stale version update changes zero rows.',
    expected: [
      'Concurrency requires different database sessions.',
      'Read Committed can observe a different committed value per statement.',
      'Repeatable Read retains its transaction snapshot.',
      'SELECT FOR UPDATE blocks a competing row lock until COMMIT.',
      'Optimistic locking detects a conflict through rowCount.',
      'Timeouts bound waits and every training object is cleaned up.',
    ],
    code: `await client.query('BEGIN');
const account = await client.query(
  'SELECT balance FROM accounts WHERE id = $1 FOR UPDATE',
  [accountId],
);
await client.query(
  'UPDATE accounts SET balance = balance - $1 WHERE id = $2',
  [amount, accountId],
);
await client.query('COMMIT');`,
    learning: {
      plain:
        'Two operations can each be correct alone and corrupt data together. Isolation determines what each transaction can see; locks or version checks determine who may change the same row.',
      foundation:
        'PostgreSQL uses MVCC: updates create row versions and a transaction reads a suitable snapshot. READ COMMITTED obtains a snapshot per statement; REPEATABLE READ retains one and in PostgreSQL also prevents phantom reads; SERIALIZABLE detects dangerous dependency structures and can abort with SQLSTATE 40001. SELECT FOR UPDATE takes a row-level lock. Optimistic locking updates only when version still matches.',
      why:
        'Lost updates, overselling, duplicate charging, and write skew rarely appear in single-user tests. A senior engineer defines the unit of work, selects isolation, bounds lock waits, and retries serialization or deadlock failures safely.',
      resources: [
        postgresDocumentation,
        {
          label: 'Transaction isolation',
          href: 'https://www.postgresql.org/docs/current/transaction-iso.html',
          description:
            'PostgreSQL isolation levels, snapshots, serialization anomalies, and retry requirements.',
        },
        {
          label: 'Explicit locking',
          href: 'https://www.postgresql.org/docs/current/explicit-locking.html',
          description:
            'Table, row, and advisory locks, deadlocks, and lock duration.',
        },
        {
          label: 'MVCC introduction',
          href: 'https://www.postgresql.org/docs/current/mvcc-intro.html',
          description:
            'The multiversion concurrency model and its advantages.',
        },
      ],
      runtimeLayers: databaseLayers,
      terms: [
        ['MVCC', 'Multiversion Concurrency Control: readers see appropriate row versions and usually do not block writers.'],
        ['Snapshot', 'The visibility rules selecting which row versions a statement or transaction can see.'],
        ['Isolation level', 'A visibility and anomaly contract: Read Committed, Repeatable Read, or Serializable.'],
        ['Pessimistic lock', 'Acquiring a lock such as SELECT FOR UPDATE before changing a contested resource.'],
        ['Optimistic lock', 'An UPDATE conditional on an old version; rowCount zero means another writer won.'],
        ['Deadlock', 'A cycle where A waits for B while B waits for A; PostgreSQL aborts one participant.'],
        ['Serialization failure', 'SQLSTATE 40001: the outcome cannot be represented safely as serial execution, so retry the whole transaction.'],
      ],
      steps: [
        ['Open two connections', 'Real concurrency uses different PostgreSQL sessions, not two Promises on one checked-out client.'],
        ['Compare snapshots', 'A Read Committed second SELECT sees another commit; Repeatable Read continues seeing its transaction snapshot.'],
        ['Acquire FOR UPDATE', 'The first transaction locks a row and the second waits for COMMIT or timeout.'],
        ['Modify under the lock', 'Both operations read the current balance sequentially, preserving both changes.'],
        ['Check a version', 'The first optimistic update increments version; an update using the old version affects zero rows.'],
        ['Bound and retry', 'lock_timeout and statement_timeout bound waiting; deadlock and serialization errors use bounded whole-transaction retries.'],
      ],
      nuances: [
        ['Read Committed is the PostgreSQL default', 'Each command receives a new snapshot, so two SELECTs in one transaction can see different committed values.'],
        ['PostgreSQL Repeatable Read is stronger than the SQL minimum', 'PostgreSQL prevents phantom reads at this level even though the SQL standard allows them.'],
        ['Serializable requires retry', 'It is not a global queue. PostgreSQL allows concurrency, detects a dangerous dependency graph, and aborts one transaction.'],
        ['A row lock lives until transaction end', 'Network calls or heavy computation in an open transaction increase contention, bloat, and timeout risk.'],
        ['Correct statements can still deadlock', 'Consistent resource ordering reduces probability, but the application must handle SQLSTATE 40P01.'],
      ],
      codeIntro:
        'The runtime opens two real sessions. It compares snapshots, demonstrates a real SELECT FOR UPDATE wait, and detects an optimistic conflict without unbounded blocking.',
      codeNotes: [
        'Set isolation immediately after BEGIN.',
        'FOR UPDATE retains the row lock until COMMIT or ROLLBACK.',
        'The second session genuinely waits for the row lock.',
        'An optimistic conflict is indicated by rowCount, not necessarily an exception.',
      ],
      examples: [
        {
          title: 'Pessimistic debit',
          goal: 'Prevent simultaneous operations from spending one balance.',
          code: `BEGIN;

SELECT balance FROM accounts
WHERE id = $1
FOR UPDATE;

UPDATE accounts
SET balance = balance - $2
WHERE id = $1;

COMMIT;`,
          notes: ['Keep the transaction short and always configure a timeout.'],
        },
        {
          title: 'Optimistic version',
          goal: 'Detect a conflict without acquiring a row lock first.',
          code: `UPDATE documents
SET body = $1, version = version + 1
WHERE id = $2 AND version = $3;

// rowCount === 0 -> reload or report conflict`,
          notes: ['Works well when conflicts are rare and retry or rejection is cheap.'],
        },
        {
          title: 'Serializable retry',
          goal: 'Retry the entire unit of work after SQLSTATE 40001.',
          code: `for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    return await runSerializableTransaction();
  } catch (error) {
    if (error.code !== '40001' || attempt === 3) throw error;
    await backoff(attempt);
  }
}`,
          notes: [
            'Retry the whole transaction, not the last statement.',
            'Do not repeat an external side effect blindly.',
          ],
        },
        {
          title: 'Consistent lock order',
          goal: 'Reduce transfer deadlocks.',
          code: `const [firstId, secondId] = [fromId, toId].sort();

SELECT id FROM accounts
WHERE id IN ($1, $2)
ORDER BY id
FOR UPDATE;`,
          notes: ['Still handle SQLSTATE 40P01.'],
        },
      ],
      pitfalls: [
        ['A transaction automatically removes every race.', 'Results depend on isolation, statements, locks, and declared constraints.'],
        ['Read Committed repeats the same read.', 'A new PostgreSQL statement receives a new snapshot and can see another commit.'],
        ['SELECT FOR UPDATE makes concurrent code faster.', 'It serializes access to a row and can create a wait queue.'],
        ['Serializable means no errors.', 'The database can abort a transaction to preserve serial behavior, so retry is required.'],
      ],
      questions: [
        'Why do two Promises on one client not model two concurrent transactions?',
        'What can change between two Read Committed SELECTs?',
        'When is optimistic locking preferable to SELECT FOR UPDATE?',
        'Why should an HTTP call not run while holding a row lock?',
        'Which SQLSTATE codes require a whole-transaction retry?',
        'How does consistent resource ordering reduce deadlocks?',
      ],
    },
  },

  'database-joins-materialized-views': {
    title: 'JOINs, Materialized Views, and ORM boundaries',
    eyebrow: 'Data shape → round trips → freshness',
    summary:
      'Inspect a real JOIN plan, reproduce N+1, and watch a Materialized View remain stale until REFRESH.',
    theory:
      'A JOIN consumes two row sources and finds matching pairs. PostgreSQL can use nested loop, hash join, or merge join depending on cardinality, order, and indexes. Materialized Views physically retain a query result and trade freshness for cheaper reads. ORMs can reduce mapping boilerplate but do not remove SQL cost, transaction boundaries, or the need to inspect plans.',
    watchFor:
      'Twenty related lookups create 21 round trips, while one grouped JOIN uses one. A new order does not update the materialized total until REFRESH.',
    expected: [
      'The plan exposes scan, join, aggregate, sort, and limit nodes.',
      'JOIN is set-based work, not a free syntax feature.',
      'N+1 wastes round trips even when every lookup has an index.',
      'A foreign key does not automatically index its referencing column.',
      'A Materialized View has its own persisted state and indexes.',
      'ORM versus raw SQL is a control trade-off rather than a moral rule.',
    ],
    code: `const result = await pool.query(
  \`SELECT c.id, c.name, sum(o.amount) AS total
   FROM customers AS c
   JOIN orders AS o ON o.customer_id = c.id
   WHERE c.active
   GROUP BY c.id, c.name
   ORDER BY total DESC
   LIMIT $1\`,
  [20],
);`,
    learning: {
      plain:
        'A JOIN assembles related data, but the database must read two row sets and find matching pairs. A Materialized View saves an expensive result in advance: reads become cheaper, but the result remains stale until REFRESH.',
      foundation:
        'INNER JOIN retains matching pairs; LEFT JOIN preserves all left rows and fills missing right values with NULL. The planner chooses nested loop, hash join, or merge join from sizes, ordering, and indexes. Aggregation and sorting consume CPU and memory and can spill to temporary files. A Materialized View physically stores a SELECT result and refreshes explicitly. An ORM can accelerate CRUD and mapping, but it does not remove SQL, plans, transactions, or round-trip cost.',
      why:
        'Many cases described as an ORM being slow are actually N+1, over-fetching, bad cardinality estimates, a missing join-key index, or an overly broad transaction. Control starts with visible SQL and a measured plan.',
      resources: [
        postgresDocumentation,
        {
          label: 'Joins between tables',
          href: 'https://www.postgresql.org/docs/current/tutorial-join.html',
          description:
            'INNER and OUTER JOIN semantics, aliases, and join conditions.',
        },
        {
          label: 'Planner join strategies',
          href: 'https://www.postgresql.org/docs/current/planner-optimizer.html',
          description:
            'How the PostgreSQL planner searches access paths and join combinations.',
        },
        {
          label: 'Materialized Views',
          href: 'https://www.postgresql.org/docs/current/rules-materializedviews.html',
          description:
            'Physically stored results, REFRESH, and the freshness-versus-speed trade-off.',
        },
      ],
      runtimeLayers: databaseLayers,
      terms: [
        ['INNER JOIN', 'Returns row combinations satisfying the ON condition.'],
        ['LEFT JOIN', 'Preserves every left row and fills right-side columns with NULL when no match exists.'],
        ['Nested Loop', 'For every outer row, search the inner input; strong for a small outer input and indexed lookups.'],
        ['Hash Join', 'Build a hash table from one input and probe it with another; useful for large unsorted equality joins.'],
        ['Merge Join', 'Walk two sorted inputs; it can reuse index order and supports some inequality conditions.'],
        ['N+1 query', 'One query loads N entities, followed by N additional queries for related data.'],
        ['Materialized View', 'A physically stored query result that remains stale until REFRESH.'],
      ],
      steps: [
        ['Create a related model', 'customers and orders use a foreign key; an index on orders.customer_id supports lookups.'],
        ['Execute a JOIN', 'The planner chooses scans and a join algorithm, then aggregation and top-N sorting.'],
        ['Read the plan', 'The runtime displays the tree and actual timing: JOIN is an operator over two inputs.'],
        ['Reproduce N+1', 'Twenty related lookups create 21 round trips; one grouped JOIN loads the shape in one query.'],
        ['Persist an aggregate', 'A Materialized View stores customer totals and receives its own unique index.'],
        ['Observe staleness', 'A new order does not change the stored total until REFRESH MATERIALIZED VIEW.'],
      ],
      nuances: [
        ['JOIN is not inherently bad', 'One well-planned JOIN is often cheaper than N+1. Volume, selectivity, indexes, spills, and output rows determine the cost.'],
        ['WHERE can break a LEFT JOIN', 'A WHERE predicate on the right table removes NULL-extended rows and can effectively become an inner join. The predicate may belong in ON.'],
        ['Rows multiply', 'A one-to-many relationship repeats parent rows. Joining multiple collections can create a large Cartesian multiplication before aggregation.'],
        ['A Materialized View is not an automatic cache', 'PostgreSQL does not update it per write. Define refresh scheduling, acceptable lag, and failure monitoring.'],
        ['REFRESH CONCURRENTLY has requirements', 'It needs a suitable UNIQUE index and usually takes longer, but allows readers to continue using the old result.'],
        ['ORM is a trade-off, not a religion', 'ORMs help mapping, migrations, and simple CRUD. Risk begins when the team cannot see generated SQL, N+1, and transaction boundaries.'],
      ],
      codeIntro:
        'The runtime compares 21 sequential round trips with one JOIN, displays a real plan tree, and proves that a materialized result stays old until REFRESH.',
      codeNotes: [
        'A foreign key defines a semantic relationship; an index defines an access path.',
        'The planner, not SQL spelling alone, selects the join algorithm.',
        'N+1 is about query count even when each query is fast.',
        'A Materialized View owns separate state and indexes.',
      ],
      examples: [
        {
          title: 'LEFT JOIN predicate in ON',
          goal: 'Keep customers who have no paid orders.',
          code: `SELECT c.id, count(o.id)
FROM customers AS c
LEFT JOIN orders AS o
  ON o.customer_id = c.id
 AND o.status = 'paid'
GROUP BY c.id;`,
          notes: ['Moving o.status into WHERE removes customers without orders.'],
        },
        {
          title: 'DataLoader-style batching',
          goal: 'Remove N+1 without one enormous JOIN.',
          code: `SELECT customer_id, id, amount
FROM orders
WHERE customer_id = ANY($1::bigint[]);`,
          notes: ['Group the result by customer_id in the application.'],
        },
        {
          title: 'Materialized View',
          goal: 'Precompute daily analytics.',
          code: `CREATE MATERIALIZED VIEW daily_sales AS
SELECT date_trunc('day', created_at) AS day,
       sum(amount) AS total
FROM orders
GROUP BY 1;

REFRESH MATERIALIZED VIEW daily_sales;`,
          notes: ['Define acceptable data lag explicitly.'],
        },
        {
          title: 'Repository with visible SQL',
          goal: 'Keep Nest DI without losing query control.',
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
          notes: ['A repository is an infrastructure boundary, not a place to hide unknown SQL.'],
        },
      ],
      pitfalls: [
        ['JOIN is always slower than several simple queries.', 'One set-based query often reduces round trips; verify with a plan and measurement.'],
        ['Only primary keys need indexes.', 'A foreign key does not automatically index its referencing column in PostgreSQL.'],
        ['A Materialized View always contains current data.', 'It contains the result from its last successful REFRESH.'],
        ['Removing an ORM automatically produces fast SQL.', 'Poor raw SQL remains poor; modeling, parameters, plans, indexes, and observability still matter.'],
      ],
      questions: [
        'When is nested loop better than hash join?',
        'How can a WHERE predicate change LEFT JOIN semantics?',
        'Why is N+1 expensive even with indexed lookups?',
        'How would you define acceptable Materialized View staleness?',
        'What does REFRESH MATERIALIZED VIEW CONCURRENTLY require?',
        'Which guarantees should a repository expose regardless of ORM choice?',
      ],
    },
  },
};
