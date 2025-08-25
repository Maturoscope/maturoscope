import { Module } from '@nestjs/common';
import { IntegrationAuth0Service } from './integration-auth0.service';
import { IntegrationAuth0Controller } from './integration-auth0.controller';

@Module({
  providers: [IntegrationAuth0Service],
  exports: [IntegrationAuth0Service],
  controllers: [IntegrationAuth0Controller],
})
export class IntegrationAuth0Module {}
