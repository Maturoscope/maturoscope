import { Injectable } from '@nestjs/common';

@Injectable()
export class Auth0Config {
  private readonly issuerUrl: string;
  private readonly audience: string;

  constructor() {
    const issuerUrl = process.env.AUTH0_ISSUER_URL;
    if (!issuerUrl) {
      throw new Error('AUTH0_ISSUER_URL environment variable is required');
    }
    this.issuerUrl = issuerUrl.endsWith('/') ? issuerUrl : `${issuerUrl}/`;

    const audience = process.env.AUTH0_AUDIENCE;
    if (!audience) {
      throw new Error('AUTH0_AUDIENCE environment variable is required');
    }
    this.audience = audience;
  }

  getIssuerUrl(): string {
    return this.issuerUrl;
  }

  getAudience(): string {
    return this.audience;
  }

  getJwksUri(): string {
    return `${this.issuerUrl}.well-known/jwks.json`;
  }
}
