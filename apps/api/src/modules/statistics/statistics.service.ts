import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationStatistics } from './entities/organization-statistics.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { ScaleType } from '../readiness-assessment/dto/readiness-assessment.dto';

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(OrganizationStatistics)
    private readonly statisticsRepository: Repository<OrganizationStatistics>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  /**
   * Get or create statistics record for an organization
   */
  private async getOrCreateStatistics(organizationId: string): Promise<OrganizationStatistics> {
    let statistics = await this.statisticsRepository.findOne({
      where: { organizationId },
    });

    if (!statistics) {
      statistics = this.statisticsRepository.create({
        organizationId,
        startedAssessments: 0,
        completedAssessments: 0,
        contactedServices: 0,
        usersByCategoryAndLevel: {
          TRL: {},
          MkRL: {},
          MfRL: {},
        },
      });
      statistics = await this.statisticsRepository.save(statistics);
      this.logger.log(`Created statistics record for organization ${organizationId}`);
    }

    return statistics;
  }

  /**
   * Increment started assessments counter
   */
  async incrementStartedAssessments(organizationKey: string): Promise<void> {
    try {
      const organization = await this.organizationsService.findByKey(organizationKey);
      const statistics = await this.getOrCreateStatistics(organization.id);
      
      statistics.startedAssessments += 1;
      await this.statisticsRepository.save(statistics);
      
      this.logger.debug(
        `Incremented started assessments for organization ${organizationKey}: ${statistics.startedAssessments}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to increment started assessments for organization ${organizationKey}:`,
        error,
      );
    }
  }

  /**
   * Increment completed assessments counter
   */
  async incrementCompletedAssessments(organizationKey: string): Promise<void> {
    try {
      const organization = await this.organizationsService.findByKey(organizationKey);
      const statistics = await this.getOrCreateStatistics(organization.id);
      
      statistics.completedAssessments += 1;
      await this.statisticsRepository.save(statistics);
      
      this.logger.debug(
        `Incremented completed assessments for organization ${organizationKey}: ${statistics.completedAssessments}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to increment completed assessments for organization ${organizationKey}:`,
        error,
      );
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
      
      this.logger.debug(
        `Incremented contacted services for organization ${organizationKey}: ${statistics.contactedServices}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to increment contacted services for organization ${organizationKey}:`,
        error,
      );
    }
  }

  /**
   * Increment user count for a specific category and level
   */
  async incrementUserByCategoryAndLevel(
    organizationKey: string,
    category: ScaleType,
    level: number,
  ): Promise<void> {
    try {
      const organization = await this.organizationsService.findByKey(organizationKey);
      const statistics = await this.getOrCreateStatistics(organization.id);
      
      const levelKey = level.toString();
      const categoryData = statistics.usersByCategoryAndLevel[category] || {};
      categoryData[levelKey] = (categoryData[levelKey] || 0) + 1;
      statistics.usersByCategoryAndLevel[category] = categoryData;
      
      await this.statisticsRepository.save(statistics);
      
      this.logger.debug(
        `Incremented user count for organization ${organizationKey}, category ${category}, level ${level}: ${categoryData[levelKey]}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to increment user count for organization ${organizationKey}, category ${category}, level ${level}:`,
        error,
      );
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
      // Return default statistics if none exist
      return {
        id: '',
        organizationId: organization.id,
        startedAssessments: 0,
        completedAssessments: 0,
        contactedServices: 0,
        usersByCategoryAndLevel: {
          TRL: {},
          MkRL: {},
          MfRL: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as OrganizationStatistics;
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
      // Return default statistics if none exist
      return {
        id: '',
        organizationId,
        startedAssessments: 0,
        completedAssessments: 0,
        contactedServices: 0,
        usersByCategoryAndLevel: {
          TRL: {},
          MkRL: {},
          MfRL: {},
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as OrganizationStatistics;
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
    
    const aggregated = {
      id: '',
      organizationId: '',
      startedAssessments: 0,
      completedAssessments: 0,
      contactedServices: 0,
      usersByCategoryAndLevel: {
        TRL: {},
        MkRL: {},
        MfRL: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as OrganizationStatistics;

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
      }
    }

    return aggregated;
  }
}

