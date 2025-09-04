import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { Organization } from './entities/organization.entity';
import { UsersModule } from '../users/users.module';
import { IntegrationAuth0Module } from '../integration-auth0/integration-auth0.module';
import { AuthModule } from '../../common/auth-module/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization]), 
    UsersModule, 
    IntegrationAuth0Module,
    AuthModule
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
