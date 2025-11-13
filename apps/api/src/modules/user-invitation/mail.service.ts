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
}

@Injectable()
export class UserInvitationMailService extends BaseMailService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async sendInvitationEmail({
    inviteeEmail,
    inviteeFirstName,
    magicLink,
    companyName,
    companyLogoUrl,
    expirationDays,
  }: InvitationEmailPayload) {
    const safeName = inviteeFirstName?.trim() ? inviteeFirstName.trim() : 'there';
    const safeCompanyName = companyName || this.configService.get<string>('APP_NAME') || 'Maturoscope';
    const logoHtml = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${safeCompanyName}" style="width:40px;height:40px;border-radius:12px;object-fit:cover;" />`
      : `<span style="display:inline-flex;width:40px;height:40px;border-radius:12px;background:#111827;color:#ffffff;align-items:center;justify-content:center;font-weight:600;font-size:16px;">${safeCompanyName.slice(0, 1)}</span>`;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${safeCompanyName} Invitation</title>
        </head>
        <body style="margin:0;padding:32px 0;background-color:#F3F4F6;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif;color:#111827;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="560" style="max-width:560px;margin:0 16px;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 16px 40px rgba(17,24,39,0.08);">
                  <tr>
                    <td style="text-align:left;padding-bottom:24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align:middle;padding-right:12px;">
                            ${logoHtml}
                          </td>
                          <td style="vertical-align:middle;font-size:20px;font-weight:600;color:#111827;">${safeCompanyName}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#111827;padding-bottom:16px;">
                      <strong style="font-size:18px;">Hi ${safeName},</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#4B5563;padding-bottom:16px;">
                      Welcome to the ${safeCompanyName} Team — we're thrilled to have you on board!
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#4B5563;padding-bottom:24px;">
                      You're just one click away from activating your account. Tap the button below to complete your registration:
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:24px;">
                      <a href="${magicLink}" style="display:inline-block;padding:14px 28px;background-color:#111827;color:#ffffff;border-radius:14px;font-size:16px;font-weight:600;text-decoration:none;">
                        Complete my Registration
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#4B5563;padding-bottom:32px;">
                      Heads up: this link will expire in <strong>${expirationDays} day${expirationDays === 1 ? '' : 's'}</strong>.
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;line-height:22px;color:#9CA3AF;border-top:1px solid #E5E7EB;padding-top:24px;">
                      Didn't expect this email? No worries — just ignore it.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: inviteeEmail,
      subject: `You're invited to ${safeCompanyName}`,
      html,
    });
  }
}

