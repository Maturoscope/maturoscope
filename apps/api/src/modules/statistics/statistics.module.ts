import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { OrganizationStatistics } from './entities/organization-statistics.entity';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { IntegrationAuth0Module } from '../integration-auth0/integration-auth0.module';
import { AuthModule } from '../../common/auth-module/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrganizationStatistics]),
    OrganizationsModule,
    UsersModule,
    IntegrationAuth0Module,
    AuthModule,
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
  exports: [StatisticsService],
})
export class StatisticsModule {}

