import 'reflect-metadata';
import net from 'node:net';
import {
  Controller,
  Dependencies,
  Module,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  ClientProxyFactory,
  EventPattern,
  MessagePattern,
  Payload,
  RpcException,
  Transport,
} from '@nestjs/microservices';
import {
  firstValueFrom,
  lastValueFrom,
  timeout,
} from 'rxjs';

const LAB_TRACE = Symbol('MICROSERVICES_LAB_TRACE');

async function reserveTcpPort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  const port = typeof address === 'object' ? address.port : null;
  await new Promise((resolve) => server.close(resolve));
  if (!port) throw new Error('Не удалось выбрать локальный TCP-порт');
  return port;
}

class InventoryMessageController {
  constructor(trace) {
    this.trace = trace;
    this.reservations = new Map();
  }

  reserve(command) {
    this.trace.emit(
      'consumer',
      'request',
      `Inventory получил command inventory.reserve для order=${command.orderId}`,
    );

    const existing = this.reservations.get(command.operationId);
    if (existing) {
      this.trace.emit(
        'idempotency',
        'duplicate',
        `Повтор operationId=${command.operationId} вернул прежний reservation`,
      );
      return { ...existing, reused: true };
    }

    if (command.sku === 'sold-out') {
      throw new RpcException({
        code: 'OUT_OF_STOCK',
        message: 'Товар закончился',
      });
    }

    const reservation = {
      reservationId: `reservation-${this.reservations.size + 1}`,
      operationId: command.operationId,
      reused: false,
    };
    this.reservations.set(command.operationId, reservation);
    return reservation;
  }

  orderCreated(event) {
    this.trace.emit(
      'event-consumer',
      'event',
      `Notification получил event order.created для order=${event.orderId}`,
    );
  }
}

Dependencies(LAB_TRACE)(InventoryMessageController);
Controller()(InventoryMessageController);

const reserveDescriptor = Object.getOwnPropertyDescriptor(
  InventoryMessageController.prototype,
  'reserve',
);
MessagePattern({ cmd: 'inventory.reserve' })(
  InventoryMessageController.prototype,
  'reserve',
  reserveDescriptor,
);
Payload()(
  InventoryMessageController.prototype,
  'reserve',
  0,
);

const eventDescriptor = Object.getOwnPropertyDescriptor(
  InventoryMessageController.prototype,
  'orderCreated',
);
EventPattern('order.created')(
  InventoryMessageController.prototype,
  'orderCreated',
  eventDescriptor,
);
Payload()(
  InventoryMessageController.prototype,
  'orderCreated',
  0,
);

class MicroservicesLabModule {}
Module({
  controllers: [InventoryMessageController],
})(MicroservicesLabModule);

export async function microservicesMessaging(emit) {
  const port = await reserveTcpPort();
  const module = {
    module: MicroservicesLabModule,
    providers: [
      {
        provide: LAB_TRACE,
        useValue: { emit },
      },
    ],
  };
  const options = {
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port,
    },
  };
  const service = await NestFactory.createMicroservice(module, {
    ...options,
    logger: false,
  });
  const client = ClientProxyFactory.create(options);

  try {
    emit(
      'boundary',
      'start',
      'Запускаем отдельную Nest application boundary с TCP transport',
    );
    await service.listen();
    await client.connect();

    const command = {
      operationId: 'reserve-order-42',
      orderId: 'order-42',
      sku: 'node-book',
      quantity: 1,
    };
    emit(
      'producer',
      'send',
      'Checkout вызывает request-response pattern inventory.reserve и ждёт один ответ',
    );
    const first = await firstValueFrom(
      client
        .send({ cmd: 'inventory.reserve' }, command)
        .pipe(timeout(2_000)),
    );
    emit(
      'request-response',
      'result',
      `Получен reservation=${first.reservationId}; reused=${first.reused}`,
    );

    const duplicate = await firstValueFrom(
      client
        .send({ cmd: 'inventory.reserve' }, command)
        .pipe(timeout(2_000)),
    );
    emit(
      'idempotency',
      'result',
      `Повторный command не создал вторую запись; reused=${duplicate.reused}`,
    );

    emit(
      'producer',
      'emit',
      'Checkout публикует event order.created и не ждёт business-ответ consumer-а',
    );
    await lastValueFrom(
      client
        .emit('order.created', { orderId: command.orderId })
        .pipe(timeout(2_000)),
      { defaultValue: undefined },
    );

    try {
      await firstValueFrom(
        client
          .send(
            { cmd: 'inventory.reserve' },
            {
              ...command,
              operationId: 'reserve-order-43',
              orderId: 'order-43',
              sku: 'sold-out',
            },
          )
          .pipe(timeout(2_000)),
      );
    } catch (error) {
      const code = error?.code ?? 'REMOTE_ERROR';
      emit(
        'remote-error',
        'error',
        `Remote error пересёк transport boundary: ${code}`,
      );
    }

    emit(
      'architecture',
      'result',
      'Микросервисы дают независимые границы deploy и владения данными, но добавляют сеть, partial failures, contracts, observability и delivery semantics',
    );
  } finally {
    client.close();
    await service.close();
    emit('cleanup', 'done', 'TCP client и Nest microservice остановлены');
  }
}
