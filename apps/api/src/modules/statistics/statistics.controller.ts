import { Controller, Get, Post, Req, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { Auth } from '../../common/decorators/auth.decorator';
import { Request } from 'express';
import { AuthenticatedUser } from '../../common/auth-module/interfaces/authenticated-user.interface';
import { UsersService } from '../users/users.service';
import { ForbiddenException } from '@nestjs/common';
import { OrganizationsService } from '../organizations/organizations.service';
import { ValidRoles } from 'src/common/auth-module/interfaces/valid-roles';
import { IncrementUserStatisticsDto } from './dto/increment-user-statistics.dto';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  /**
   * GET /statistics/dashboard
   * Get dashboard statistics for the authenticated user's organization
   */
  @Get('dashboard')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get dashboard statistics',
    description: 'Retrieves dashboard statistics including completion rates and user distribution by category/level for the authenticated user\'s organization.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        analysisCompletionRate: { type: 'number', example: 75 },
        contactRate: { type: 'number', example: 60 },
        chartData: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              level: { type: 'number', example: 5 },
              TRL: { type: 'number', example: 12 },
              MkRL: { type: 'number', example: 8 },
              MfRL: { type: 'number', example: 15 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - User or organization not found' })
  async getDashboardStatistics(
    @Req() req: Request & { user?: AuthenticatedUser },
  ) {
    const email = req.user?.email;
    if (!email) {
      throw new ForbiddenException('Unable to determine requester identity');
    }

    const user = await this.usersService.findByUserEmail(email);
    if (!user || !user.organizationId) {
      throw new ForbiddenException('User or organization not found');
    }

    const statistics = await this.statisticsService.getStatisticsByOrganizationId(
      user.organizationId,
    );

    // Calculate rates
    const analysisCompletionRate =
      statistics.startedAssessments > 0
        ? Math.round(
            (statistics.completedAssessments / statistics.startedAssessments) * 100,
          )
        : 0;

    const contactRate =
      statistics.completedAssessments > 0
        ? Math.round((statistics.contactedServices / statistics.completedAssessments) * 100)
        : 0;

    // Prepare chart data - counts by level for each category (non-cumulative)
    const chartData: Array<{ level: number; TRL: number; MkRL: number; MfRL: number }> = [];
    const categories: Array<'TRL' | 'MkRL' | 'MfRL'> = ['TRL', 'MkRL', 'MfRL'];
    const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (const level of levels) {
      const dataPoint: { level: number; TRL: number; MkRL: number; MfRL: number } = {
        level,
        TRL: 0,
        MkRL: 0,
        MfRL: 0,
      };
      
      for (const category of categories) {
        // Get count for this specific level only (not cumulative)
        // Level 0 always has 0 users
        const count = level === 0 ? 0 : (statistics.usersByCategoryAndLevel[category]?.[level.toString()] || 0);
        dataPoint[category] = count;
      }
      
      chartData.push(dataPoint);
    }

    return {
      analysisCompletionRate,
      contactRate,
      chartData,
      rawStatistics: {
        startedAssessments: statistics.startedAssessments,
        completedAssessments: statistics.completedAssessments,
        contactedServices: statistics.contactedServices,
        usersByCategoryAndLevel: statistics.usersByCategoryAndLevel,
      },
    };
  }

  /**
   * GET /statistics/reports
   * Get aggregated statistics for super admin (all organizations or filtered by organizationId)
   */
  @Get('reports')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get reports statistics (Admin only)',
    description: 'Retrieves aggregated statistics across all organizations or filtered by organizationId. Requires admin role.'
  })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Filter by organization UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Reports statistics retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  async getReportsStatistics(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Query('organizationId') organizationId?: string,
  ) {
    const email = req.user?.email;
    if (!email) {
      throw new ForbiddenException('Unable to determine requester identity');
    }

    const user = await this.usersService.findByUserEmail(email);
    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // Check if user is admin
    const userRoles = user.roles || [];
    if (!userRoles.includes('admin')) {
      throw new ForbiddenException('Admin access required');
    }

    // If organizationId is provided, validate it exists
    let targetOrganizationId: string | undefined = undefined;
    if (organizationId) {
      const organization = await this.organizationsService.findOne(organizationId);
      if (!organization) {
        throw new ForbiddenException('Organization not found');
      }
      targetOrganizationId = organization.id;
    }

    const statistics = await this.statisticsService.getAggregatedStatistics(targetOrganizationId);

    // Calculate rates
    const analysisCompletionRate =
      statistics.startedAssessments > 0
        ? Math.round(
            (statistics.completedAssessments / statistics.startedAssessments) * 100,
          )
        : 0;

    const contactRate =
      statistics.completedAssessments > 0
        ? Math.round((statistics.contactedServices / statistics.completedAssessments) * 100)
        : 0;

    // Prepare chart data - counts by level for each category (non-cumulative)
    const chartData: Array<{ level: number; TRL: number; MkRL: number; MfRL: number }> = [];
    const categories: Array<'TRL' | 'MkRL' | 'MfRL'> = ['TRL', 'MkRL', 'MfRL'];
    const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (const level of levels) {
      const dataPoint: { level: number; TRL: number; MkRL: number; MfRL: number } = {
        level,
        TRL: 0,
        MkRL: 0,
        MfRL: 0,
      };
      
      for (const category of categories) {
        // Get count for this specific level only (not cumulative)
        const count = level === 0 ? 0 : (statistics.usersByCategoryAndLevel[category]?.[level.toString()] || 0);
        dataPoint[category] = count;
      }
      
      chartData.push(dataPoint);
    }

    return {
      analysisCompletionRate,
      contactRate,
      chartData,
      rawStatistics: {
        startedAssessments: statistics.startedAssessments,
        completedAssessments: statistics.completedAssessments,
        contactedServices: statistics.contactedServices,
        usersByCategoryAndLevel: statistics.usersByCategoryAndLevel,
      },
    };
  }

  /**
   * POST /statistics/track-started?organizationKey=synopp
   * Track when a user starts an assessment
   * PUBLIC endpoint - No authentication required
   */
  @Post('track-started')
  @ApiOperation({ 
    summary: 'Track started assessment (PUBLIC)',
    description: 'Tracks when a user starts an assessment. This is a PUBLIC endpoint called from the end-user application.'
  })
  @ApiQuery({ name: 'organizationKey', required: true, description: 'Organization unique key', example: 'synopp' })
  @ApiResponse({ status: 200, description: 'Started assessment tracked successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - organizationKey required' })
  async trackStartedAssessment(@Query('organizationKey') organizationKey: string) {
    if (!organizationKey) {
      throw new ForbiddenException('organizationKey query parameter is required');
    }

    await this.statisticsService.incrementStartedAssessments(organizationKey);
    return { success: true, message: 'Started assessment tracked successfully' };
  }

  /**
   * POST /statistics/track-completed?organizationKey=synopp
   * Track when a user completes an assessment
   * PUBLIC endpoint - No authentication required
   */
  @Post('track-completed')
  @ApiOperation({ 
    summary: 'Track completed assessment (PUBLIC)',
    description: 'Tracks when a user completes an assessment. This is a PUBLIC endpoint called from the end-user application.'
  })
  @ApiQuery({ name: 'organizationKey', required: true, description: 'Organization unique key', example: 'synopp' })
  @ApiResponse({ status: 200, description: 'Completed assessment tracked successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - organizationKey required' })
  async trackCompletedAssessment(@Query('organizationKey') organizationKey: string) {
    if (!organizationKey) {
      throw new ForbiddenException('organizationKey query parameter is required');
    }

    await this.statisticsService.incrementCompletedAssessments(organizationKey);
    return { success: true, message: 'Completed assessment tracked successfully' };
  }

  /**
   * POST /statistics/track-category?organizationKey=hogwarts
   * Track user count for a specific category and level
   * PUBLIC endpoint - No authentication required
   * @param organizationKey - Query parameter with organization key (e.g., "hogwarts")
   * @param incrementUserDto - Contains category (TRL, MkRL, MfRL) and level (1-9)
   */
  @Post('track-category')
  @ApiOperation({ 
    summary: 'Track category statistics (PUBLIC)',
    description: 'Tracks user count for a specific maturity category (TRL, MkRL, MfRL) and level (1-9). This is a PUBLIC endpoint called from the end-user application.'
  })
  @ApiQuery({ name: 'organizationKey', required: true, description: 'Organization unique key', example: 'synopp' })
  @ApiResponse({ status: 200, description: 'User count incremented successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - organizationKey required' })
  async incrementUserStatistics(
    @Query('organizationKey') organizationKey: string,
    @Body() incrementUserDto: IncrementUserStatisticsDto,
  ) {
    if (!organizationKey) {
      throw new ForbiddenException('organizationKey query parameter is required');
    }

    await this.statisticsService.incrementUserByCategoryAndLevel(
      organizationKey,
      incrementUserDto.category,
      incrementUserDto.level,
    );

    return {
      success: true,
      message: `User count incremented for category ${incrementUserDto.category} at level ${incrementUserDto.level}`,
    };
  }
}

