const microserviceLayers = [
  {
    title: 'PRODUCER',
    detail: 'Nest controller · use case',
    active: true,
  },
  {
    title: 'CONTRACT',
    detail: 'command · event · schema',
  },
  {
    title: 'TRANSPORT',
    detail: 'TCP · Kafka · RabbitMQ · NATS',
  },
  {
    title: 'CONSUMER',
    detail: 'handler · owned data · side effect',
  },
];

export const microservicesLearningRu = {
  'microservices-foundations': {
    plain:
      'Монолит похож на один большой офис: отделы находятся в одном здании и могут быстро разговаривать, но переезд или авария затрагивает всех. Микросервисы — несколько самостоятельных офисов с чёткими зонами ответственности. Они общаются по сети, поэтому каждый разговор может задержаться, повториться или не дойти.',
    foundation:
      'Микросервис — независимо развёртываемая application boundary, владеющая конкретной business capability и своими данными. Сервисы взаимодействуют синхронно через request-response или асинхронно через messages/events. Nest предоставляет transport abstraction, ClientProxy, @MessagePattern и @EventPattern, но не отменяет сетевые failures, schema evolution, delivery semantics и observability.',
    why:
      'Микросервисы полезны, когда независимые команды, разные профили нагрузки или отдельные failure/deployment boundaries окупают распределённую сложность. Маленькой системе они часто вредят: добавляют сеть, брокер, tracing, contract testing и eventual consistency без реальной организационной выгоды.',
    resources: [
      {
        label: 'NestJS Microservices',
        href: 'https://docs.nestjs.com/microservices/basics',
        description:
          'Официальная документация по createMicroservice, transports, ClientProxy и message patterns.',
      },
      {
        label: 'NestJS Kafka transporter',
        href: 'https://docs.nestjs.com/microservices/kafka',
        description:
          'Topics, consumer groups, request-response conventions и Kafka-specific options.',
      },
      {
        label: 'Microservices.io patterns',
        href: 'https://microservices.io/patterns/index.html',
        description:
          'Каталог patterns: transactional outbox, saga, API gateway, database per service и idempotent consumer.',
      },
    ],
    runtimeLayers: microserviceLayers,
    terms: [
      {
        name: 'Service boundary',
        description:
          'Граница ответственности, deploy и владения данными вокруг business capability, а не случайного набора controllers.',
      },
      {
        name: 'Request-response',
        description:
          'Producer отправляет request/command и ожидает ровно один ответ или ошибку в пределах timeout.',
      },
      {
        name: 'Event',
        description:
          'Факт, уже произошедший в прошлом: OrderCreated. Publisher не требует business-ответа конкретного consumer.',
      },
      {
        name: 'Message broker',
        description:
          'Посредник, который принимает, хранит и доставляет messages: Kafka, RabbitMQ, NATS, Redis Streams и другие.',
      },
      {
        name: 'Delivery semantics',
        description:
          'Гарантии доставки: at-most-once, at-least-once или practically exactly-once через ограничения и idempotency.',
      },
      {
        name: 'Idempotency',
        description:
          'Повтор одной операции с тем же ключом не создаёт второй business effect.',
      },
      {
        name: 'Eventual consistency',
        description:
          'Сервисы некоторое время могут видеть разные версии состояния, но сходятся после доставки событий.',
      },
      {
        name: 'Distributed trace',
        description:
          'Связанный путь request/messages через несколько процессов по traceId и spanId.',
      },
    ],
    steps: [
      {
        title: 'Найдите capability',
        description:
          'Граница строится вокруг бизнес-владения: orders, inventory, payments, а не вокруг технических folders.',
      },
      {
        title: 'Определите contract',
        description:
          'Message содержит version, operationId/correlationId и минимальный payload без утечки внутренней schema.',
      },
      {
        title: 'Выберите взаимодействие',
        description:
          'Request-response нужен немедленный ответ; event подходит независимой реакции после свершившегося факта.',
      },
      {
        title: 'Пересеките transport',
        description:
          'Serializer превращает message в bytes, transport доставляет его другому process, consumer десериализует payload.',
      },
      {
        title: 'Обработайте failure',
        description:
          'Timeout, retry, circuit breaker и dead-letter policy ограничивают partial failure.',
      },
      {
        title: 'Сделайте повтор безопасным',
        description:
          'Consumer сохраняет operationId или использует UNIQUE constraint, чтобы duplicate delivery не повторил side effect.',
      },
      {
        title: 'Свяжите наблюдаемость',
        description:
          'Logs, metrics и traces передают correlation/trace context через каждую message boundary.',
      },
    ],
    nuances: [
      {
        title: 'Микросервис не равен маленькому REST API',
        description:
          'Размер кода вторичен. Важны самостоятельное business ownership, deploy boundary и данные, которые нельзя менять в обход owner-а.',
      },
      {
        title: 'Сеть — часть программы',
        description:
          'Вызов может завершиться на сервере, но timeout произойдёт у клиента. Поэтому «не получил ответ» не означает «операция не была выполнена».',
      },
      {
        title: 'At-least-once означает duplicates',
        description:
          'Broker может повторно доставить message после сбоя acknowledgement. Consumer обязан быть идемпотентным.',
      },
      {
        title: 'Events нельзя изменять задним числом',
        description:
          'Published contract уже читают независимые consumers. Добавляйте совместимые fields, versioning и migration strategy.',
      },
      {
        title: 'Database per service — ownership, не обязательно server',
        description:
          'Сервисы не должны напрямую менять чужие tables. Физически базы могут жить в одном cluster, но schemas и credentials разделяют владение.',
      },
      {
        title: 'TCP runtime — учебный transport',
        description:
          'Лаборатория показывает настоящий Nest transport без внешней инфраструктуры. Для durable delivery production выбирает Kafka/RabbitMQ/NATS по требованиям.',
      },
    ],
    pitfalls: [
      {
        myth: 'Микросервисы автоматически делают систему масштабируемой.',
        fact: 'Они позволяют масштабировать boundaries независимо, но плохие contracts и общая БД сохраняют coupling.',
      },
      {
        myth: 'Каждый service может синхронно вызвать пять следующих.',
        fact: 'Длинная request-chain умножает latency и вероятность partial failure.',
      },
      {
        myth: 'Broker гарантирует отсутствие duplicates.',
        fact: 'Большинство практичных схем требуют idempotent consumers и deduplication.',
      },
      {
        myth: 'Общая database упрощает взаимодействие без последствий.',
        fact: 'Прямое изменение чужих tables уничтожает ownership и делает независимый deploy фиктивным.',
      },
      {
        myth: 'Начинать pet-project нужно сразу с десяти services.',
        fact: 'Сначала модульный монолит часто дешевле; boundary выносят после появления измеримой причины.',
      },
    ],
    codeIntro:
      'Runtime поднимает реальную Nest microservice application с TCP transport. ClientProxy делает request-response command, повторяет его с тем же operationId, публикует event и получает сериализованную remote error.',
    codeNotes: [
      '@MessagePattern связывает request pattern с handler.',
      'client.send возвращает cold Observable и ожидает один response.',
      '@EventPattern обрабатывает notification без business-response.',
      'client.emit публикует event и не выражает результат consumer use case.',
      'timeout ограничивает ожидание клиента, но не доказывает отмену remote work.',
      'operationId делает повтор business-safe.',
    ],
    examples: [
      {
        title: 'Consumer команды',
        goal:
          'Inventory отвечает на command и возвращает результат producer-у.',
        code: `@Controller()
export class InventoryMessages {
  @MessagePattern({ cmd: 'inventory.reserve' })
  reserve(@Payload() command: ReserveInventoryCommand) {
    return this.inventory.reserve(command);
  }
}`,
        notes: [
          'Pattern — адрес сообщения внутри transport.',
          '@Payload извлекает deserialized body.',
          'Return сериализуется как response.',
        ],
      },
      {
        title: 'Producer request-response',
        goal:
          'Checkout отправляет command и ждёт ограниченное время.',
        code: `const response = await firstValueFrom(
  inventoryClient
    .send(
      { cmd: 'inventory.reserve' },
      { operationId, orderId, sku, quantity },
    )
    .pipe(timeout(2_000)),
);`,
        notes: [
          'send создаёт Observable запроса.',
          'firstValueFrom превращает первый response в Promise.',
          'timeout ограничивает ожидание, но не обязательно отменяет consumer.',
        ],
      },
      {
        title: 'Consumer события',
        goal:
          'Notifications реагирует на уже созданный заказ.',
        code: `@Controller()
export class OrderEvents {
  @EventPattern('order.created.v1')
  handle(@Payload() event: OrderCreatedV1) {
    return this.notifications.sendConfirmation(event);
  }
}`,
        notes: [
          'Имя события описывает свершившийся факт.',
          'Version помогает эволюции contract.',
          'Publisher не знает список consumers.',
        ],
      },
      {
        title: 'Publisher события',
        goal:
          'Сообщить независимым consumers после успешного commit.',
        code: `this.events.emit('order.created.v1', {
  eventId: randomUUID(),
  occurredAt: new Date().toISOString(),
  orderId,
  customerId,
});`,
        notes: [
          'В production event обычно публикует outbox relay.',
          'eventId используется для deduplication и tracing.',
        ],
      },
      {
        title: 'Idempotent consumer',
        goal:
          'Не выполнить side effect второй раз при duplicate delivery.',
        code: `await db.query(
  \`INSERT INTO processed_messages (consumer, message_id)
   VALUES ($1, $2)
   ON CONFLICT DO NOTHING
   RETURNING message_id\`,
  ['email-confirmation', event.eventId],
);`,
        notes: [
          'UNIQUE(consumer, message_id) защищает от race.',
          'Нулевой rowCount означает duplicate.',
          'Marker и side effect должны иметь согласованную transaction boundary.',
        ],
      },
      {
        title: 'Transactional outbox',
        goal:
          'Не потерять event между database commit и broker publish.',
        code: `await db.transaction(async (tx) => {
  const order = await orders.insert(tx, input);
  await outbox.insert(tx, {
    type: 'order.created.v1',
    aggregateId: order.id,
    payload: { orderId: order.id },
  });
});`,
        notes: [
          'Order и outbox row commit-ятся атомарно.',
          'Отдельный relay повторяет broker publish.',
          'Consumer всё равно должен выдерживать duplicate.',
        ],
      },
    ],
    questions: [
      'Когда request-response лучше event, а когда хуже?',
      'Почему timeout не доказывает, что remote operation не выполнилась?',
      'Зачем message нужны eventId, operationId и version?',
      'Почему at-least-once consumer обязан быть идемпотентным?',
      'Как transactional outbox закрывает dual-write problem?',
      'Почему два services не должны напрямую менять одну business table?',
      'В каком случае модульный монолит будет разумнее микросервисов?',
    ],
  },
};
