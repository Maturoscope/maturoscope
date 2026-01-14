import { Injectable, Logger, type OnModuleInit, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseMailService } from '../../common/mail/mail.service';
import { ReportCacheService } from '../report/report-cache.service';
import * as path from 'path';
import * as fs from 'fs';
import * as ejs from 'ejs';
import * as nodemailer from 'nodemailer';

interface ServiceContactEmailPayload {
  expertEmail: string;
  expertFirstName: string;
  expertLastName: string;
  companyName: string;
  companyLogoUrl?: string;
  supportEmail?: string;
  language?: string;
  pdfCacheId?: string; // Optional PDF cache ID to attach
  reassignmentContact?: {
    name: string;
    email: string;
  };
  clientData: {
    company?: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    additionalInformation?: string;
  };
  projectData: {
    projectName?: string;
    serviceTitle: string;
    serviceDescription?: string;
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
  highestPriorityLabel: string;
  categoryLevelLabel: string;
  currentlyAtLevel: string;
  companyLabel: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  commentsLabel: string;
  reviewMessage: string;
  contactButtonText: string;
  contactSubject: (projectName: string) => string;
  emailSubjectPrefix: string;
  reassignmentMessage: string;
  reassignmentSubject: (companyName: string) => string;
  forwardAskLine: string;
  forwardProjectLabel: string;
  forwardServiceLabel: string;
  forwardGapLabel: string;
  forwardCategoryLevelLabel: string;
  forwardClientLabel: string;
  forwardClientEmailLabel: string;
  forwardClientPhoneLabel: string;
  forwardThanksLabel: string;
  questionsMessage: string;
  footerMessage: string;
}

@Injectable()
export class ServiceContactMailService extends BaseMailService implements OnModuleInit {
  protected maturoscopeLogoPath: string;
  private readonly logger = new Logger(ServiceContactMailService.name);

  constructor(
    configService: ConfigService,
    @Optional() @Inject(ReportCacheService) private readonly reportCacheService: ReportCacheService | null,
  ) {
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
        subject: `New Qualified Lead - ${companyName}`,
        greeting: 'Hi',
        introMessage:
          'A new <strong>qualified lead</strong> has requested your expertise through Maturoscope.',
        instructionMessage:
          'A <strong>potential client</strong> has been matched with your service. Review the details below and reach out to get started:',
        projectDetailsTitle: 'Project details',
        clientInformationTitle: 'Client Information',
        projectNameLabel: 'Project name',
        serviceNeededLabel: 'Service needed',
        gapToCompleteLabel: 'GAP TO COMPLETE',
        highestPriorityLabel: 'Highest Priority',
        categoryLevelLabel: 'Category & level',
        currentlyAtLevel: 'Currently at Level',
        companyLabel: 'Organization',
        nameLabel: 'Name',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        commentsLabel: 'Comments',
        reviewMessage:
          'Please review the attached Full Maturity Report and contact the client within 3 working days.',
        contactButtonText: 'Contact Lead Now',
        contactSubject: (projectName: string) => `${projectName} - Ready to help you move forward`,
        emailSubjectPrefix: 'New Lead from',
        reassignmentMessage: 'Can\'t take this lead? Talk and reassign to:',
        reassignmentSubject: (companyName: string) => `Reassigned Lead: ${companyName} needs expert support`,
        forwardAskLine: 'Can you take this lead? I\'m forwarding you the details below:',
        forwardProjectLabel: 'Project',
        forwardServiceLabel: 'Service',
        forwardGapLabel: 'Gap',
        forwardCategoryLevelLabel: 'Category & level',
        forwardClientLabel: 'Client',
        forwardClientEmailLabel: 'Client email',
        forwardClientPhoneLabel: 'Client phone',
        forwardThanksLabel: 'Thanks',
        questionsMessage: 'Questions? Contact us at',
        footerMessage: 'Didn\'t expect this email? No worries — just ignore it.',
      },
      FR: {
        subject: `Nouveau lead qualifié - ${companyName}`,
        greeting: 'Bonjour',
        introMessage:
          'Un nouveau <strong>lead qualifié</strong> a demandé votre expertise via Maturoscope.',
        instructionMessage:
          'Un <strong>client potentiel</strong> a été mis en relation avec votre service. Consultez les détails ci-dessous et contactez-nous pour commencer :',
        projectDetailsTitle: 'Détails du projet',
        clientInformationTitle: 'Informations client',
        projectNameLabel: 'Nom du projet',
        serviceNeededLabel: 'Service requis',
        gapToCompleteLabel: 'ÉCART À COMBLER',
        highestPriorityLabel: 'Priorité la plus élevée',
        categoryLevelLabel: 'Catégorie et niveau',
        currentlyAtLevel: 'Actuellement au niveau',
        companyLabel: 'Organisation',
        nameLabel: 'Nom',
        emailLabel: 'E-mail',
        phoneLabel: 'Téléphone',
        commentsLabel: 'Commentaires',
        reviewMessage:
          'Veuillez consulter le rapport de maturité complet joint et contacter le client dans les 3 jours ouvrés.',
        contactButtonText: 'Contacter le lead maintenant',
        contactSubject: (projectName: string) => `${projectName} - Prêt à vous aider à avancer`,
        emailSubjectPrefix: 'Nouveau lead de',
        reassignmentMessage: 'Vous ne pouvez pas prendre ce lead ? Parlez et réassignez à :',
        reassignmentSubject: (companyName: string) => `Lead réassigné : ${companyName} a besoin d'un soutien expert`,
        forwardAskLine: 'Pouvez-vous prendre ce lead ? Je vous transfère les détails ci-dessous :',
        forwardProjectLabel: 'Projet',
        forwardServiceLabel: 'Service',
        forwardGapLabel: 'Écart',
        forwardCategoryLevelLabel: 'Catégorie et niveau',
        forwardClientLabel: 'Client',
        forwardClientEmailLabel: 'E-mail client',
        forwardClientPhoneLabel: 'Téléphone client',
        forwardThanksLabel: 'Merci',
        questionsMessage: 'Des questions ? Contactez-nous à',
        footerMessage: 'Vous n\'attendiez pas cet e-mail ? Pas de souci — ignorez-le simplement.',
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
    pdfCacheId,
    reassignmentContact,
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
    const clientFullName = `${clientData.firstName} ${clientData.lastName}`;

    // Prepare company logo HTML
    const companyLogoHtml = companyLogoUrl
      ? `<img src="${companyLogoUrl}" alt="${safeCompanyName}" style="width:40px;height:40px;border-radius:500px;object-fit:cover;" />`
      : `<span style="display:inline-flex;width:40px;height:40px;border-radius:12px;background:#01070D;color:#ffffff;align-items:center;justify-content:center;font-weight:600;font-size:16px;">${safeCompanyName.slice(0, 1)}</span>`;

    // Prepare Maturoscope logo
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
      this.logger.warn(`Maturoscope logo file not found at: ${this.maturoscopeLogoPath}`);
    }

    // Attach cached PDF if available
    if (pdfCacheId && this.reportCacheService) {
      try {
        this.logger.log(`[PERFORMANCE] Starting to fetch PDF from cache: ${pdfCacheId}`);
        const startTime = Date.now();
        const pdfBuffer = await this.reportCacheService.getCachedPdf(pdfCacheId);
        const fetchTime = Date.now() - startTime;
        this.logger.log(`[PERFORMANCE] PDF fetched from cache in ${fetchTime}ms`);
        
        attachments.push({
          filename: `${projectData.projectName || 'maturity-report'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        });
        this.logger.log(`Attached PDF from cache: ${pdfCacheId} (size: ${pdfBuffer?.length || 0} bytes)`);
      } catch (error) {
        this.logger.warn(`Could not attach PDF from cache ${pdfCacheId}:`, error);
      }
    } else if (pdfCacheId && !this.reportCacheService) {
      this.logger.warn(`PDF cache ID provided but ReportCacheService not available!`);
    }

    const finalSupportEmail = supportEmail || this.configService.get<string>('SUPPORT_EMAIL') || 'support@maturoscope.com';

    // Build instruction message with client name and service name
    const instructionMessage = content.instructionMessage;

    // Build contact subject for "Contact Lead Now" button
    const contactSubject = content.contactSubject(projectData.projectName || projectData.serviceTitle);

    // Mailto for reassignment (cannot truly "forward" an email via mailto, but we can prefill subject/body)
    const reassignmentMailto = reassignmentContact
      ? (() => {
          // Use client company name or project name as fallback
          const companyNameForSubject = clientData.company || projectData.projectName || 'Client';
          const subject = content.reassignmentSubject(companyNameForSubject);
          // NOTE: keep empty strings to preserve blank lines in the composed email body.
          // Use `null` for optional lines we want to omit.
          const bodyLines: Array<string | null> = [
            `${content.greeting} ${reassignmentContact.name},`,
            '',
            '', // extra blank line after "Hi ..."
            content.forwardAskLine,
            '',
            '', // extra blank line after "details below:"
            `${content.forwardProjectLabel}: ${projectData.projectName || projectData.serviceTitle}`,
            `${content.forwardServiceLabel}: ${projectData.serviceTitle}`,
            projectData.gapTitle ? `${content.forwardGapLabel}: ${projectData.gapTitle}` : null,
            projectData.category && projectData.currentLevel
              ? `${content.forwardCategoryLevelLabel}: ${projectData.category} — ${content.currentlyAtLevel} ${projectData.currentLevel}`
              : null,
            '',
            '', // extra blank line after "Category & level ..."
            `${content.forwardClientLabel}: ${clientFullName}`,
            `${content.forwardClientEmailLabel}: ${clientData.email}`,
            clientData.phoneNumber ? `${content.forwardClientPhoneLabel}: ${clientData.phoneNumber}` : null,
            '',
            '', // extra blank line after client phone
            `${content.forwardThanksLabel},`,
            `${expertFullName}`,
          ];
          const body = bodyLines.filter((line): line is string => line !== null).join('\n');
          return `mailto:${reassignmentContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        })()
      : '';

    // Load and render the EJS template
    const templatePath = path.join(__dirname, 'templates', 'email', 'service-contact.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, {
      htmlLang,
      content: {
        ...content,
        instructionMessage,
        contactSubject,
      },
      expertFullName,
      companyName: safeCompanyName,
      companyLogoHtml,
      supportEmail: finalSupportEmail,
      reassignmentContact,
      reassignmentMailto,
      clientData,
      projectData,
      maturoscopeSignature,
    });

    this.logger.log(`[PERFORMANCE] Starting to send email to: ${expertEmail}`);
    const emailStartTime = Date.now();
    
    await this.sendEmail({
      to: expertEmail,
      subject: content.subject,
      html,
      attachments,
    });
    
    const emailTime = Date.now() - emailStartTime;
    this.logger.log(`[PERFORMANCE] Email sent successfully in ${emailTime}ms`);
  }
}

