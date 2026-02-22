import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StructuredLoggerService } from '../../logger/structured-logger.service';

@Injectable()
export class JwtLoggingAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly structuredLogger: StructuredLoggerService) {
    super();
  }

  private get logger() {
    return this.structuredLogger.child('JwtAuthGuard');
  }

  handleRequest(err: unknown, user: unknown, info: unknown, context: ExecutionContext) {
    if (process.env.AUTH_DEBUG !== 'true') {
      return super.handleRequest(err as any, user, info, context);
    }
    const req = context.switchToHttp().getRequest();
    const path = req?.url ?? 'unknown';
    if (err) {
      this.logger.warn('Auth error', { path, errorMessage: (err as Error).message });
    }
    if (!user) {
      const infoMsg = typeof info === 'string' ? info : (info as { message?: string })?.message;
      this.logger.warn('Auth rejected - user missing', { path, info: infoMsg ?? 'n/a' });
    }
    return super.handleRequest(err as any, user, info, context);
  }
}


