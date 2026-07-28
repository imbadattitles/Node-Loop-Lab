import 'reflect-metadata';
import {
  BadRequestException,
  Bind,
  Catch,
  Controller,
  Dependencies,
  ForbiddenException,
  Get,
  Injectable,
  Module,
  Param,
  Scope,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ContextIdFactory,
  NestFactory,
  REQUEST,
} from '@nestjs/core';
import { map } from 'rxjs';

const DI_CONFIG = Symbol('DI_CONFIG');
const AUDIT_LOGGER = Symbol('AUDIT_LOGGER');
const USER_SERVICE_ALIAS = Symbol('USER_SERVICE_ALIAS');
let requestProbeSequence = 0;

class DatabaseConnection {
  constructor(config) {
    this.config = config;
    this.id = `db:${config.database}`;
  }
}
Dependencies(DI_CONFIG)(DatabaseConnection);
Injectable()(DatabaseConnection);

class UsersService {
  constructor(database, auditLogger) {
    this.database = database;
    this.auditLogger = auditLogger;
  }

  describeResolution() {
    this.auditLogger.log('UsersService resolved');
    return {
      databaseId: this.database.id,
      environment: this.database.config.environment,
    };
  }
}
Dependencies(DatabaseConnection, AUDIT_LOGGER)(UsersService);
Injectable()(UsersService);

class RequestScopedProbe {
  constructor() {
    requestProbeSequence += 1;
    this.instanceId = requestProbeSequence;
  }
}
Injectable({ scope: Scope.REQUEST })(RequestScopedProbe);

class NestDiLabModule {}
Module({
  providers: [
    {
      provide: DI_CONFIG,
      useValue: Object.freeze({
        environment: 'learning',
        database: 'users',
      }),
    },
    DatabaseConnection,
    {
      provide: AUDIT_LOGGER,
      useFactory: (config) => ({
        prefix: config.environment,
        messages: [],
        log(message) {
          this.messages.push(`[${this.prefix}] ${message}`);
        },
      }),
      inject: [DI_CONFIG],
    },
    UsersService,
    {
      provide: USER_SERVICE_ALIAS,
      useExisting: UsersService,
    },
    RequestScopedProbe,
  ],
})(NestDiLabModule);

export async function nestDependencyInjection(emit) {
  emit(
    'module',
    'start',
    'Nest читает metadata модуля и строит граф provider tokens',
  );
  const application = await NestFactory.createApplicationContext(
    NestDiLabModule,
    { logger: false },
  );

  try {
    const users = application.get(UsersService);
    const usersAgain = application.get(UsersService);
    const alias = application.get(USER_SERVICE_ALIAS);
    const description = users.describeResolution();
    const logger = application.get(AUDIT_LOGGER);

    emit(
      'container',
      'result',
      `Constructor injection: ${description.databaseId}, environment=${description.environment}`,
    );
    emit(
      'singleton',
      'result',
      `DEFAULT scope: повторный get вернул тот же instance = ${
        users === usersAgain
      }`,
    );
    emit(
      'custom-provider',
      'result',
      `useExisting alias указывает на тот же UsersService = ${
        users === alias
      }`,
    );
    emit(
      'factory',
      'result',
      `useFactory получил DI_CONFIG; audit=${logger.messages.at(-1)}`,
    );

    const requestA = ContextIdFactory.create();
    const requestB = ContextIdFactory.create();
    const probeA1 = await application.resolve(RequestScopedProbe, requestA);
    const probeA2 = await application.resolve(RequestScopedProbe, requestA);
    const probeB = await application.resolve(RequestScopedProbe, requestB);

    emit(
      'scope',
      'result',
      `REQUEST scope: context A ${probeA1.instanceId}/${probeA2.instanceId}, context B ${probeB.instanceId}`,
    );
    emit(
      'scope',
      'info',
      `Внутри одного ContextId instance общий = ${
        probeA1 === probeA2
      }; между запросами новый = ${probeA1 !== probeB}`,
    );
  } finally {
    await application.close();
    emit('lifecycle', 'done', 'Application context закрыт');
  }
}

function requestTrace(request) {
  request.nestLifecycleTrace ??= [];
  return request.nestLifecycleTrace;
}

class LifecycleService {
  execute(id, trace) {
    trace.push('service');
    return { id, entity: `user-${id}` };
  }
}
Injectable()(LifecycleService);

class TraceGuard {
  canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const trace = requestTrace(request);
    if (request.headers['x-lab-access'] !== 'allow') {
      trace.push('guard:deny');
      throw new ForbiddenException('x-lab-access must equal allow');
    }
    trace.push('guard');
    return true;
  }
}
Injectable()(TraceGuard);

class TraceInterceptor {
  intercept(context, next) {
    const request = context.switchToHttp().getRequest();
    const trace = requestTrace(request);
    trace.push('interceptor:before');

    return next.handle().pipe(
      map((value) => {
        trace.push('interceptor:after');
        return { ...value, trace: [...trace] };
      }),
    );
  }
}
Injectable()(TraceInterceptor);

class TraceIdPipe {
  constructor(request) {
    this.request = request;
  }

  transform(value) {
    const trace = requestTrace(this.request);
    trace.push('pipe');
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
      throw new BadRequestException('id must be an integer');
    }
    return parsed;
  }
}
Dependencies(REQUEST)(TraceIdPipe);
Injectable({ scope: Scope.REQUEST })(TraceIdPipe);

class TraceExceptionFilter {
  catch(exception, host) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    const status =
      typeof exception.getStatus === 'function'
        ? exception.getStatus()
        : 500;
    const trace = requestTrace(request);
    trace.push(`exception-filter:${status}`);
    response.status(status).json({
      statusCode: status,
      message: exception.message,
      trace: [...trace],
    });
  }
}
Catch()(TraceExceptionFilter);

class LifecycleController {
  constructor(request, service) {
    this.request = request;
    this.service = service;
  }

  getOne(id) {
    const trace = requestTrace(this.request);
    trace.push('controller');
    return this.service.execute(id, trace);
  }
}
Dependencies(REQUEST, LifecycleService)(LifecycleController);
Bind(Param('id', TraceIdPipe))(
  LifecycleController.prototype,
  'getOne',
  Object.getOwnPropertyDescriptor(LifecycleController.prototype, 'getOne'),
);
Get(':id')(
  LifecycleController.prototype,
  'getOne',
  Object.getOwnPropertyDescriptor(LifecycleController.prototype, 'getOne'),
);
UseGuards(TraceGuard)(LifecycleController);
UseInterceptors(TraceInterceptor)(LifecycleController);
UseFilters(TraceExceptionFilter)(LifecycleController);
Controller('nest-lifecycle')(LifecycleController);

class NestLifecycleLabModule {}
Module({
  controllers: [LifecycleController],
  providers: [
    LifecycleService,
    TraceGuard,
    TraceInterceptor,
    TraceIdPipe,
    TraceExceptionFilter,
  ],
})(NestLifecycleLabModule);

async function readJson(response) {
  const body = await response.json();
  return { status: response.status, body };
}

export async function nestRequestLifecycle(emit) {
  const application = await NestFactory.create(NestLifecycleLabModule, {
    logger: false,
  });
  application.use((request, _response, next) => {
    requestTrace(request).push('middleware');
    next();
  });

  await application.listen(0, '127.0.0.1');
  const address = application.getHttpServer().address();
  const origin = `http://127.0.0.1:${address.port}`;

  try {
    emit(
      'http',
      'schedule',
      'Отправляем успешный запрос в настоящий ephemeral Nest HTTP server',
    );
    const success = await readJson(
      await fetch(`${origin}/nest-lifecycle/42`, {
        headers: { 'x-lab-access': 'allow' },
      }),
    );
    emit(
      'success-path',
      'result',
      `HTTP ${success.status}: ${success.body.trace.join(' → ')}`,
    );

    emit(
      'http',
      'schedule',
      'Отправляем id=not-a-number: Pipe прерывает normal flow',
    );
    const invalid = await readJson(
      await fetch(`${origin}/nest-lifecycle/not-a-number`, {
        headers: { 'x-lab-access': 'allow' },
      }),
    );
    emit(
      'error-path',
      'result',
      `HTTP ${invalid.status}: ${invalid.body.trace.join(' → ')}`,
    );

    emit(
      'http',
      'schedule',
      'Отправляем запрос без доступа: Guard не допускает Interceptor, Pipe и Controller',
    );
    const denied = await readJson(
      await fetch(`${origin}/nest-lifecycle/42`),
    );
    emit(
      'guard-path',
      'result',
      `HTTP ${denied.status}: ${denied.body.trace.join(' → ')}`,
    );

    emit(
      'comparison',
      'info',
      'Middleware видит raw HTTP раньше route context; Interceptor знает handler и оборачивает его до/после',
    );
  } finally {
    await application.close();
    emit('lifecycle', 'done', 'Ephemeral Nest HTTP server остановлен');
  }
}
