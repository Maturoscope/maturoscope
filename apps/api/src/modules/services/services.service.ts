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
} from './dto';
import { ReadinessAssessmentService } from '../readiness-assessment/readiness-assessment.service';
import { ScaleType } from '../readiness-assessment/dto/readiness-assessment.dto';

@Injectable()
export class ServicesService {
  private readinessAssessmentService: ReadinessAssessmentService;

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceGapCoverage)
    private readonly coverageRepository: Repository<ServiceGapCoverage>,
    @Inject(forwardRef(() => ReadinessAssessmentService))
    readinessAssessmentService: ReadinessAssessmentService,
  ) {
    this.readinessAssessmentService = readinessAssessmentService;
  }

  /**
   * Create a new service
   */
  async create(
    organizationId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    // Check for duplicate service name in the organization
    const existingService = await this.serviceRepository.findOne({
      where: {
        organizationId,
        name: createServiceDto.name,
      },
    });

    if (existingService) {
      throw new ConflictException(
        `A service with the name "${createServiceDto.name}" already exists in this organization`,
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
      name: createServiceDto.name,
      description: createServiceDto.description,
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

    // Check for duplicate name if name is being updated
    if (updateServiceDto.name && updateServiceDto.name !== service.name) {
      const existingService = await this.serviceRepository.findOne({
        where: {
          organizationId,
          name: updateServiceDto.name,
        },
      });

      if (existingService) {
        throw new ConflictException(
          `A service with the name "${updateServiceDto.name}" already exists in this organization`,
        );
      }
    }

    // Update service fields
    Object.assign(service, {
      ...(updateServiceDto.name && { name: updateServiceDto.name }),
      ...(updateServiceDto.description && {
        description: updateServiceDto.description,
      }),
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
  ): Promise<Map<string, RecommendedServiceDto[]>> {
    const gapServiceMap = new Map<string, RecommendedServiceDto[]>();

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

      // Filter by organization and map to DTO
      const services = coverages
        .filter((coverage) => coverage.service.organizationId === organizationId)
        .map((coverage) => this.mapToRecommendedServiceDto(coverage.service));

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
      description: service.description,
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
      description: service.description,
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
   * Map entity to recommended service DTO
   */
  private mapToRecommendedServiceDto(service: Service): RecommendedServiceDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
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
}


