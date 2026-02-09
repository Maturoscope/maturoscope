import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BaseMailService } from './mail.service';

@Module({
  imports: [ConfigModule],
  providers: [BaseMailService],
  exports: [BaseMailService],
})
export class MailModule {}

