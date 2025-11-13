import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserInvitationService } from './user-invitation.service';
import { UserInvitationController } from './user-invitation.controller';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../../common/mail/mail.module';
import { UserInvitationMailService } from './mail.service';
import { IntegrationAuth0Module } from '../integration-auth0/integration-auth0.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    IntegrationAuth0Module,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret =
          configService.get<string>('INVITATION_JWT_SECRET') ||
          configService.get<string>('JWT_SECRET');

        if (!secret) {
          throw new Error('Invitation JWT secret is not configured.');
        }

        return {
          secret,
        };
      },
    }),
  ],
  controllers: [UserInvitationController],
  providers: [UserInvitationService, UserInvitationMailService],
  exports: [UserInvitationService],
})
export class UserInvitationModule {}

