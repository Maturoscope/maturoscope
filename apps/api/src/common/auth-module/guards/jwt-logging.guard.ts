import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtLoggingAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtLoggingAuthGuard.name);

  handleRequest(err: unknown, user: unknown, info: unknown, context: ExecutionContext) {
    if (process.env.AUTH_DEBUG === 'true') {
      const req = context.switchToHttp().getRequest();
      const path = req?.url;
      if (err) {
        this.logger.warn(`Auth error on ${path}: ${(err as Error).message}`);
      }
      if (!user) {
        const infoMsg = typeof info === 'string' ? info : (info as any)?.message;
        this.logger.warn(`Auth rejected on ${path}: user missing. info=${infoMsg ?? 'n/a'}`);
      }
    }
    return super.handleRequest(err as any, user, info, context);
  }
}


