import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Auth0Strategy } from './strategy/auth0-strategy';
import { Auth0Config } from './auth0.config';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [Auth0Strategy, Auth0Config],
  exports: [PassportModule, Auth0Strategy, Auth0Config],
})
export class AuthModule {}
