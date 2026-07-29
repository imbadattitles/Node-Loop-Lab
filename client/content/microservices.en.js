export const microservicesEnglish = {
  'microservices-foundations': {
    title: 'Microservices: boundaries, messages, and failures',
    eyebrow: 'Capability → contract → transport',
    summary:
      'Understand why services are separated, how commands and events cross a network, and which failure modes distributed systems introduce.',
    theory:
      'A microservice is an independently deployable application boundary that owns one business capability and its data. Services interact synchronously through request-response or asynchronously through messages and events. Nest supplies transport abstractions, ClientProxy, @MessagePattern, and @EventPattern, but it cannot remove network failures, schema evolution, delivery semantics, or observability work.',
    watchFor:
      'The runtime starts a real Nest TCP microservice. ClientProxy sends a request-response command, repeats it with the same operationId, emits an event, and receives a serialized remote error.',
    expected: [
      'The producer and consumer run through a real transport boundary.',
      'client.send expects one response while client.emit publishes a notification.',
      '@MessagePattern and @EventPattern select different handler contracts.',
      'A repeated operationId does not create a second reservation.',
      'Remote errors are serialized across the transport.',
      'A timeout limits waiting but does not prove remote cancellation.',
      'The TCP lab demonstrates messaging, not durable broker delivery.',
    ],
    code: `@Controller()
export class InventoryMessages {
  @MessagePattern({ cmd: 'inventory.reserve' })
  reserve(@Payload() command: ReserveInventoryCommand) {
    return this.inventory.reserve(command);
  }
}

const reservation = await firstValueFrom(
  inventoryClient
    .send({ cmd: 'inventory.reserve' }, command)
    .pipe(timeout(2_000)),
);`,
    learning: {
      plain:
        'A monolith resembles one large office: teams communicate quickly inside one building, but a move or outage affects everyone. Microservices are independent offices with explicit responsibilities. They communicate over a network, so every conversation can be delayed, duplicated, or lost.',
      foundation:
        'A microservice is an independently deployable application boundary around a business capability and its owned data. Services communicate synchronously with request-response or asynchronously with messages and events. Nest provides transport abstraction and handler decorators, but network failures, contract evolution, delivery guarantees, and cross-service observability remain application concerns.',
      why:
        'Microservices help when independent teams, different scaling profiles, or separate failure and deployment boundaries justify distributed complexity. They often hurt small systems by adding networking, brokers, tracing, contract testing, and eventual consistency without organizational benefit.',
      resources: [
        {
          label: 'NestJS Microservices',
          href: 'https://docs.nestjs.com/microservices/basics',
          description:
            'Official createMicroservice, transport, ClientProxy, and message-pattern documentation.',
        },
        {
          label: 'NestJS Kafka transporter',
          href: 'https://docs.nestjs.com/microservices/kafka',
          description:
            'Topics, consumer groups, request-response conventions, and Kafka options.',
        },
        {
          label: 'Microservices.io patterns',
          href: 'https://microservices.io/patterns/index.html',
          description:
            'Transactional outbox, saga, API gateway, database per service, and idempotent consumer patterns.',
        },
      ],
      runtimeLayers: [
        { title: 'PRODUCER', detail: 'Nest controller · use case', active: true },
        { title: 'CONTRACT', detail: 'command · event · schema' },
        { title: 'TRANSPORT', detail: 'TCP · Kafka · RabbitMQ · NATS' },
        { title: 'CONSUMER', detail: 'handler · owned data · side effect' },
      ],
      terms: [
        ['Service boundary', 'A deployment, responsibility, and data-ownership boundary around a business capability.'],
        ['Request-response', 'A producer sends a request or command and expects one answer or error before a deadline.'],
        ['Event', 'A fact that already happened, such as OrderCreated; the publisher does not require one consumer’s business response.'],
        ['Message broker', 'Infrastructure that accepts, stores, and delivers messages, such as Kafka, RabbitMQ, NATS, or Redis Streams.'],
        ['Delivery semantics', 'Whether delivery is at-most-once, at-least-once, or made practically exactly-once through constraints and idempotency.'],
        ['Idempotency', 'Repeating an operation with the same key does not produce a second business effect.'],
        ['Eventual consistency', 'Services may temporarily observe different state versions but converge after messages are processed.'],
        ['Distributed trace', 'A connected request and message path across processes using trace and span identifiers.'],
      ],
      steps: [
        ['Find a capability', 'Draw a boundary around business ownership such as orders, inventory, or payments, not technical folders.'],
        ['Define a contract', 'Include version, operation or correlation identifiers, and a minimal payload that does not leak internal schemas.'],
        ['Choose interaction', 'Use request-response for an immediate answer and an event for independent reactions to an established fact.'],
        ['Cross the transport', 'Serialization turns a message into bytes; transport delivers it and the consumer deserializes it.'],
        ['Handle failure', 'Timeout, retry, circuit-breaker, and dead-letter policies bound partial failure.'],
        ['Make repeats safe', 'Persist an operation ID or use a UNIQUE constraint so duplicate delivery does not repeat a side effect.'],
        ['Connect observability', 'Propagate correlation and trace context through every message boundary.'],
      ],
      nuances: [
        ['A microservice is not merely a small REST API', 'Code size is secondary; independent business ownership, deployment, and protected data matter.'],
        ['The network is part of the program', 'A server can complete while the client times out, so “no response” does not mean “not executed.”'],
        ['At-least-once implies duplicates', 'A broker may redeliver after an acknowledgement failure; consumers must be idempotent.'],
        ['Published events cannot be edited in place', 'Independent consumers already depend on the contract, so use compatible fields, versioning, and migrations.'],
        ['Database per service describes ownership', 'Databases may share a physical cluster, but services should not directly mutate another owner’s tables.'],
        ['TCP is a teaching transport here', 'The lab demonstrates a real Nest boundary without infrastructure; durable production delivery may need Kafka, RabbitMQ, or NATS.'],
      ],
      pitfalls: [
        ['Microservices automatically make a system scalable.', 'They permit independent scaling, but poor contracts and a shared database preserve coupling.'],
        ['A service may synchronously call five more services.', 'Long request chains multiply latency and partial-failure probability.'],
        ['A broker guarantees there are no duplicates.', 'Practical delivery usually requires idempotent consumers and deduplication.'],
        ['A shared database is harmless convenience.', 'Direct writes into another service’s tables destroy ownership and independent deployment.'],
        ['A pet project should begin with ten services.', 'A modular monolith is often cheaper until a measurable reason for extraction appears.'],
      ],
      codeIntro:
        'The runtime starts a real Nest microservice over TCP. ClientProxy sends a command, repeats it with the same operationId, emits an event, and receives a serialized remote error.',
      codeNotes: [
        '@MessagePattern maps a request pattern to a handler.',
        'client.send returns a cold Observable and expects one response.',
        '@EventPattern handles a notification without a business response.',
        'client.emit publishes an event rather than a consumer result.',
        'timeout bounds client waiting but does not prove remote cancellation.',
        'operationId makes a repeated command business-safe.',
      ],
      examples: [
        {
          title: 'Command consumer',
          goal: 'Let Inventory answer a command and return a producer result.',
          code: `@Controller()
export class InventoryMessages {
  @MessagePattern({ cmd: 'inventory.reserve' })
  reserve(@Payload() command: ReserveInventoryCommand) {
    return this.inventory.reserve(command);
  }
}`,
          notes: ['The pattern addresses a message inside the transport.', '@Payload extracts the deserialized body.', 'The return value becomes the response.'],
        },
        {
          title: 'Request-response producer',
          goal: 'Send a command and wait for a bounded time.',
          code: `const response = await firstValueFrom(
  inventoryClient
    .send(
      { cmd: 'inventory.reserve' },
      { operationId, orderId, sku, quantity },
    )
    .pipe(timeout(2_000)),
);`,
          notes: ['send creates an Observable request.', 'firstValueFrom turns its first response into a Promise.', 'timeout does not necessarily cancel the consumer.'],
        },
        {
          title: 'Event consumer',
          goal: 'Let Notifications react to an order that already exists.',
          code: `@Controller()
export class OrderEvents {
  @EventPattern('order.created.v1')
  handle(@Payload() event: OrderCreatedV1) {
    return this.notifications.sendConfirmation(event);
  }
}`,
          notes: ['The name describes a completed fact.', 'A version supports contract evolution.', 'The publisher does not know every consumer.'],
        },
        {
          title: 'Event publisher',
          goal: 'Notify independent consumers after a successful commit.',
          code: `this.events.emit('order.created.v1', {
  eventId: randomUUID(),
  occurredAt: new Date().toISOString(),
  orderId,
  customerId,
});`,
          notes: ['A production event is often published by an outbox relay.', 'eventId supports deduplication and tracing.'],
        },
        {
          title: 'Idempotent consumer',
          goal: 'Avoid repeating a side effect after duplicate delivery.',
          code: `await db.query(
  \`INSERT INTO processed_messages (consumer, message_id)
   VALUES ($1, $2)
   ON CONFLICT DO NOTHING
   RETURNING message_id\`,
  ['email-confirmation', event.eventId],
);`,
          notes: ['UNIQUE(consumer, message_id) protects races.', 'Zero rowCount means duplicate.', 'The marker and side effect need a consistent transaction boundary.'],
        },
        {
          title: 'Transactional outbox',
          goal: 'Avoid losing an event between database commit and broker publish.',
          code: `await db.transaction(async (tx) => {
  const order = await orders.insert(tx, input);
  await outbox.insert(tx, {
    type: 'order.created.v1',
    aggregateId: order.id,
    payload: { orderId: order.id },
  });
});`,
          notes: ['The order and outbox row commit atomically.', 'A relay retries broker publishing.', 'Consumers still need duplicate safety.'],
        },
      ],
      questions: [
        'When is request-response better than an event, and when is it worse?',
        'Why does a timeout not prove that remote work did not execute?',
        'Why do messages need eventId, operationId, and version?',
        'Why must an at-least-once consumer be idempotent?',
        'How does a transactional outbox close the dual-write gap?',
        'Why should two services not mutate the same business table?',
        'When is a modular monolith the more reasonable choice?',
      ],
    },
  },
};
