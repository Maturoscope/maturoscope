import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { IntegrationAuth0Module } from '../integration-auth0/integration-auth0.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/common/auth-module/auth.module';
import { AuthRoleGuard } from '../../common/auth-module/guards/auth-role.guard';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User]), IntegrationAuth0Module, AuthModule],
  controllers: [UsersController],
  providers: [UsersService, AuthRoleGuard],
  exports: [UsersService, AuthRoleGuard],
})
export class UsersModule {}
