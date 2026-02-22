import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import { StructuredLoggerService } from '../logger/structured-logger.service';

@Injectable()
export class BaseMailService implements OnModuleInit {
  protected logoPath: string;
  protected transporter: nodemailer.Transporter | null = null;
  protected isInitialized = false;
  protected readonly logger: StructuredLoggerService;

  constructor(
    protected readonly configService: ConfigService,
    structuredLogger: StructuredLoggerService,
  ) {
    this.logoPath = path.join(process.cwd(), 'public', 'image', 'logo.png');
    this.logger = structuredLogger.child('BaseMailService');
  }

  protected async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    const clientId = this.configService.get<string>('GMAIL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GMAIL_CLIENT_SECRET');
    const refreshToken = this.configService.get<string>('GMAIL_REFRESH_TOKEN');
    const user = this.configService.get<string>('MAIL_USER');

    if (!clientId || !clientSecret || !refreshToken || !user) {
      throw new Error(
        'Missing Gmail OAuth configuration. Please set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN and MAIL_USER.',
      );
    }

    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');

    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const accessTokenResponse = await oauth2Client.getAccessToken();
    const accessToken = typeof accessTokenResponse === 'string' ? accessTokenResponse : accessTokenResponse?.token;

    if (!accessToken) {
      throw new Error('Failed to obtain access token from Google OAuth');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken,
        accessToken,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return this.transporter;
  }

  async onModuleInit() {
    try {
      if (!fs.existsSync(this.logoPath)) {
        this.logger.warn('Logo file not found', { logoPath: this.logoPath });
      }
      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Mail service initialization failed', error);
      throw error;
    }
  }

  protected async sendEmail(options: { to: string; subject: string; html: string; attachments?: nodemailer.Attachment[] }) {
    if (!this.isInitialized) {
      throw new Error('Mail service not initialized');
    }

    const transporter = await this.getTransporter();
    const appName = this.configService.get<string>('APP_NAME') || 'Maturoscope';
    const mailFrom =
      this.configService.get<string>('MAIL_FROM') || `"${appName}" <${this.configService.get<string>('MAIL_USER')}>`;
    const mailOptions = {
      from: mailFrom,
      ...options,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      this.logger.error('Email send failed', error, { to: options.to, subject: options.subject });
      throw error;
    }
  }
}

