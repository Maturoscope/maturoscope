import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { CompleteUserInvitationDto } from './dto/complete-user-invitation.dto';
import { UserInvitationMailService } from './mail.service';
import { getRolesMapped } from '../../common/auth-module/interfaces/valid-roles';

export interface InvitationPayload {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId: string;
  type: 'invitation';
  iat?: number;
  exp?: number;
}

@Injectable()
export class UserInvitationService {
  private readonly logger = new Logger(UserInvitationService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly userInvitationMailService: UserInvitationMailService,
  ) {}

  private getInvitationExpiration(): JwtSignOptions['expiresIn'] {
    const configured = this.configService.get<string>('INVITATION_TOKEN_EXPIRATION');

    if (!configured) {
      return '30d';
    }

    const numericValue = Number(configured);

    if (!Number.isNaN(numericValue)) {
      return numericValue;
    }

    return configured as JwtSignOptions['expiresIn'];
  }

  private getDashboardUrl(): string {
    const configuredUrl =
      this.configService.get<string>('DASHBOARD_APP_URL') ||
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('WEB_APP_URL');

    if (!configuredUrl) {
      throw new InternalServerErrorException('Dashboard base URL is not configured.');
    }

    return configuredUrl.replace(/\/?$/, '');
  }

  private getInvitationPath(): string {
    return this.configService.get<string>('INVITATION_PATH') || '/complete-registration';
  }

  private buildMagicLink(token: string): string {
    const baseUrl = this.getDashboardUrl();
    const path = this.getInvitationPath();
    return `${baseUrl}${path}?token=${token}`;
  }

  private isAdminUser(roles: string[]): boolean {
    if (!roles || roles.length === 0) {
      return false;
    }

    const rolesMapped = getRolesMapped();
    const adminRole = rolesMapped.admin;

    return roles.some(
      (role) =>
        role.toLowerCase() === 'admin' ||
        (adminRole && role.toLowerCase() === adminRole.toLowerCase()),
    );
  }

  /**
   * Gets organization details for email templates
   */
  private async getOrganizationDetails(
    organizationId: string,
    invitedBy?: { email?: string; name?: string },
  ): Promise<{ companyName: string; companyLogoUrl?: string; organizationLanguage: string }> {
    let companyName = this.configService.get<string>('APP_NAME') || 'Maturoscope';
    let companyLogoUrl: string | undefined;
    let organizationLanguage = 'EN';

    try {
      const organization = await this.organizationsService.findOne(organizationId);
      if (organization) {
        companyName = organization.name || companyName;
        companyLogoUrl = organization.avatar || undefined;
        organizationLanguage = organization.language?.toUpperCase() || 'EN';
      }
    } catch (error) {
      // Log error but continue with defaults
      this.logger.error('Error fetching organization for email template', error);
    }

    // Fallback to inviter's organization logo if not found
    if (!companyLogoUrl && invitedBy?.email) {
      try {
        const inviter = await this.usersService.findByUserEmail(invitedBy.email);
        if (inviter?.organization?.avatar) {
          companyLogoUrl = inviter.organization.avatar;
        }
      } catch (error) {
        // Silently fail - logo is optional
        this.logger.debug('Error fetching inviter organization logo (optional)', error);
      }
    }

    return { companyName, companyLogoUrl, organizationLanguage };
  }

  /**
   * Gets invitation expiration days from config
   */
  private getInvitationExpirationDays(): number {
    const expirationConfig = this.configService.get<string>('INVITATION_EXPIRATION_DAYS');
    return (expirationConfig && Number.isFinite(Number(expirationConfig)) ? Number(expirationConfig) : undefined) || 30;
  }

  /**
   * Sends invitation email based on user role and organization status
   */
  private async sendInvitationEmail(
    email: string,
    firstName: string,
    roles: string[],
    organizationId: string,
    magicLink: string,
    companyName: string,
    companyLogoUrl: string | undefined,
    organizationLanguage: string,
    expirationDays: number,
  ): Promise<void> {
    const existingUsers = await this.usersService.findByOrganization(organizationId, email);
    const isFirstUser = existingUsers.length === 0;
    const isAdmin = this.isAdminUser(roles);
    const shouldUseAdminTemplate = isAdmin || isFirstUser;

    if (shouldUseAdminTemplate) {
      await this.userInvitationMailService.sendAdminInvitationEmail({
        inviteeEmail: email,
        inviteeFirstName: firstName,
        magicLink,
        organizationName: companyName,
        expirationDays,
        language: organizationLanguage,
      });
    } else {
      await this.userInvitationMailService.sendInvitationEmail({
        inviteeEmail: email,
        inviteeFirstName: firstName,
        magicLink,
        companyName,
        companyLogoUrl,
        expirationDays,
        language: organizationLanguage,
      });
    }
  }

  async inviteUser(createUserInvitationDto: CreateUserInvitationDto, invitedBy?: { email?: string; name?: string }) {
    const { email, firstName, lastName, roles, organizationId } = createUserInvitationDto;

    // Check if email exists in organizations
    const existingOrganization = await this.organizationsService.findByEmail(email);
    if (existingOrganization) {
      throw new BadRequestException('This email address is already registered in our database. Please use a different one.');
    }

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      if (existingUser.authId) {
        throw new BadRequestException('This email address is already registered in our database. Please use a different one.');
      }

      await this.usersService.updateByEmail(email, {
        firstName,
        lastName,
        roles,
        organizationId,
        isActive: true,
      });
    } else {
      await this.usersService.create({
        organizationId,
        firstName,
        lastName,
        email,
        roles,
        isActive: true,
      });
    }

    const { companyName, companyLogoUrl, organizationLanguage } = await this.getOrganizationDetails(
      organizationId,
      invitedBy,
    );

    const expirationDaysDisplay = this.getInvitationExpirationDays();

    const token = this.jwtService.sign(
      {
        email,
        firstName,
        lastName,
        roles,
        organizationId,
        type: 'invitation',
      },
      {
        expiresIn: this.getInvitationExpiration(),
      },
    );

    const magicLink = this.buildMagicLink(token);

    await this.sendInvitationEmail(
      email,
      firstName,
      roles,
      organizationId,
      magicLink,
      companyName,
      companyLogoUrl,
      organizationLanguage,
      expirationDaysDisplay,
    );

    return {
      message: 'Invitation sent successfully',
      email,
    };
  }

  verifyInvitationToken(token: string): InvitationPayload {
    try {
      const payload = this.jwtService.verify<InvitationPayload>(token);

      if (payload.type !== 'invitation') {
        throw new BadRequestException('Invalid invitation token');
      }

      return payload;
    } catch (error) {
      this.logger.error('Error verifying invitation token', error);
      throw new BadRequestException('Invalid or expired invitation token');
    }
  }

  async completeInvitation({ token, authId }: CompleteUserInvitationDto) {
    const payload = this.verifyInvitationToken(token);

    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.usersService.updateByEmail(payload.email, {
      authId,
      isActive: true,
    });

    return {
      message: 'Invitation completed successfully',
      user: updatedUser,
    };
  }

  async resendInvitation(createUserInvitationDto: CreateUserInvitationDto, invitedBy?: { email?: string; name?: string }) {
    const { email, firstName, lastName, roles, organizationId } = createUserInvitationDto;

    const existingUser = await this.usersService.findByUserEmail(email);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (existingUser.authId) {
      throw new BadRequestException('User has already completed registration. Cannot resend invitation.');
    }

    // Update user with new data and reset createdAt to current date
    await this.usersService.updateUserWithNewCreatedAt(email, {
      firstName,
      lastName,
      roles,
      organizationId,
      isActive: true,
    });

    const { companyName, companyLogoUrl, organizationLanguage } = await this.getOrganizationDetails(
      organizationId,
      invitedBy,
    );

    const expirationDaysDisplay = this.getInvitationExpirationDays();

    const token = this.jwtService.sign(
      {
        email,
        firstName,
        lastName,
        roles,
        organizationId,
        type: 'invitation',
      },
      {
        expiresIn: this.getInvitationExpiration(),
      },
    );

    const magicLink = this.buildMagicLink(token);

    await this.sendInvitationEmail(
      email,
      firstName,
      roles,
      organizationId,
      magicLink,
      companyName,
      companyLogoUrl,
      organizationLanguage,
      expirationDaysDisplay,
    );

    return {
      message: 'Invitation resent successfully',
      email,
    };
  }
}

