import { Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseMailService } from '../../common/mail/mail.service';
import { StructuredLoggerService } from '../../common/logger/structured-logger.service';
import { normalizeLanguage } from '../../common/i18n/languages';
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
  reportPdfBase64?: string;
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

  constructor(
    configService: ConfigService,
    structuredLogger: StructuredLoggerService,
  ) {
    super(configService, structuredLogger);
    this.maturoscopeLogoPath = path.join(process.cwd(), 'public', 'image', 'maturoscope-logo.png');
  }

  async onModuleInit() {
    await super.onModuleInit();
    try {
      if (!fs.existsSync(this.maturoscopeLogoPath)) {
        this.logger.warn('Maturoscope logo file not found', { path: this.maturoscopeLogoPath });
      }
    } catch (error) {
      this.logger.error('Error checking Maturoscope logo file', error);
    }
  }

  getEmailContent(language: string, companyName: string): EmailContent {
    const lang = normalizeLanguage(language);

    const translations: Record<string, EmailContent> = {
      en: {
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
      fr: {
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
      es: {
        subject: `Nuevo lead cualificado - ${companyName}`,
        greeting: 'Hola',
        introMessage:
          'Un nuevo <strong>lead cualificado</strong> ha solicitado tu experiencia a través de Maturoscope.',
        instructionMessage:
          'Un <strong>cliente potencial</strong> ha sido emparejado con tu servicio. Revisa los detalles a continuación y ponte en contacto para comenzar:',
        projectDetailsTitle: 'Detalles del proyecto',
        clientInformationTitle: 'Información del cliente',
        projectNameLabel: 'Nombre del proyecto',
        serviceNeededLabel: 'Servicio requerido',
        gapToCompleteLabel: 'BRECHA A COMPLETAR',
        highestPriorityLabel: 'Prioridad más alta',
        categoryLevelLabel: 'Categoría y nivel',
        currentlyAtLevel: 'Actualmente en el nivel',
        companyLabel: 'Organización',
        nameLabel: 'Nombre',
        emailLabel: 'Correo electrónico',
        phoneLabel: 'Teléfono',
        commentsLabel: 'Comentarios',
        reviewMessage:
          'Por favor, revisa el Informe de Madurez completo adjunto y contacta al cliente en un plazo de 3 días hábiles.',
        contactButtonText: 'Contactar al lead ahora',
        contactSubject: (projectName: string) => `${projectName} - Listos para ayudarte a avanzar`,
        emailSubjectPrefix: 'Nuevo lead de',
        reassignmentMessage: '¿No puedes tomar este lead? Habla y reasígnalo a:',
        reassignmentSubject: (companyName: string) => `Lead reasignado: ${companyName} necesita apoyo experto`,
        forwardAskLine: '¿Puedes tomar este lead? Te reenvío los detalles a continuación:',
        forwardProjectLabel: 'Proyecto',
        forwardServiceLabel: 'Servicio',
        forwardGapLabel: 'Brecha',
        forwardCategoryLevelLabel: 'Categoría y nivel',
        forwardClientLabel: 'Cliente',
        forwardClientEmailLabel: 'Correo del cliente',
        forwardClientPhoneLabel: 'Teléfono del cliente',
        forwardThanksLabel: 'Gracias',
        questionsMessage: '¿Preguntas? Contáctanos en',
        footerMessage: '¿No esperabas este correo? No te preocupes, simplemente ignóralo.',
      },
      it: {
        subject: `Nuovo lead qualificato - ${companyName}`,
        greeting: 'Ciao',
        introMessage:
          'Un nuovo <strong>lead qualificato</strong> ha richiesto la tua competenza tramite Maturoscope.',
        instructionMessage:
          'Un <strong>cliente potenziale</strong> è stato abbinato al tuo servizio. Controlla i dettagli qui sotto e mettiti in contatto per iniziare:',
        projectDetailsTitle: 'Dettagli del progetto',
        clientInformationTitle: 'Informazioni cliente',
        projectNameLabel: 'Nome del progetto',
        serviceNeededLabel: 'Servizio richiesto',
        gapToCompleteLabel: 'DIVARIO DA COLMARE',
        highestPriorityLabel: 'Priorità più alta',
        categoryLevelLabel: 'Categoria e livello',
        currentlyAtLevel: 'Attualmente al livello',
        companyLabel: 'Organizzazione',
        nameLabel: 'Nome',
        emailLabel: 'Email',
        phoneLabel: 'Telefono',
        commentsLabel: 'Commenti',
        reviewMessage:
          'Si prega di consultare il Report di Maturità completo allegato e di contattare il cliente entro 3 giorni lavorativi.',
        contactButtonText: 'Contatta il lead ora',
        contactSubject: (projectName: string) => `${projectName} - Pronti ad aiutarti ad andare avanti`,
        emailSubjectPrefix: 'Nuovo lead da',
        reassignmentMessage: 'Non puoi gestire questo lead? Parla e riassegnalo a:',
        reassignmentSubject: (companyName: string) => `Lead riassegnato: ${companyName} ha bisogno di supporto esperto`,
        forwardAskLine: 'Puoi gestire questo lead? Ti inoltro i dettagli qui sotto:',
        forwardProjectLabel: 'Progetto',
        forwardServiceLabel: 'Servizio',
        forwardGapLabel: 'Divario',
        forwardCategoryLevelLabel: 'Categoria e livello',
        forwardClientLabel: 'Cliente',
        forwardClientEmailLabel: 'Email cliente',
        forwardClientPhoneLabel: 'Telefono cliente',
        forwardThanksLabel: 'Grazie',
        questionsMessage: 'Domande? Contattaci a',
        footerMessage: 'Non ti aspettavi questa email? Nessun problema — ignorala pure.',
      },
      sl: {
        subject: `Nov kvalificiran potencialni kupec - ${companyName}`,
        greeting: 'Pozdravljeni',
        introMessage:
          'Nov <strong>kvalificiran potencialni kupec</strong> je prek Maturoscope zaprosil za vaše strokovno znanje.',
        instructionMessage:
          '<strong>Potencialni kupec</strong> je bil povezan z vašo storitvijo. Preglejte spodnje podrobnosti in stopite v stik za začetek:',
        projectDetailsTitle: 'Podrobnosti projekta',
        clientInformationTitle: 'Podatki o stranki',
        projectNameLabel: 'Ime projekta',
        serviceNeededLabel: 'Potrebna storitev',
        gapToCompleteLabel: 'VRZEL ZA ZAPOLNITEV',
        highestPriorityLabel: 'Najvišja prioriteta',
        categoryLevelLabel: 'Kategorija in raven',
        currentlyAtLevel: 'Trenutno na ravni',
        companyLabel: 'Organizacija',
        nameLabel: 'Ime',
        emailLabel: 'E-pošta',
        phoneLabel: 'Telefon',
        commentsLabel: 'Komentarji',
        reviewMessage:
          'Prosimo, preglejte priloženo celotno poročilo o zrelosti in stopite v stik s stranko v 3 delovnih dneh.',
        contactButtonText: 'Kontaktiraj zdaj',
        contactSubject: (projectName: string) => `${projectName} - Pripravljeni vam pomagati naprej`,
        emailSubjectPrefix: 'Nov lead od',
        reassignmentMessage: 'Ne morete prevzeti tega leada? Pogovorite se in ga dodelite:',
        reassignmentSubject: (companyName: string) => `Predodeljen lead: ${companyName} potrebuje strokovno podporo`,
        forwardAskLine: 'Lahko prevzamete ta lead? Spodaj vam posredujem podrobnosti:',
        forwardProjectLabel: 'Projekt',
        forwardServiceLabel: 'Storitev',
        forwardGapLabel: 'Vrzel',
        forwardCategoryLevelLabel: 'Kategorija in raven',
        forwardClientLabel: 'Stranka',
        forwardClientEmailLabel: 'E-pošta stranke',
        forwardClientPhoneLabel: 'Telefon stranke',
        forwardThanksLabel: 'Hvala',
        questionsMessage: 'Vprašanja? Pišite nam na',
        footerMessage: 'Niste pričakovali te e-pošte? Brez skrbi — preprosto jo prezrite.',
      },
      el: {
        subject: `Νέο ποιοτικό lead - ${companyName}`,
        greeting: 'Γεια',
        introMessage:
          'Ένα νέο <strong>ποιοτικό lead</strong> ζήτησε την εξειδίκευσή σας μέσω του Maturoscope.',
        instructionMessage:
          'Ένας <strong>δυνητικός πελάτης</strong> αντιστοιχίστηκε με την υπηρεσία σας. Δείτε τις παρακάτω λεπτομέρειες και επικοινωνήστε για να ξεκινήσετε:',
        projectDetailsTitle: 'Λεπτομέρειες έργου',
        clientInformationTitle: 'Στοιχεία πελάτη',
        projectNameLabel: 'Όνομα έργου',
        serviceNeededLabel: 'Απαιτούμενη υπηρεσία',
        gapToCompleteLabel: 'ΚΕΝΟ ΠΡΟΣ ΚΑΛΥΨΗ',
        highestPriorityLabel: 'Υψηλότερη προτεραιότητα',
        categoryLevelLabel: 'Κατηγορία και επίπεδο',
        currentlyAtLevel: 'Αυτήν τη στιγμή στο επίπεδο',
        companyLabel: 'Οργανισμός',
        nameLabel: 'Όνομα',
        emailLabel: 'Email',
        phoneLabel: 'Τηλέφωνο',
        commentsLabel: 'Σχόλια',
        reviewMessage:
          'Παρακαλούμε ελέγξτε την επισυναπτόμενη πλήρη Αναφορά Ωριμότητας και επικοινωνήστε με τον πελάτη εντός 3 εργάσιμων ημερών.',
        contactButtonText: 'Επικοινωνήστε τώρα',
        contactSubject: (projectName: string) => `${projectName} - Έτοιμοι να σας βοηθήσουμε να προχωρήσετε`,
        emailSubjectPrefix: 'Νέο lead από',
        reassignmentMessage: 'Δεν μπορείτε να αναλάβετε αυτό το lead; Μιλήστε και αναθέστε το ξανά σε:',
        reassignmentSubject: (companyName: string) => `Επαναανάθεση lead: ${companyName} χρειάζεται εξειδικευμένη υποστήριξη`,
        forwardAskLine: 'Μπορείτε να αναλάβετε αυτό το lead; Σας προωθώ τις λεπτομέρειες παρακάτω:',
        forwardProjectLabel: 'Έργο',
        forwardServiceLabel: 'Υπηρεσία',
        forwardGapLabel: 'Κενό',
        forwardCategoryLevelLabel: 'Κατηγορία και επίπεδο',
        forwardClientLabel: 'Πελάτης',
        forwardClientEmailLabel: 'Email πελάτη',
        forwardClientPhoneLabel: 'Τηλέφωνο πελάτη',
        forwardThanksLabel: 'Ευχαριστώ',
        questionsMessage: 'Ερωτήσεις; Επικοινωνήστε στο',
        footerMessage: 'Δεν περιμένατε αυτό το email; Μην ανησυχείτε — απλώς αγνοήστε το.',
      },
    };

    return translations[lang] ?? translations.en;
  }

  async sendServiceContactEmail({
    expertEmail,
    expertFirstName,
    expertLastName,
    companyName,
    companyLogoUrl,
    supportEmail,
    language = 'EN',
    reassignmentContact,
    clientData,
    projectData,
    reportPdfBase64,
  }: ServiceContactEmailPayload) {
    const safeCompanyName =
      companyName ||
      this.configService.get<string>('APP_NAME') ||
      'Maturoscope';
    const content = this.getEmailContent(language, safeCompanyName);

    const expertFullName = `${expertFirstName || ''} ${expertLastName || ''}`.trim() || 'Expert';
    const htmlLang = normalizeLanguage(language);
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

    // Attach the maturity report PDF if provided
    if (reportPdfBase64) {
      attachments.push({
        filename: 'maturity-report.pdf',
        content: Buffer.from(reportPdfBase64, 'base64'),
        contentType: 'application/pdf',
      });
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

    await this.sendEmail({
      to: expertEmail,
      subject: content.subject,
      html,
      attachments,
    });
  }
}

