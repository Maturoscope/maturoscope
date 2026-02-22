import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceGapCoverage } from './entities';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceResponseDto,
  ServiceSummaryDto,
  RecommendedServiceDto,
  ContactServicesDto,
} from './dto';
import { ReadinessAssessmentService } from '../readiness-assessment/readiness-assessment.service';
import { ScaleType, RecommendedServiceDto as ReadinessRecommendedServiceDto, I18nText } from '../readiness-assessment/dto/readiness-assessment.dto';
import { ServiceContactMailService } from './mail.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { StatisticsService } from '../statistics/statistics.service';
import { StructuredLoggerService } from '../../common/logger/structured-logger.service';

@Injectable()
export class ServicesService {
  private readinessAssessmentService: ReadinessAssessmentService;
  private readonly logger: StructuredLoggerService;

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceGapCoverage)
    private readonly coverageRepository: Repository<ServiceGapCoverage>,
    @Inject(forwardRef(() => ReadinessAssessmentService))
    readinessAssessmentService: ReadinessAssessmentService,
    private readonly serviceContactMailService: ServiceContactMailService,
    private readonly organizationsService: OrganizationsService,
    private readonly statisticsService: StatisticsService,
    structuredLogger: StructuredLoggerService,
  ) {
    this.readinessAssessmentService = readinessAssessmentService;
    this.logger = structuredLogger.child('ServicesService');
  }

  /**
   * Create a new service
   */
  async create(
    organizationId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    const existingService = await this.serviceRepository.findOne({
      where: {
        organizationId,
        nameEn: createServiceDto.nameEn,
      },
    });

    if (existingService) {
      throw new ConflictException(
        `A service with the name "${createServiceDto.nameEn}" already exists in this organization`,
      );
    }

    // Validate at least one gap coverage
    if (!createServiceDto.gapCoverages || createServiceDto.gapCoverages.length === 0) {
      throw new BadRequestException(
        'At least one gap coverage (category) must be selected',
      );
    }

    // Create service
    const service = this.serviceRepository.create({
      organizationId,
      name: createServiceDto.name || createServiceDto.nameEn,   
      nameEn: createServiceDto.nameEn,
      nameFr: createServiceDto.nameFr,
      description: createServiceDto.description || createServiceDto.descriptionEn,
      descriptionEn: createServiceDto.descriptionEn,
      descriptionFr: createServiceDto.descriptionFr,
      url: createServiceDto.url,
      mainContactFirstName: createServiceDto.mainContactFirstName,
      mainContactLastName: createServiceDto.mainContactLastName,
      mainContactEmail: createServiceDto.mainContactEmail,
      secondaryContactFirstName: createServiceDto.secondaryContactFirstName,
      secondaryContactLastName: createServiceDto.secondaryContactLastName,
      secondaryContactEmail: createServiceDto.secondaryContactEmail,
    });

    const savedService = await this.serviceRepository.save(service);

    // Create gap coverages
    const coverages = createServiceDto.gapCoverages.map((coverage) =>
      this.coverageRepository.create({
        serviceId: savedService.id,
        questionId: coverage.questionId,
        level: coverage.level,
        scaleType: coverage.scaleType,
      }),
    );

    const savedCoverages = await this.coverageRepository.save(coverages);

    return this.mapToResponseDto(savedService, savedCoverages);
  }

  /**
   * Find all services for an organization
   */
  async findAll(organizationId: string): Promise<ServiceSummaryDto[]> {
    const services = await this.serviceRepository.find({
      where: { organizationId },
      relations: ['gapCoverages'],
      order: { createdAt: 'DESC' },
    });

    return services.map((service) => this.mapToSummaryDto(service));
  }

  /**
   * Find one service by ID
   */
  async findOne(
    organizationId: string,
    id: string,
  ): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id, organizationId },
      relations: ['gapCoverages'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    return this.mapToResponseDto(service, service.gapCoverages);
  }

  /**
   * Update a service
   */
  async update(
    organizationId: string,
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const service = await this.serviceRepository.findOne({
      where: { id, organizationId },
      relations: ['gapCoverages'],
    });

    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    if (updateServiceDto.nameEn && updateServiceDto.nameEn !== service.nameEn) {
      const existingService = await this.serviceRepository.findOne({
        where: {
          organizationId,
          nameEn: updateServiceDto.nameEn,
        },
      });

      if (existingService) {
        throw new ConflictException(
          `A service with the name "${updateServiceDto.nameEn}" already exists in this organization`,
        );
      }
    }

    // Update service fields
    const updatedNameEn = updateServiceDto.nameEn !== undefined ? updateServiceDto.nameEn : service.nameEn;
    const updatedDescriptionEn = updateServiceDto.descriptionEn !== undefined ? updateServiceDto.descriptionEn : service.descriptionEn;

    Object.assign(service, {
      ...(updateServiceDto.name ? { name: updateServiceDto.name } : { name: updatedNameEn }),
      ...(updateServiceDto.nameEn !== undefined && { nameEn: updateServiceDto.nameEn }),
      ...(updateServiceDto.nameFr !== undefined && { nameFr: updateServiceDto.nameFr }),
      ...(updateServiceDto.description ? {
        description: updateServiceDto.description,
      } : { description: updatedDescriptionEn }),
      ...(updateServiceDto.descriptionEn !== undefined && { descriptionEn: updateServiceDto.descriptionEn }),
      ...(updateServiceDto.descriptionFr !== undefined && { descriptionFr: updateServiceDto.descriptionFr }),
      ...(updateServiceDto.url && { url: updateServiceDto.url }),
      ...(updateServiceDto.mainContactFirstName && {
        mainContactFirstName: updateServiceDto.mainContactFirstName,
      }),
      ...(updateServiceDto.mainContactLastName && {
        mainContactLastName: updateServiceDto.mainContactLastName,
      }),
      ...(updateServiceDto.mainContactEmail && {
        mainContactEmail: updateServiceDto.mainContactEmail,
      }),
      ...(updateServiceDto.secondaryContactFirstName && {
        secondaryContactFirstName: updateServiceDto.secondaryContactFirstName,
      }),
      ...(updateServiceDto.secondaryContactLastName && {
        secondaryContactLastName: updateServiceDto.secondaryContactLastName,
      }),
      ...(updateServiceDto.secondaryContactEmail && {
        secondaryContactEmail: updateServiceDto.secondaryContactEmail,
      }),
    });

    const updatedService = await this.serviceRepository.save(service);

    // Update gap coverages if provided
    if (updateServiceDto.gapCoverages) {
      if (updateServiceDto.gapCoverages.length === 0) {
        throw new BadRequestException(
          'At least one gap coverage (category) must be selected',
        );
      }

      // Delete existing coverages
      await this.coverageRepository.delete({ serviceId: id });

      // Create new coverages
      const coverages = updateServiceDto.gapCoverages.map((coverage) =>
        this.coverageRepository.create({
          serviceId: id,
          questionId: coverage.questionId,
          level: coverage.level,
          scaleType: coverage.scaleType,
        }),
      );

      const savedCoverages = await this.coverageRepository.save(coverages);
      return this.mapToResponseDto(updatedService, savedCoverages);
    }

    const coverages = await this.coverageRepository.find({
      where: { serviceId: id },
    });

    return this.mapToResponseDto(updatedService, coverages);
  }

  /**
   * Delete a service
   */
  async remove(organizationId: string, id: string): Promise<void> {
    const service = await this.serviceRepository.findOne({
      where: { id, organizationId },
    });

    if (!service) {
      throw new NotFoundException(`Service with ID "${id}" not found`);
    }

    await this.serviceRepository.remove(service);
  }

  /**
   * Find services that cover specific gaps
   */
  async findServicesForGaps(
    organizationId: string,
    gaps: Array<{ questionId: string; level: number }>,
  ): Promise<Map<string, ReadinessRecommendedServiceDto[]>> {
    const gapServiceMap = new Map<string, ReadinessRecommendedServiceDto[]>();

    for (const gap of gaps) {
      const gapKey = `${gap.questionId}_${gap.level}`;

      // Find coverages matching this gap
      const coverages = await this.coverageRepository.find({
        where: {
          questionId: gap.questionId,
          level: gap.level,
        },
        relations: ['service'],
      });

      // Filter by organization and map to DTO with I18nText structure
      const services = coverages
        .filter((coverage) => coverage.service.organizationId === organizationId)
        .map((coverage) => this.mapToReadinessRecommendedServiceDto(coverage.service));

      // Remove duplicates
      const uniqueServices = Array.from(
        new Map(services.map((s) => [s.id, s])).values(),
      );

      gapServiceMap.set(gapKey, uniqueServices);
    }

    return gapServiceMap;
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(
    service: Service,
    coverages: ServiceGapCoverage[],
  ): ServiceResponseDto {
    return {
      id: service.id,
      organizationId: service.organizationId,
      name: service.name,
      nameEn: service.nameEn,
      nameFr: service.nameFr,
      description: service.description,
      descriptionEn: service.descriptionEn,
      descriptionFr: service.descriptionFr,
      url: service.url,
      mainContactFirstName: service.mainContactFirstName,
      mainContactLastName: service.mainContactLastName,
      mainContactEmail: service.mainContactEmail,
      secondaryContactFirstName: service.secondaryContactFirstName,
      secondaryContactLastName: service.secondaryContactLastName,
      secondaryContactEmail: service.secondaryContactEmail,
      gapCoverages: coverages.map((coverage) => ({
        questionId: coverage.questionId,
        level: coverage.level,
        scaleType: coverage.scaleType,
      })),
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }

  /**
   * Map entity to summary DTO
   */
  private mapToSummaryDto(service: Service): ServiceSummaryDto {
    // Group coverages by scale type
    const scalesMap = new Map<string, Set<number>>();

    service.gapCoverages?.forEach((coverage) => {
      if (!scalesMap.has(coverage.scaleType)) {
        scalesMap.set(coverage.scaleType, new Set());
      }
      scalesMap.get(coverage.scaleType)!.add(coverage.level);
    });

    const scales = Array.from(scalesMap.entries()).map(([type, levels]) => ({
      type: type as ScaleType,
      levels: Array.from(levels).sort((a, b) => a - b),
    }));

    return {
      id: service.id,
      name: service.name,
      nameEn: service.nameEn,
      nameFr: service.nameFr,
      description: service.description,
      descriptionEn: service.descriptionEn,
      descriptionFr: service.descriptionFr,
      url: service.url,
      mainContact: {
        firstName: service.mainContactFirstName,
        lastName: service.mainContactLastName,
        email: service.mainContactEmail,
      },
      secondaryContact: {
        firstName: service.secondaryContactFirstName,
        lastName: service.secondaryContactLastName,
        email: service.secondaryContactEmail,
      },
      scales,
    };
  }

  /**
   * Map entity to recommended service DTO (for readiness-assessment with I18nText structure)
   */
  private mapToReadinessRecommendedServiceDto(service: Service): ReadinessRecommendedServiceDto {
    return {
      id: service.id,
      name: {
        en: service.nameEn,
        fr: service.nameFr,
      } as I18nText,
      description: {
        en: service.descriptionEn,
        fr: service.descriptionFr,
      } as I18nText,
      url: service.url,
      mainContact: {
        firstName: service.mainContactFirstName,
        lastName: service.mainContactLastName,
        email: service.mainContactEmail,
      },
      secondaryContact: {
        firstName: service.secondaryContactFirstName,
        lastName: service.secondaryContactLastName,
        email: service.secondaryContactEmail,
      },
    };
  }

  /**
   * Map entity to recommended service DTO (for services module)
   */
  private mapToRecommendedServiceDto(service: Service): RecommendedServiceDto {
    return {
      id: service.id,
      name: service.name || service.nameEn,
      nameEn: service.nameEn,
      nameFr: service.nameFr,
      description: service.description || service.descriptionEn,
      descriptionEn: service.descriptionEn,
      descriptionFr: service.descriptionFr,
      url: service.url,
      mainContact: {
        firstName: service.mainContactFirstName,
        lastName: service.mainContactLastName,
        email: service.mainContactEmail,
      },
      secondaryContact: {
        firstName: service.secondaryContactFirstName,
        lastName: service.secondaryContactLastName,
        email: service.secondaryContactEmail,
      },
    };
  }

  /**
   * Get service satisfaction options from assessment data
   */
  async getServiceSatisfactionOptions(): Promise<
    Record<string, Record<string, { en: string; fr: string }>>
  > {
    return this.readinessAssessmentService['assessmentData']
      .serviceSatisfactionOptions;
  }

  /**
   * Get scale type from question ID (e.g., "TRL_Q1" -> "TRL")
   */
  private getScaleTypeFromQuestionId(questionId: string): ScaleType {
    const prefix = questionId.split('_')[0];
    if (prefix === 'TRL') return ScaleType.TRL;
    if (prefix === 'MkRL') return ScaleType.MkRL;
    if (prefix === 'MfRL') return ScaleType.MfRL;
    throw new BadRequestException(`Invalid questionId format: ${questionId}`);
  }

  /**
   * Contact services - send emails to all contacts of specified services
   */
  async contactServices(
    organizationKey: string,
    contactServicesDto: ContactServicesDto,
  ): Promise<{ message: string; emailsSent: number }> {
    // Get organization by key
    const organization = await this.organizationsService.findByKey(organizationKey);
    const companyName = organization.name || 'Maturoscope';
    const companyLogoUrl = organization.avatar || undefined;
    const organizationLanguage = organization.language?.toUpperCase() === 'FR' ? 'FR' : 'EN';
    const supportEmail = organization.email || undefined;

    // Collect all unique service IDs from all gaps
    const allServiceIds = new Set<string>();
    contactServicesDto.gaps.forEach((gap) => {
      gap.recommendedServices.forEach((serviceId) => {
        allServiceIds.add(serviceId);
      });
    });

    // Get all services by IDs
    const services = await this.serviceRepository.find({
      where: Array.from(allServiceIds).map((id) => ({ id })),
    });

    if (services.length === 0) {
      throw new NotFoundException('No services found with the provided IDs');
    }

    // Create a map of service ID to service for quick lookup
    const serviceMap = new Map<string, Service>();
    services.forEach((service) => {
      serviceMap.set(service.id, service);
    });

    // Group gaps by service first, then by category within each service
    // This ensures we send ONE email per service with all categories grouped
    // Key: serviceId, Value: Map of category -> gaps
    const gapsByService = new Map<string, Map<string, Array<{ questionId: string; level: number }>>>();

    for (const gap of contactServicesDto.gaps) {
      for (const serviceId of gap.recommendedServices) {
        const scaleType = this.getScaleTypeFromQuestionId(gap.questionId);
        
        if (!gapsByService.has(serviceId)) {
          gapsByService.set(serviceId, new Map());
        }
        
        const categoriesMap = gapsByService.get(serviceId)!;
        if (!categoriesMap.has(scaleType)) {
          categoriesMap.set(scaleType, []);
        }
        
        categoriesMap.get(scaleType)!.push({
          questionId: gap.questionId,
          level: gap.level,
        });
      }
    }

    // Process each service and send ONE email per contact with all categories
    const emailPromises: Promise<void>[] = [];

    for (const [serviceId, categoriesMap] of gapsByService.entries()) {
      const service = serviceMap.get(serviceId);
      if (!service) {
        continue; // Skip if service not found
      }

      // Get service name and description based on organization language
      const serviceName = organizationLanguage === 'FR' ? service.nameFr : service.nameEn;
      const serviceDescription = organizationLanguage === 'FR' ? service.descriptionFr : service.descriptionEn;

      // Convert categories map to array and sort by level (lowest first)
      const categoriesArray = Array.from(categoriesMap.entries()).map(([category, gaps]) => ({
        category,
        gaps,
        level: gaps[0].level, // Use first gap's level for this category
      }));

      // Sort by level (ascending) to show lowest level first
      categoriesArray.sort((a, b) => a.level - b.level);

      // Find the minimum level to determine which category gets "Highest Priority" badge
      const minLevel = Math.min(...categoriesArray.map(cat => cat.level));
      const categoriesWithMinLevel = categoriesArray.filter(cat => cat.level === minLevel);

      // Build HTML for all categories
      const categoriesHtml: string[] = [];

      for (const categoryData of categoriesArray) {
        const { category, gaps, level } = categoryData;
        const isHighestPriority = categoriesWithMinLevel.length === 1 && level === minLevel;

        // Build gap titles for this category
        const gapTitles = gaps.map((gap) => {
          const description = this.readinessAssessmentService.getGapDescription(
            gap.questionId,
            gap.level,
            category as ScaleType,
            organizationLanguage,
          );
          return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom: 8px; width: 100%;">
            <tr>
              <td style="width: 12px; vertical-align: top; padding-right: 8px; line-height: 20px;">•</td>
              <td style="vertical-align: top; line-height: 20px;">${description}</td>
            </tr>
          </table>`;
        });

        const gapsHtml = gapTitles.join('');

        // Build category section HTML
        const categoryHtml = `
          <!-- CATEGORY & LEVEL -->
          <div style="border-top: 1px solid #E5E7EB; padding: 18px 0 0 0;">
            <div style="color: #737373; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;">Category & Level</div>
            <div style="color: #0A0A0A; font-size: 14px; font-weight: 600; line-height: 20px;">${category} — Currently at Level ${level}</div>
          </div>

          <!-- GAP TO COMPLETE + BADGE -->
          <div style="padding: 18px 0 0 0;">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="color: #737373; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; vertical-align: middle; padding-right: 10px;">
                  GAP TO COMPLETE
                </td>
                ${isHighestPriority ? `
                <td style="vertical-align: middle;">
                  <span style="display: inline-block; background: #171717; color: #ffffff; border-radius: 9999px; padding: 6px 12px; font-size: 12px; font-weight: 600; line-height: 1;">Highest Priority</span>
                </td>
                ` : ''}
              </tr>
            </table>
            <div style="margin-top: 10px; color: #0A0A0A; font-size: 14px; font-weight: 600; line-height: 20px;">${gapsHtml}</div>
          </div>
        `;

        categoriesHtml.push(categoryHtml);
      }

      // Join all categories HTML
      const allCategoriesHtml = categoriesHtml.join('');

      // Collect contacts for this service (deduplicate by email)
      // Using a Map ensures we only send one email per unique email address
      const contactsMap = new Map<string, { email: string; firstName: string; lastName: string }>();

      if (service.mainContactEmail) {
        contactsMap.set(service.mainContactEmail.toLowerCase(), {
          email: service.mainContactEmail,
          firstName: service.mainContactFirstName,
          lastName: service.mainContactLastName,
        });
      }

      if (service.secondaryContactEmail) {
        // Only add secondary contact if email is different from main contact
        const secondaryEmailKey = service.secondaryContactEmail.toLowerCase();
        if (!contactsMap.has(secondaryEmailKey)) {
          contactsMap.set(secondaryEmailKey, {
            email: service.secondaryContactEmail,
            firstName: service.secondaryContactFirstName,
            lastName: service.secondaryContactLastName,
          });
        }
      }

      // Convert map to array
      const contacts = Array.from(contactsMap.values());

      // Send ONE email to each unique contact (not one per gap)
      for (const contact of contacts) {
        // Reassignment contact must be the service secondary contact (per design)
        // Only show it when:
        // 1. Secondary contact exists
        // 2. Secondary contact email is different from main contact email
        // 3. Current recipient is NOT the secondary contact (avoid self-reassign link)
        let reassignmentContact: { name: string; email: string } | undefined;
        if (
          service.secondaryContactEmail &&
          service.mainContactEmail &&
          service.secondaryContactEmail.toLowerCase() !== service.mainContactEmail.toLowerCase() &&
          contact.email.toLowerCase() !== service.secondaryContactEmail.toLowerCase()
        ) {
          reassignmentContact = {
            name: `${service.secondaryContactFirstName} ${service.secondaryContactLastName}`.trim(),
            email: service.secondaryContactEmail,
          };
        }

        emailPromises.push(
          this.serviceContactMailService.sendServiceContactEmail({
            expertEmail: contact.email,
            expertFirstName: contact.firstName,
            expertLastName: contact.lastName,
            companyName,
            companyLogoUrl,
            supportEmail,
            language: organizationLanguage,
            reassignmentContact,
            clientData: {
              company: contactServicesDto.organization || contactServicesDto.company,
              firstName: contactServicesDto.firstName,
              lastName: contactServicesDto.lastName,
              email: contactServicesDto.email,
              phoneNumber: contactServicesDto.phoneNumber,
              additionalInformation: contactServicesDto.additionalInformation,
            },
            projectData: {
              projectName: contactServicesDto.projectName,
              serviceTitle: serviceName,
              serviceDescription: serviceDescription,
              gapTitle: allCategoriesHtml,
              // Don't set category and currentLevel when we have multiple categories
              // The HTML already includes all category information
            },
            reportPdfBase64: contactServicesDto.reportPdfBase64,
          }),
        );
      }
    }

    await Promise.all(emailPromises);

    // Track service contact
    this.statisticsService.incrementContactedServices(organizationKey).catch((error) => {
      this.logger.error('Failed to track service contact', error, { organizationKey });
    });

    return {
      message: 'Emails sent successfully',
      emailsSent: emailPromises.length,
    };
  }
}


