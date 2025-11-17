import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { Auth0Config } from '../auth0.config';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(Auth0Strategy.name);
  constructor(private readonly auth0Config: Auth0Config) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: auth0Config.getJwksUri(),
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: auth0Config.getAudience(),
      issuer: auth0Config.getIssuerUrl(),
      algorithms: ['RS256'],
    });
  }

  validate(payload: unknown): unknown {
    type JwtPayload = {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
      userEmail?: string;
      userName?: string;
      userPicture?: string;
      userId?: string;
      userRoles?: string[];
    };

    const p = payload as JwtPayload;

    if (process.env.AUTH_DEBUG !== 'false') {
      try {
        this.logger.debug(
          `JWT payload received: ${JSON.stringify({
            sub: p.sub,
            email: p.email ?? p.userEmail,
            hasRoles: Array.isArray(p.userRoles) && p.userRoles.length > 0,
            iss: this.auth0Config.getIssuerUrl(),
            aud: this.auth0Config.getAudience(),
          })}`,
        );
      } catch (error) {
        this.logger.error('Error logging JWT payload:', error);
      }
    }

    return {
      sub: p.sub,
      email: p.userEmail ?? p.email,
      name: p.userName ?? p.name,
      picture: p.userPicture ?? p.picture,
      roles: p.userRoles ?? [],
    };
  }
}
