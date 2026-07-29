export const sqlBasicsEnglish = {
  'database-sql-basics': {
    title: 'SQL from zero: reading and changing rows',
    eyebrow: 'Statement → clauses → result rows',
    summary:
      'Learn to read SELECT, WHERE, INSERT, UPDATE, DELETE, NULL, parameters, sorting, and aggregation before advanced database topics.',
    theory:
      'SQL is declarative: a statement describes the desired result while PostgreSQL chooses an execution plan. SELECT builds result expressions, FROM supplies rows, WHERE filters them, GROUP BY forms groups, HAVING filters groups, ORDER BY sorts, and LIMIT bounds the response. INSERT, UPDATE, and DELETE mutate data; RETURNING exposes affected rows immediately.',
    watchFor:
      'A temporary products table receives three rows. The trace shows parameterized INSERT, filtered SELECT, the difference between = NULL and IS NULL, atomic UPDATE, GROUP BY, and a bounded DELETE.',
    expected: [
      'CREATE TABLE defines columns, data types, defaults, and constraints.',
      'INSERT adds rows and RETURNING exposes generated values.',
      'SELECT, FROM, and WHERE have separate responsibilities.',
      'Parameters travel separately from SQL text.',
      'NULL uses IS NULL rather than ordinary equality.',
      'UPDATE and DELETE affect every row matching WHERE.',
      'GROUP BY creates groups and HAVING filters aggregated groups.',
    ],
    code: `const result = await db.query(
  \`SELECT
     id,
     name AS product_name,
     price * stock AS inventory_value
   FROM products
   WHERE category = $1
     AND price <= $2
   ORDER BY price DESC
   LIMIT $3\`,
  ['books', 3500, 10],
);

console.log(result.rows);`,
    learning: {
      plain:
        'Think of a table as a strict spreadsheet. Columns define allowed fields, rows store individual entities, and a SQL statement asks for a result or mutation. Unlike a local JavaScript array, the database coordinates many processes and enforces declared rules.',
      foundation:
        'SQL is declarative: you describe a desired result and PostgreSQL chooses how to produce it. A statement is made of clauses. SELECT chooses output expressions, FROM supplies input, WHERE filters rows, GROUP BY forms groups, HAVING filters groups, ORDER BY sorts, and LIMIT bounds output. INSERT, UPDATE, and DELETE change data; RETURNING immediately returns changed rows.',
      why:
        'An ORM still generates SQL that can be slow, unsafe, or logically wrong. Reading basic SQL reveals the real operation, parameter boundaries, and vocabulary required by every later database chapter.',
      resources: [
        {
          label: 'PostgreSQL documentation',
          href: 'https://www.postgresql.org/docs/current/',
          description:
            'The official PostgreSQL documentation and entry point to every SQL section.',
        },
        {
          label: 'PostgreSQL: The SQL Language',
          href: 'https://www.postgresql.org/docs/current/tutorial-sql.html',
          description:
            'Official introduction to tables, queries, joins, aggregates, updates, and deletion.',
        },
        {
          label: 'SELECT',
          href: 'https://www.postgresql.org/docs/current/sql-select.html',
          description:
            'Complete SELECT syntax and clause behavior.',
        },
        {
          label: 'Value expressions',
          href: 'https://www.postgresql.org/docs/current/sql-expressions.html',
          description:
            'Literals, column references, operators, functions, casts, and expressions.',
        },
        {
          label: 'node-postgres queries',
          href: 'https://node-postgres.com/features/queries',
          description:
            '$1 parameters, prepared statements, and pg result objects.',
        },
      ],
      runtimeLayers: [
        { title: 'NEST SERVICE', detail: 'use case · repository · DTO', active: true },
        { title: 'PG DRIVER', detail: 'query text · values · result.rows' },
        { title: 'POSTGRESQL', detail: 'parse · plan · execute' },
        { title: 'TABLES', detail: 'columns · rows · constraints' },
      ],
      terms: [
        ['Table / row / column', 'A table stores one entity kind, a row is one record, and a column is a named field with a data type.'],
        ['Statement', 'A complete SQL command such as SELECT, INSERT, UPDATE, DELETE, or CREATE TABLE.'],
        ['Clause', 'A statement part with one job: FROM supplies input, WHERE filters, and ORDER BY sorts.'],
        ['Expression', 'A calculated fragment such as price * stock, lower(email), count(*), or price <= $1.'],
        ['NULL', 'A missing or unknown value. It is tested with IS NULL or IS NOT NULL rather than equality.'],
        ['Parameter $1', 'A value placeholder sent separately by the driver; its number maps to the values array position.'],
        ['Alias AS', 'A temporary name for a column, expression, or table inside a query result.'],
        ['Result set', 'The rows returned by a query; node-postgres exposes them through result.rows.'],
      ],
      steps: [
        ['Define a table', 'CREATE TABLE declares columns, data types, defaults, and constraints.'],
        ['Insert rows', 'INSERT INTO names target columns, VALUES supplies data, and RETURNING shows created rows.'],
        ['Read rows', 'SELECT forms output columns, FROM selects the table, and WHERE keeps matching rows.'],
        ['Order output', 'ORDER BY sorts, LIMIT bounds count, and OFFSET skips an initial portion.'],
        ['Mutate safely', 'UPDATE uses SET and a deliberate WHERE; RETURNING exposes the actual outcome.'],
        ['Aggregate', 'Aggregate functions calculate values, GROUP BY forms groups, and HAVING filters groups.'],
        ['Delete deliberately', 'DELETE without WHERE affects the whole table, so first verify its predicate with SELECT.'],
      ],
      nuances: [
        ['Written and logical order differ', 'SELECT is written first, but FROM and WHERE logically determine input before the SELECT list is produced.'],
        ['SQL keywords are case-insensitive', 'PostgreSQL reads select and SELECT alike; uppercase is a readability convention.'],
        ['NULL creates three-valued logic', 'Comparison with NULL normally yields UNKNOWN, while WHERE keeps only TRUE.'],
        ['Parameters protect values, not identifiers', '$1 can represent an email or price, not a table name, column, or sort direction. Choose those from an allowlist.'],
        ['LIMIT without ORDER BY is unstable', 'Without explicit ordering, any matching rows may be returned; physical table order is not an API contract.'],
        ['Mutations report their scope', 'Inspect rowCount and RETURNING. Zero rows can be a business outcome; an unexpectedly large count is a safety signal.'],
      ],
      pitfalls: [
        ['SQL executes literally from top to bottom.', 'The parser builds a statement, clauses have a logical order, and the planner chooses a physical plan.'],
        ['SELECT * is ideal for production APIs.', 'An explicit column list stabilizes contracts, reduces transfer, and documents dependencies.'],
        ['String interpolation is safe after manual escaping.', 'Send values through driver parameters and choose identifiers from a fixed allowlist.'],
        ['description = NULL finds missing values.', 'Use IS NULL; NULL is unknown or absent, not a normal value.'],
        ['DELETE removes one row.', 'DELETE affects every row matching WHERE, or the whole table when WHERE is absent.'],
      ],
      codeIntro:
        'The runtime creates an isolated products table, inserts three rows, and demonstrates reading, NULL, mutation, aggregation, and deletion. User values use $1, $2, and a separate values array.',
      codeNotes: [
        'The SELECT list defines the shape of result.rows.',
        'AS renames a field only in the query result.',
        'WHERE operates on individual rows before GROUP BY.',
        'HAVING operates on groups after aggregation.',
        'RETURNING avoids a second query after a mutation.',
        'rowCount reports how many rows were actually affected.',
      ],
      examples: [
        {
          title: 'SELECT output columns',
          goal: 'Return id, name, and a calculated inventory value.',
          code: `SELECT
  id,
  name,
  price * stock AS inventory_value
FROM products;`,
          notes: ['Commas separate SELECT expressions.', 'FROM supplies the table.', 'AS names the calculated result field.'],
        },
        {
          title: 'WHERE filters rows',
          goal: 'Find active books no more expensive than a supplied value.',
          code: `SELECT id, name, price
FROM products
WHERE category = $1
  AND price <= $2
  AND active IS TRUE;`,
          notes: ['$1 and $2 come from the driver values array.', 'AND requires every condition to be true.'],
        },
        {
          title: 'INSERT a row',
          goal: 'Create a product and receive its generated id.',
          code: `INSERT INTO products (name, price, stock)
VALUES ($1, $2, $3)
RETURNING id, name, price, stock;`,
          notes: ['VALUES order follows the column list.', 'RETURNING exposes the stored row.'],
        },
        {
          title: 'UPDATE matching rows',
          goal: 'Atomically reduce stock only when enough remains.',
          code: `UPDATE products
SET stock = stock - $1
WHERE id = $2
  AND stock >= $1
RETURNING id, stock;`,
          notes: ['SET defines the new value.', 'The right-hand stock is the current row value.', 'Zero rowCount means the predicate failed.'],
        },
        {
          title: 'DELETE deliberately',
          goal: 'Delete only inactive products and see their ids.',
          code: `DELETE FROM products
WHERE active IS FALSE
RETURNING id;`,
          notes: ['Run SELECT with the same WHERE first.', 'Without WHERE, every row is deleted.'],
        },
        {
          title: 'ORDER BY, LIMIT, and OFFSET',
          goal: 'Return the second page of expensive products.',
          code: `SELECT id, name, price
FROM products
ORDER BY price DESC, id ASC
LIMIT $1
OFFSET $2;`,
          notes: ['DESC decreases; ASC increases.', 'id is a stable tie-breaker.', 'Large OFFSET eventually becomes expensive.'],
        },
        {
          title: 'GROUP BY and aggregates',
          goal: 'Calculate product count and average price per category.',
          code: `SELECT
  category,
  count(*) AS product_count,
  round(avg(price), 2) AS average_price
FROM products
GROUP BY category
HAVING count(*) >= $1
ORDER BY category;`,
          notes: ['count and avg produce one value per group.', 'HAVING filters groups; WHERE filters rows before aggregation.'],
        },
        {
          title: 'NULL means missing',
          goal: 'Find products without a description.',
          code: `SELECT id, name
FROM products
WHERE description IS NULL;`,
          notes: ['Do not use description = NULL.', 'IS NOT NULL performs the opposite check.', 'NULL differs from an empty string.'],
        },
      ],
      questions: [
        'What separate jobs do SELECT, FROM, and WHERE perform?',
        'Why should $1 not be wrapped in quotes inside SQL?',
        'How do WHERE and HAVING differ?',
        'Why should LIMIT normally be paired with ORDER BY?',
        'What does UPDATE return when WHERE matches no rows?',
        'Why is NULL tested with IS NULL?',
        'What happens when DELETE has no WHERE?',
      ],
    },
  },
};
