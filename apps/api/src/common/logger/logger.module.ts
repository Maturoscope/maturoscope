import { Global, Module } from '@nestjs/common';
import { StructuredLoggerService } from './structured-logger.service';

@Global()
@Module({
  providers: [
    { provide: StructuredLoggerService, useFactory: () => new StructuredLoggerService('api') },
  ],
  exports: [StructuredLoggerService],
})
export class LoggerModule {}
