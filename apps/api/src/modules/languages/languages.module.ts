import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../services/entities/service.entity';
import { ServiceTranslation } from '../services/entities/service-translation.entity';
import { OrganizationLanguage } from '../organizations/entities/organization-language.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { IntegrationAuth0Module } from '../integration-auth0/integration-auth0.module';
import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';

/**
 * Owns the multi-language derivation (Live/Draft, Done/Missing) and the
 * language/translation endpoints. Sits downstream of both services and
 * organizations to read their tables without creating a dependency cycle.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Service, ServiceTranslation, OrganizationLanguage]),
    OrganizationsModule,
    UsersModule,
    IntegrationAuth0Module,
  ],
  controllers: [LanguagesController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
