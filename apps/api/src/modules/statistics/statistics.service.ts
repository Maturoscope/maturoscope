import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { In } from 'typeorm';
import { OrganizationStatistics } from './entities/organization-statistics.entity';
import { TrackingSession } from './entities/tracking-session.entity';
import { Service } from '../services/entities/service.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { ScaleType } from '../readiness-assessment/dto/readiness-assessment.dto';
import { StructuredLoggerService } from '../../common/logger/structured-logger.service';

@Injectable()
export class StatisticsService {
  private readonly logger: StructuredLoggerService;

  constructor(
    @InjectRepository(OrganizationStatistics)
    private readonly statisticsRepository: Repository<OrganizationStatistics>,
    @InjectRepository(TrackingSession)
    private readonly trackingSessionRepository: Repository<TrackingSession>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly organizationsService: OrganizationsService,
    structuredLogger: StructuredLoggerService,
  ) {
    this.logger = structuredLogger.child('StatisticsService');
  }

  /**
   * Check if a tracking event has already been recorded for this session.
   * Returns true if it's a duplicate (already tracked), false if it's new.
   */
  private async isDuplicateSession(
    organizationId: string,
    sessionId: string | undefined,
    event: 'started' | 'completed' | 'category' | 'scale_started',
    category: string | null = null,
  ): Promise<boolean> {
    if (!sessionId) return false;

    try {
      const existing = await this.trackingSessionRepository.findOne({
        where: {
          organizationId,
          sessionId,
          event,
          category: category ?? IsNull(),
        },
      });
      return !!existing;
    } catch {
      return false;
    }
  }

  /**
   * Record a tracking session to prevent future duplicates.
   */
  private async recordSession(
    organizationId: string,
    sessionId: string | undefined,
    event: 'started' | 'completed' | 'category' | 'scale_started',
    category: string | null = null,
  ): Promise<void> {
    if (!sessionId) return;

    try {
      const session = this.trackingSessionRepository.create({
        organizationId,
        sessionId,
        event,
        category,
      });
      await this.trackingSessionRepository.save(session);
    } catch {
      // Unique constraint violation means it was already recorded — safe to ignore
      this.logger.warn('Could not record tracking session (likely duplicate)', { organizationId, sessionId, event, category: category ?? undefined });
    }
  }

  /**
   * Zeroed data columns for a statistics row (no id/timestamps), used both to
   * create a new record and to build in-memory fallbacks.
   */
  private defaultStatsColumns(organizationId: string) {
    return {
      organizationId,
      startedAssessments: 0,
      completedAssessments: 0,
      contactedServices: 0,
      usersByCategoryAndLevel: { TRL: {}, MkRL: {}, MfRL: {} },
      assessmentsByScale: {
        TRL: { started: 0, completed: 0 },
        MkRL: { started: 0, completed: 0 },
        MfRL: { started: 0, completed: 0 },
      },
      consultationsByService: {} as Record<string, number>,
    };
  }

  /**
   * Build a zeroed statistics object (with id/timestamps) for the in-memory
   * fallbacks when no record exists yet.
   */
  private buildEmptyStatistics(organizationId: string): OrganizationStatistics {
    return {
      id: '',
      ...this.defaultStatsColumns(organizationId),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as OrganizationStatistics;
  }

  /**
   * Get or create statistics record for an organization
   */
  private async getOrCreateStatistics(organizationId: string): Promise<OrganizationStatistics> {
    let statistics = await this.statisticsRepository.findOne({
      where: { organizationId },
    });

    if (!statistics) {
      statistics = this.statisticsRepository.create(
        this.defaultStatsColumns(organizationId),
      );
      statistics = await this.statisticsRepository.save(statistics);
    } else {
      // Backfill the newer JSONB columns for rows created before they existed.
      if (!statistics.assessmentsByScale) {
        statistics.assessmentsByScale = {
          TRL: { started: 0, completed: 0 },
          MkRL: { started: 0, completed: 0 },
          MfRL: { started: 0, completed: 0 },
        };
      }
      if (!statistics.consultationsByService) {
        statistics.consultationsByService = {};
      }
    }

    return statistics;
  }

  /**
   * Increment started assessments counter
   */
  async incrementStartedAssessments(organizationKey: string, sessionId?: string): Promise<void> {
    try {
      const organization = await this.organizationsService.findByKey(organizationKey);

      if (await this.isDuplicateSession(organization.id, sessionId, 'started')) {
        this.logger.warn('Duplicate started assessment session skipped', { organizationKey, sessionId });
        return;
      }

      const statistics = await this.getOrCreateStatistics(organization.id);
      statistics.startedAssessments += 1;
      await this.statisticsRepository.save(statistics);

      await this.recordSession(organization.id, sessionId, 'started');
    } catch (error) {
      this.logger.error('Failed to increment started assessments', error, { organizationKey });
    }
  }

  /**
   * Increment completed assessments counter
   */
  async incrementCompletedAssessments(organizationKey: string, sessionId?: string): Promise<void> {
    try {
      const organization = await this.organizationsService.findByKey(organizationKey);

      if (await this.isDuplicateSession(organization.id, sessionId, 'completed')) {
        this.logger.warn('Duplicate completed assessment session skipped', { organizationKey, sessionId });
        return;
      }

      const statistics = await this.getOrCreateStatistics(organization.id);
      statistics.completedAssessments += 1;
      await this.statisticsRepository.save(statistics);

      await this.recordSession(organization.id, sessionId, 'completed');
    } catch (error) {
      this.logger.error('Failed to increment completed assessments', error, { organizationKey });
    }
  }

  /**
   * Increment contacted services counter
   */
  async incrementContactedServices(organizationKey: string): Promise<void> {
    try {
      const organization = await this.organizationsService.findByKey(organizationKey);
      const statistics = await this.getOrCreateStatistics(organization.id);

      statistics.contactedServices += 1;
      await this.statisticsRepository.save(statistics);
    } catch (error) {
      this.logger.error('Failed to increment contacted services', error, { organizationKey });
    }
  }

  /**
   * Increment the "started" counter for each scale the user chose to assess.
   * Deduplicated per session and scale so a reload doesn't double count.
   */
  async incrementStartedScales(
    organizationKey: string,
    scales: ScaleType[],
    sessionId?: string,
  ): Promise<void> {
    try {
      const organization = await this.organizationsService.findByKey(organizationKey);
      const statistics = await this.getOrCreateStatistics(organization.id);

      const updated = { ...statistics.assessmentsByScale };
      let changed = false;

      for (const scale of scales) {
        if (
          await this.isDuplicateSession(
            organization.id,
            sessionId,
            'scale_started',
            scale,
          )
        ) {
          continue;
        }

        const scaleData = updated[scale] || { started: 0, completed: 0 };
        updated[scale] = { ...scaleData, started: scaleData.started + 1 };
        changed = true;

        await this.recordSession(organization.id, sessionId, 'scale_started', scale);
      }

      if (changed) {
        statistics.assessmentsByScale = updated;
        await this.statisticsRepository.save(statistics);
      }
    } catch (error) {
      this.logger.error('Failed to increment started scales', error, {
        organizationKey,
      });
    }
  }

  /**
   * Increment the consultation counter for each contacted service. Not
   * deduplicated: every contact form submission counts +1 per service, which
   * reflects real demand for each service.
   */
  async incrementServiceConsultations(
    organizationKey: string,
    serviceIds: string[],
  ): Promise<void> {
    if (serviceIds.length === 0) return;

    try {
      const organization = await this.organizationsService.findByKey(organizationKey);
      const statistics = await this.getOrCreateStatistics(organization.id);

      const updated = { ...statistics.consultationsByService };
      for (const serviceId of serviceIds) {
        updated[serviceId] = (updated[serviceId] || 0) + 1;
      }

      statistics.consultationsByService = updated;
      await this.statisticsRepository.save(statistics);
    } catch (error) {
      this.logger.error('Failed to increment service consultations', error, {
        organizationKey,
      });
    }
  }

  /**
   * Increment user count for a specific category and level
   */
  async incrementUserByCategoryAndLevel(
    organizationKey: string,
    category: ScaleType,
    level: number,
    sessionId?: string,
  ): Promise<void> {
    try {
      const organization = await this.organizationsService.findByKey(organizationKey);

      if (await this.isDuplicateSession(organization.id, sessionId, 'category', category)) {
        this.logger.warn('Duplicate category tracking session skipped', { organizationKey, sessionId, category });
        return;
      }

      const statistics = await this.getOrCreateStatistics(organization.id);

      const levelKey = level.toString();
      // Create a new object so TypeORM detects the JSONB change (mutating nested refs can be ignored)
      const categoryData = { ...(statistics.usersByCategoryAndLevel[category] || {}) };
      categoryData[levelKey] = (categoryData[levelKey] || 0) + 1;
      statistics.usersByCategoryAndLevel = {
        ...statistics.usersByCategoryAndLevel,
        [category]: categoryData,
      };

      // Completing a category also counts as a completed assessment for that
      // scale (used by the started-vs-completed-vs-abandoned chart).
      const scaleData = statistics.assessmentsByScale[category] || {
        started: 0,
        completed: 0,
      };
      statistics.assessmentsByScale = {
        ...statistics.assessmentsByScale,
        [category]: { ...scaleData, completed: scaleData.completed + 1 },
      };

      await this.statisticsRepository.save(statistics);

      await this.recordSession(organization.id, sessionId, 'category', category);
    } catch (error) {
      this.logger.error('Failed to increment user by category/level', error, {
        organizationKey,
        category,
        level,
      });
    }
  }

  /**
   * Get statistics for an organization by key
   */
  async getStatisticsByOrganizationKey(organizationKey: string): Promise<OrganizationStatistics> {
    const organization = await this.organizationsService.findByKey(organizationKey);
    const statistics = await this.statisticsRepository.findOne({
      where: { organizationId: organization.id },
    });

    if (!statistics) {
      return this.buildEmptyStatistics(organization.id);
    }

    return statistics;
  }

  /**
   * Get statistics for an organization by ID (for authenticated users)
   */
  async getStatisticsByOrganizationId(organizationId: string): Promise<OrganizationStatistics> {
    const statistics = await this.statisticsRepository.findOne({
      where: { organizationId },
    });

    if (!statistics) {
      return this.buildEmptyStatistics(organizationId);
    }

    return statistics;
  }

  /**
   * Get aggregated statistics for all organizations or a specific one
   * @param organizationId - Optional organization ID to filter by. If null, aggregates all organizations
   */
  async getAggregatedStatistics(organizationId?: string): Promise<OrganizationStatistics> {
    if (organizationId) {
      // Return statistics for a specific organization
      return this.getStatisticsByOrganizationId(organizationId);
    }

    // Aggregate statistics from all organizations
    const allStatistics = await this.statisticsRepository.find();

    const aggregated = this.buildEmptyStatistics('');

    // Sum up all statistics
    for (const stats of allStatistics) {
      aggregated.startedAssessments += stats.startedAssessments;
      aggregated.completedAssessments += stats.completedAssessments;
      aggregated.contactedServices += stats.contactedServices;

      // Aggregate usersByCategoryAndLevel
      for (const category of ['TRL', 'MkRL', 'MfRL'] as const) {
        const categoryData = stats.usersByCategoryAndLevel[category] || {};
        for (const [level, count] of Object.entries(categoryData)) {
          aggregated.usersByCategoryAndLevel[category][level] =
            (aggregated.usersByCategoryAndLevel[category][level] || 0) + count;
        }

        // Aggregate started/completed per scale
        const scaleData = stats.assessmentsByScale?.[category];
        if (scaleData) {
          aggregated.assessmentsByScale[category].started += scaleData.started || 0;
          aggregated.assessmentsByScale[category].completed +=
            scaleData.completed || 0;
        }
      }

      // Aggregate consultations per service
      for (const [serviceId, count] of Object.entries(
        stats.consultationsByService || {},
      )) {
        aggregated.consultationsByService[serviceId] =
          (aggregated.consultationsByService[serviceId] || 0) + count;
      }
    }

    return aggregated;
  }

  /**
   * Resolve the per-service consultation counts into a display-ready list with
   * the service name, sorted by count (desc). Services that no longer exist are
   * still shown (labelled generically) so historical counts aren't lost.
   */
  async resolveServiceConsultations(
    consultationsByService: Record<string, number>,
  ): Promise<Array<{ serviceId: string; name: string; count: number }>> {
    const entries = Object.entries(consultationsByService || {});
    if (entries.length === 0) return [];

    const services = await this.serviceRepository.find({
      where: { id: In(entries.map(([id]) => id)) },
    });
    const nameById = new Map(
      services.map((s) => [s.id, s.nameEn || s.name || s.nameFr || 'Service']),
    );

    return entries
      .map(([serviceId, count]) => ({
        serviceId,
        name: nameById.get(serviceId) ?? 'Deleted service',
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }
}

