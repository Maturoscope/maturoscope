import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseMailService } from '../../common/mail/mail.service';

interface ServiceContactEmailPayload {
  expertEmail: string;
  expertFirstName: string;
  expertLastName: string;
  companyName: string;
  companyLogoUrl?: string;
  supportEmail?: string;
  language?: string;
  clientData: {
    company?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    additionalInformation?: string;
  };
  projectData: {
    projectName?: string;
    serviceTitle: string;
    gapTitle?: string;
    category?: string;
    currentLevel?: string;
  };
}

interface EmailContent {
  subject: string;
        greeting: string;
        introMessage: string;
        instructionMessage: string;
        projectDetailsTitle: string;
  clientInformationTitle: string;
  projectNameLabel: string;
  serviceNeededLabel: string;
  gapToCompleteLabel: string;
  categoryLevelLabel: string;
  companyLabel: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  commentsLabel: string;
  additionalInfoMessage: string;
  alternativeProviderMessage: string;
  questionsMessage: string;
  footerMessage: string;
  maturoscopeLabel: string;
}

@Injectable()
export class ServiceContactMailService extends BaseMailService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  private getEmailContent(language: string, companyName: string): EmailContent {
    const lang = language?.toUpperCase() === 'FR' ? 'FR' : 'EN';

    const translations = {
      EN: {
        subject: `New Project Match - ${companyName}`,
        greeting: 'Hi',
        introMessage:
          'A new client has requested your expertise through Maturoscope — we\'re excited to connect you!',
        instructionMessage:
          'You\'ve been matched with a project that needs help closing a specific gap. Review the details below and reach out to get started:',
        projectDetailsTitle: 'Project details',
        clientInformationTitle: 'Client Information',
        projectNameLabel: 'Project name',
        serviceNeededLabel: 'Service needed',
        gapToCompleteLabel: 'Gap to complete',
        categoryLevelLabel: 'Category & level',
        companyLabel: 'Company',
        nameLabel: 'Name',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        commentsLabel: 'Comments',
        additionalInfoMessage:
          'The client\'s complete questionnaire responses are attached to this email. This will give you full context on their current maturity level and specific needs.',
        alternativeProviderMessage:
          'If you\'re unable to assist with this request, please let us know as soon as possible so we can connect them with an alternative provider.',
        questionsMessage: 'Questions? Contact us at',
        footerMessage: 'Didn\'t expect this email? No worries — just ignore it.',
        maturoscopeLabel: 'Maturoscope.',
      },
      FR: {
        subject: `Nouveau projet correspondant - ${companyName}`,
        greeting: 'Bonjour',
        introMessage:
          'Un nouveau client a demandé votre expertise via Maturoscope — nous sommes ravis de vous mettre en relation !',
        instructionMessage:
          'Vous avez été mis en relation avec un projet qui a besoin d\'aide pour combler un écart spécifique. Consultez les détails ci-dessous et contactez-nous pour commencer :',
        projectDetailsTitle: 'Détails du projet',
        clientInformationTitle: 'Informations client',
        projectNameLabel: 'Nom du projet',
        serviceNeededLabel: 'Service requis',
        gapToCompleteLabel: 'Écart à combler',
        categoryLevelLabel: 'Catégorie et niveau',
        companyLabel: 'Entreprise',
        nameLabel: 'Nom',
        emailLabel: 'E-mail',
        phoneLabel: 'Téléphone',
        commentsLabel: 'Commentaires',
        additionalInfoMessage:
          'Les réponses complètes du questionnaire du client sont jointes à cet e-mail. Cela vous donnera le contexte complet sur leur niveau de maturité actuel et leurs besoins spécifiques.',
        alternativeProviderMessage:
          'Si vous ne pouvez pas aider avec cette demande, veuillez nous le faire savoir dès que possible afin que nous puissions les mettre en contact avec un autre prestataire.',
        questionsMessage: 'Des questions ? Contactez-nous à',
        footerMessage: 'Vous n\'attendiez pas cet e-mail ? Pas de souci — ignorez-le simplement.',
        maturoscopeLabel: 'Maturoscope.',
      },
    };

    return translations[lang];
  }

  async sendServiceContactEmail({
    expertEmail,
    expertFirstName,
    expertLastName,
    companyName,
    companyLogoUrl,
    supportEmail,
    language = 'EN',
    clientData,
    projectData,
  }: ServiceContactEmailPayload) {
    const safeCompanyName =
      companyName ||
      this.configService.get<string>('APP_NAME') ||
      'Maturoscope';
    const content = this.getEmailContent(language, safeCompanyName);

    const expertFullName = `${expertFirstName || ''} ${expertLastName || ''}`.trim() || 'Expert';
    const htmlLang = language?.toUpperCase() === 'FR' ? 'fr' : 'en';

    const logoHtml = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${safeCompanyName}" style="width:40px;height:40px;border-radius:500px;object-fit:cover;" />`
      : `<span style="display:inline-flex;width:40px;height:40px;border-radius:12px;background:#01070D;color:#ffffff;align-items:center;justify-content:center;font-weight:600;font-size:16px;">${safeCompanyName.slice(0, 1)}</span>`;

    const finalSupportEmail = supportEmail ?? '';

    const html = `
      <!DOCTYPE html>
      <html lang="${htmlLang}">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${content.subject}</title>
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
                      <strong style="font-size:18px;">${content.greeting} ${expertFullName},</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#01070D;padding-bottom:16px;">
                      ${content.introMessage}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#01070D;padding-bottom:24px;">
                      ${content.instructionMessage}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #E5E7EB;">
                        <tr>
                          <td style="padding-top:24px;">
                            <strong style="font-size:16px;color:#01070D;display:block;margin-bottom:16px;">${content.projectDetailsTitle}</strong>
                            ${projectData.projectName ? `<div style="margin-bottom:12px;"><strong style="color:#6B7280;font-size:14px;">${content.projectNameLabel}:</strong> <span style="color:#01070D;font-size:14px;">${projectData.projectName}</span></div>` : ''}
                            <div style="margin-bottom:12px;"><strong style="color:#6B7280;font-size:14px;">${content.serviceNeededLabel}:</strong> <span style="color:#01070D;font-size:14px;">${projectData.serviceTitle}</span></div>
                            ${projectData.gapTitle ? `<div style="margin-bottom:12px;"><strong style="color:#6B7280;font-size:14px;">${content.gapToCompleteLabel}:</strong> <span style="color:#01070D;font-size:14px;">${projectData.gapTitle}</span></div>` : ''}
                            ${projectData.category && projectData.currentLevel ? `<div style="margin-bottom:12px;"><strong style="color:#6B7280;font-size:14px;">${content.categoryLevelLabel}:</strong> <span style="color:#01070D;font-size:14px;">${projectData.category} — Currently at Level ${projectData.currentLevel}</span></div>` : ''}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:24px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-top:1px solid #E5E7EB;">
                        <tr>
                          <td style="padding-top:24px;">
                            <strong style="font-size:16px;color:#01070D;display:block;margin-bottom:16px;">${content.clientInformationTitle}</strong>
                            ${clientData.company ? `<div style="margin-bottom:12px;"><strong style="color:#6B7280;font-size:14px;">${content.companyLabel}:</strong> <span style="color:#01070D;font-size:14px;">${clientData.company}</span></div>` : ''}
                            <div style="margin-bottom:12px;"><strong style="color:#6B7280;font-size:14px;">${content.nameLabel}:</strong> <span style="color:#01070D;font-size:14px;">${clientData.firstName} ${clientData.lastName}</span></div>
                            <div style="margin-bottom:12px;"><strong style="color:#6B7280;font-size:14px;">${content.emailLabel}:</strong> <span style="color:#01070D;font-size:14px;">${clientData.email}</span></div>
                            <div style="margin-bottom:12px;"><strong style="color:#6B7280;font-size:14px;">${content.phoneLabel}:</strong> <span style="color:#01070D;font-size:14px;">${clientData.phoneNumber}</span></div>
                            ${clientData.additionalInformation ? `<div style="margin-bottom:12px;"><strong style="color:#6B7280;font-size:14px;">${content.commentsLabel}:</strong> <span style="color:#01070D;font-size:14px;">${clientData.additionalInformation}</span></div>` : ''}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#01070D;padding-bottom:16px;">
                      ${content.additionalInfoMessage}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#01070D;padding-bottom:16px;">
                      ${content.alternativeProviderMessage}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:16px;line-height:26px;color:#01070D;padding-bottom:32px;">
                      ${content.questionsMessage} <a href="mailto:${finalSupportEmail}" style="color:#2563EB;text-decoration:underline;">${finalSupportEmail}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:22px;color:#9CA3AF;padding-top:24px;text-align:center;">
                ${content.footerMessage}
              </td>
            </tr>
            <tr>
              <td style="font-size:14px;line-height:22px;color:#01070D;padding-top:8px;text-align:center;font-weight:600;">
                ${content.maturoscopeLabel}
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: expertEmail,
      subject: content.subject,
      html,
    });
  }
}

