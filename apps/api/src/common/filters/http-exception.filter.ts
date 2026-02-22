import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StructuredLoggerService } from '../logger/structured-logger.service';

const REQUEST_ID_HEADER = 'x-request-id';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: StructuredLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const requestId = (req.headers[REQUEST_ID_HEADER] as string) || (req as Request & { requestId?: string }).requestId;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    this.logger.error(
      `HTTP ${req.method} ${req.url} failed`,
      exception,
      {
        requestId,
        method: req.method,
        path: req.url,
        statusCode: status,
        errorMessage: message,
      },
    );

    const body =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: status, message };

    res.status(status).json(body);
  }
}
