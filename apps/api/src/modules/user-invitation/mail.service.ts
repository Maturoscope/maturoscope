import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseMailService } from '../../common/mail/mail.service';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as nodemailer from 'nodemailer';

interface InvitationEmailPayload {
  inviteeEmail: string;
  inviteeFirstName: string;
  magicLink: string;
  companyName: string;
  companyLogoUrl?: string;
  expirationDays: number;
  language?: string;
}

interface AdminInvitationEmailPayload {
  inviteeEmail: string;
  inviteeFirstName: string;
  magicLink: string;
  organizationName: string;
  expirationDays: number;
  language?: string;
}

interface EmailContent {
  subject: string;
  greeting: string;
  welcomeMessage: string;
  instructionMessage: string;
  buttonText: string;
  expirationMessage: (days: number) => string;
  footerMessage: string;
}

@Injectable()
export class UserInvitationMailService extends BaseMailService implements OnModuleInit {
  protected maturoscopeLogoPath: string;
  private readonly logger = new Logger(UserInvitationMailService.name);

  constructor(configService: ConfigService) {
    super(configService);
    this.maturoscopeLogoPath = path.join(process.cwd(), 'public', 'image', 'maturoscope-logo.png');
  }

  async onModuleInit() {
    await super.onModuleInit();
    try {
      if (fs.existsSync(this.maturoscopeLogoPath)) {
        this.logger.log(`Maturoscope logo file found at: ${this.maturoscopeLogoPath}`);
      } else {
        this.logger.warn(`Maturoscope logo file not found at: ${this.maturoscopeLogoPath}`);
      }
    } catch (error) {
      this.logger.error('Error checking Maturoscope logo file', error);
    }
  }

  private getEmailContent(language: string, companyName: string): EmailContent {
    const lang = language?.toUpperCase() === 'FR' ? 'FR' : 'EN';

    const translations = {
      EN: {
        subject: `You're invited to ${companyName}`,
        greeting: 'Hi',
        welcomeMessage: `Welcome to the ${companyName} Team — we're thrilled to have you on board!`,
        instructionMessage: `You're just one click away from activating your account. Tap the button below to complete your registration:`,
        buttonText: 'Complete my Registration',
        expirationMessage: (days: number) =>
          `Heads up: this link will expire in <strong>${days} day${days === 1 ? '' : 's'}</strong>.`,
        footerMessage: `Didn't expect this email? No worries — just ignore it.`,
      },
      FR: {
        subject: `Vous êtes invité à rejoindre ${companyName}`,
        greeting: 'Bonjour',
        welcomeMessage: `Bienvenue dans l'équipe ${companyName} — nous sommes ravis de vous accueillir !`,
        instructionMessage: `Vous n'êtes qu'à un clic d'activer votre compte. Cliquez sur le bouton ci-dessous pour compléter votre inscription :`,
        buttonText: 'Compléter mon inscription',
        expirationMessage: (days: number) =>
          `Attention : ce lien expirera dans <strong>${days} jour${days === 1 ? '' : 's'}</strong>.`,
        footerMessage: `Vous n'attendiez pas cet e-mail ? Pas de souci — ignorez-le simplement.`,
      },
    };

    return translations[lang];
  }

  async sendInvitationEmail({
    inviteeEmail,
    inviteeFirstName,
    magicLink,
    companyName,
    companyLogoUrl,
    expirationDays,
    language = 'EN',
  }: InvitationEmailPayload) {
    const safeCompanyName =
      companyName ||
      this.configService.get<string>('APP_NAME') ||
      'Maturoscope';
    const content = this.getEmailContent(language, safeCompanyName);

    let safeName: string;
    if (inviteeFirstName?.trim()) {
      const trimmedFirstName = inviteeFirstName.trim();
      if (trimmedFirstName.toLowerCase() === safeCompanyName.toLowerCase()) {
        safeName = language?.toUpperCase() === 'FR' ? 'cher utilisateur' : 'there';
      } else {
        safeName = trimmedFirstName;
      }
    } else {
      safeName = language?.toUpperCase() === 'FR' ? 'cher utilisateur' : 'there';
    }
    const htmlLang = language?.toUpperCase() === 'FR' ? 'fr' : 'en';

    const logoHtml = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${safeCompanyName}" style="width:40px;height:40px;border-radius:500px;object-fit:cover;" />`
      : `<span style="display:inline-flex;width:40px;height:40px;border-radius:12px;background:#01070D;color:#ffffff;align-items:center;justify-content:center;font-weight:600;font-size:16px;">${safeCompanyName.slice(0, 1)}</span>`;

    const attachments: nodemailer.Attachment[] = [];
    let maturoscopeSignature: string;

    if (fs.existsSync(this.maturoscopeLogoPath)) {
      attachments.push({
        filename: 'maturoscope-logo.png',
        path: this.maturoscopeLogoPath,
        cid: 'maturoscope-logo',
      });
      maturoscopeSignature = `<img src="cid:maturoscope-logo" alt="Maturoscope" style="max-width:200px;height:auto;display:block;margin:0 auto;" />`;
    } else {
      maturoscopeSignature = `<strong style="font-size:18px;color:#1F2937;font-weight:600;">Maturoscope.</strong>`;
    }

    // Load and render the EJS template
    const templatePath = path.join(__dirname, 'templates', 'email', 'member-invitation.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, {
      htmlLang,
      safeCompanyName,
      logoHtml,
      content,
      safeName,
      magicLink,
      expirationDays,
      maturoscopeSignature,
    });

    await this.sendEmail({
      to: inviteeEmail,
      subject: content.subject,
      html,
      attachments,
    });
  }

  private getAdminEmailContent(language: string, organizationName: string): EmailContent {
    const lang = language?.toUpperCase() === 'FR' ? 'FR' : 'EN';

    const translations = {
      EN: {
        subject: "Welcome to Maturoscope — Activate Your Admin Account",
        greeting: 'Hi',
        welcomeMessage: (orgName: string) => `Welcome to the ${orgName} Team — we're thrilled to have you on board!`,
        instructionMessage: `You're just one click away from activating your account. Tap the button below to complete your registration:`,
        buttonText: 'Complete my Registration',
        expirationMessage: (days: number) =>
          `Heads up: this link will expire in <strong>${days} day${days === 1 ? '' : 's'}</strong>.`,
        footerMessage: `Didn't expect this email? No worries — just ignore it.`,
      },
      FR: {
        subject: "Bienvenue sur Maturoscope — Activez votre compte administrateur",
        greeting: 'Bonjour',
        welcomeMessage: (orgName: string) => `Bienvenue dans l'équipe ${orgName} — nous sommes ravis de vous accueillir !`,
        instructionMessage: `Vous n'êtes qu'à un clic d'activer votre compte. Cliquez sur le bouton ci-dessous pour compléter votre inscription :`,
        buttonText: 'Compléter mon inscription',
        expirationMessage: (days: number) =>
          `Attention : ce lien expirera dans <strong>${days} jour${days === 1 ? '' : 's'}</strong>.`,
        footerMessage: `Vous n'attendiez pas cet e-mail ? Pas de souci — ignorez-le simplement.`,
      },
    };

    const content = translations[lang];
    // Replace welcomeMessage function with the actual message
    return {
      ...content,
      welcomeMessage: content.welcomeMessage(organizationName),
    };
  }

  async sendAdminInvitationEmail({
    inviteeEmail,
    inviteeFirstName,
    magicLink,
    organizationName,
    expirationDays,
    language = 'EN',
  }: AdminInvitationEmailPayload) {
    const content = this.getAdminEmailContent(language, organizationName);

    // Format name as "[Organization Name] Admin" (e.g., "Nobatek Admin")
    // Use organizationName directly instead of inviteeFirstName to ensure correct format
    const safeName = organizationName?.trim()
      ? `${organizationName.trim()} Admin`
      : inviteeFirstName?.trim()
        ? `${inviteeFirstName.trim()} Admin`
        : 'Admin';
    const htmlLang = language?.toUpperCase() === 'FR' ? 'fr' : 'en';

    const attachments: nodemailer.Attachment[] = [];
    let maturoscopeSignature: string;

    if (fs.existsSync(this.maturoscopeLogoPath)) {
      attachments.push({
        filename: 'maturoscope-logo.png',
        path: this.maturoscopeLogoPath,
        cid: 'maturoscope-logo',
      });
      maturoscopeSignature = `<img src="cid:maturoscope-logo" alt="Maturoscope" style="max-width:200px;height:auto;display:block;margin:0 auto;" />`;
      this.logger.log(`Maturoscope logo file found at: ${this.maturoscopeLogoPath}`);
    } else {
      maturoscopeSignature = `<strong style="font-size:18px;color:#1F2937;font-weight:600;">Maturoscope.</strong>`;
      this.logger.warn(`Maturoscope logo file not found at: ${this.maturoscopeLogoPath}`);
    }
    
    // Load and render the EJS template
    const templatePath = path.join(__dirname, 'templates', 'email', 'admin-invitation.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, {
      htmlLang,
      content,
      safeName,
      magicLink,
      expirationDays,
      maturoscopeSignature,
    });

    await this.sendEmail({
      to: inviteeEmail,
      subject: content.subject,
      html,
      attachments,
    });
  }
}
