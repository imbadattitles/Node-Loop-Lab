import assert from 'node:assert/strict';
import {
  databaseConstraintsAndAcid,
  databaseIndexesAndExplain,
  databaseJoinsAndMaterializedViews,
  databaseTransactionsAndLocks,
} from '../src/database-lab.js';

process.env.DATABASE_URL ||= [
  'postgresql://node_loop_lab_app:',
  'node-loop-lab-local@127.0.0.1:5432/node_loop_lab',
].join('');

const scenarios = [
  {
    name: 'constraints and ACID',
    run: databaseConstraintsAndAcid,
    lanes: ['constraint', 'transaction', 'acid', 'cleanup'],
  },
  {
    name: 'indexes and EXPLAIN',
    run: databaseIndexesAndExplain,
    lanes: ['planner', 'indexes', 'optimizer', 'cleanup'],
  },
  {
    name: 'isolation and locks',
    run: databaseTransactionsAndLocks,
    lanes: ['isolation', 'lock', 'cleanup'],
  },
  {
    name: 'JOINs and Materialized Views',
    run: databaseJoinsAndMaterializedViews,
    lanes: ['join', 'query-shape', 'materialized-view', 'cleanup'],
  },
];

for (const scenario of scenarios) {
  const events = [];
  await scenario.run((lane, type, message) => {
    events.push({ lane, type, message });
  });

  const databaseError = events.find(
    (event) => event.lane === 'postgres' && event.type === 'error',
  );
  const skipped = events.find((event) => event.type === 'skip');
  assert.equal(
    skipped,
    undefined,
    'PostgreSQL is unavailable. Run `npm run db:up` first.',
  );
  assert.equal(
    databaseError,
    undefined,
    databaseError?.message ?? `${scenario.name} failed`,
  );
  for (const lane of scenario.lanes) {
    assert.ok(
      events.some((event) => event.lane === lane),
      `${scenario.name} did not emit ${lane}`,
    );
  }
  console.log(`✓ ${scenario.name}`);
}
