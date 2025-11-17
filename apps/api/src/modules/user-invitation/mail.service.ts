import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseMailService } from '../../common/mail/mail.service';

interface InvitationEmailPayload {
  inviteeEmail: string;
  inviteeFirstName: string;
  magicLink: string;
  companyName: string;
  companyLogoUrl?: string;
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
export class UserInvitationMailService extends BaseMailService {
  constructor(configService: ConfigService) {
    super(configService);
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

    const safeName = inviteeFirstName?.trim()
      ? inviteeFirstName.trim()
      : language?.toUpperCase() === 'FR'
        ? 'cher utilisateur'
        : 'there';
    const htmlLang = language?.toUpperCase() === 'FR' ? 'fr' : 'en';

    const logoHtml = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${safeCompanyName}" style="width:40px;height:40px;border-radius:500px;object-fit:cover;" />`
      : `<span style="display:inline-flex;width:40px;height:40px;border-radius:12px;background:#01070D;color:#ffffff;align-items:center;justify-content:center;font-weight:600;font-size:16px;">${safeCompanyName.slice(0, 1)}</span>`;

    const html = `
      <!DOCTYPE html>
      <html lang="${htmlLang}">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${safeCompanyName} Invitation</title>
        </head>
        <body style="margin:0;padding:32px 0;background-color:#F3F4F6;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;color:#01070D;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;margin:0 16px;background:#ffffff;border-radius:4px;padding:32px;box-shadow:0 16px 40px rgba(17,24,39,0.08);">
                  <tr>
                    <td style="text-align:left;padding-bottom:24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:middle;padding-right:12px;">
                            ${logoHtml}
                          </td>
                          <td style="vertical-align:middle;font-size:20px;font-weight:600;color:#01070D;">${safeCompanyName}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#01070D;padding-bottom:16px;">
                      <strong style="font-size:18px;">${content.greeting} ${safeName},</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#01070D;padding-bottom:16px;">
                      ${content.welcomeMessage}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#01070D;padding-bottom:24px;">
                      ${content.instructionMessage}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:24px;">
                      <a href="${magicLink}" style="display:inline-block;padding:14px 28px;background-color:#171717;color:#ffffff;border-radius:8px;font-size:16px;font-weight:600;text-decoration:none;">
                        ${content.buttonText}
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#01070D;padding-bottom:32px;">
                      ${content.expirationMessage(expirationDays)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
             <td style="font-size:14px;line-height:22px;color:#9CA3AF;padding-top:24px; text-align: center">
                ${content.footerMessage} 
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: inviteeEmail,
      subject: content.subject,
      html,
    });
  }
}
