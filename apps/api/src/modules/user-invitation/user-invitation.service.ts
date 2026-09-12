import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { CreateUserInvitationDto } from './dto/create-user-invitation.dto';
import { CompleteUserInvitationDto } from './dto/complete-user-invitation.dto';
import { UserInvitationMailService } from './mail.service';
import { getRolesMapped } from '../../common/auth-module/interfaces/valid-roles';
import { StructuredLoggerService } from '../../common/logger/structured-logger.service';

export interface InvitationPayload {
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  organizationId: string;
  type: 'invitation';
  // Association invites (joining an additional organization) require explicit
  // acceptance from the profile; primary invites (first organization) activate
  // the membership when the account is created. Absent = primary (legacy tokens).
  isAssociation?: boolean;
  iat?: number;
  exp?: number;
}

export type InvitationCheckStatus = 'NEW' | 'IN_ORG' | 'IN_OTHER_ORG';

export interface InvitationCheckResult {
  status: InvitationCheckStatus;
  // Whether the existing user has already finished creating their account.
  hasAccount: boolean;
}

@Injectable()
export class UserInvitationService {
  private readonly logger: StructuredLoggerService;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
    private readonly userInvitationMailService: UserInvitationMailService,
    structuredLogger: StructuredLoggerService,
  ) {
    this.logger = structuredLogger.child('UserInvitationService');
  }

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

  private getOrganizationsSectionPath(): string {
    return (
      this.configService.get<string>('ORGANIZATIONS_SECTION_PATH') ||
      '/dashboard/settingsUser?section=organizations'
    );
  }

  private buildMagicLink(token: string, redirectPath?: string): string {
    const baseUrl = this.getDashboardUrl();
    const path = this.getInvitationPath();
    const redirect = redirectPath
      ? `&redirect=${encodeURIComponent(redirectPath)}`
      : '';
    return `${baseUrl}${path}?token=${token}${redirect}`;
  }

  /**
   * Link for association invites to a user that already has an account: goes to
   * login with a redirect to the organizations section, where they accept/decline.
   */
  private buildLoginRedirectLink(redirectPath: string): string {
    const baseUrl = this.getDashboardUrl();
    return `${baseUrl}/login?redirect=${encodeURIComponent(redirectPath)}`;
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
      this.logger.error('Error fetching organization for email template', error, { organizationId });
    }

    // Fallback to inviter's organization logo if not found
    if (!companyLogoUrl && invitedBy?.email) {
      try {
        const inviter = await this.usersService.findByUserEmail(invitedBy.email);
        if (inviter?.organization?.avatar) {
          companyLogoUrl = inviter.organization.avatar;
        }
      } catch {
        // Silently fail - logo is optional, no log to avoid noise
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
    isFirstUser: boolean,
  ): Promise<void> {
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

  /**
   * Pre-check used by the invite form to decide which screen to show: the email
   * is new, already in this organization, or already a user of another one.
   */
  async checkInvitation(email: string, organizationId: string): Promise<InvitationCheckResult> {
    const existingUser = await this.usersService.findByUserEmail(email);

    if (!existingUser) {
      return { status: 'NEW', hasAccount: false };
    }

    const membership = await this.usersService.getMembership(existingUser.id, organizationId);
    const hasAccount = !!existingUser.authId;

    return {
      status: membership ? 'IN_ORG' : 'IN_OTHER_ORG',
      hasAccount,
    };
  }

  async inviteUser(createUserInvitationDto: CreateUserInvitationDto, invitedBy?: { email?: string; name?: string }) {
    const { email, firstName, lastName, roles, organizationId } = createUserInvitationDto;

    const existingUser = await this.usersService.findByUserEmail(email);

    // --- Case 3: the email already belongs to a user (associate to a new org) ---
    if (existingUser) {
      const membership = await this.usersService.getMembership(existingUser.id, organizationId);
      if (membership) {
        // Case 2: already a member (active or invited) of this organization.
        throw new ConflictException({
          message: 'This user already belongs to this organization.',
          code: 'USER_ALREADY_IN_ORG',
        });
      }

      // Create a pending membership. Roles are global, so we do NOT touch the
      // existing user's roles when associating them to another organization.
      await this.usersService.createInvitedMembership(existingUser.id, organizationId);

      const hasAccount = !!existingUser.authId;
      const sectionPath = this.getOrganizationsSectionPath();

      const token = this.jwtService.sign(
        {
          email,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          roles: existingUser.roles || [],
          organizationId,
          type: 'invitation',
          isAssociation: true,
        },
        { expiresIn: this.getInvitationExpiration() },
      );

      // Users with an account get a normal login link (they accept from the
      // profile); users that never finished registration get a magic link that
      // completes the account first, then lands on the same section.
      const link = hasAccount
        ? this.buildLoginRedirectLink(sectionPath)
        : this.buildMagicLink(token, sectionPath);

      const { companyName, companyLogoUrl, organizationLanguage } = await this.getOrganizationDetails(
        organizationId,
        invitedBy,
      );

      await this.userInvitationMailService.sendAssociationInvitationEmail({
        inviteeEmail: email,
        inviteeFirstName: existingUser.firstName,
        link,
        companyName,
        companyLogoUrl,
        inviterName: invitedBy?.name,
        hasAccount,
        expirationDays: this.getInvitationExpirationDays(),
        language: organizationLanguage,
      });

      this.logger.info('Association invitation sent', { email, organizationId, hasAccount });
      return { message: 'Invitation sent successfully', email };
    }

    // --- Case 1: brand-new user (first organization) ---
    // Block an email that is another organization's own account email (only
    // relevant when creating a new user; existing users are associated above).
    const existingOrganization = await this.organizationsService.findByEmail(email);
    if (existingOrganization && existingOrganization.id !== organizationId) {
      throw new BadRequestException('This email address is already registered in our database. Please use a different one.');
    }

    const existingUsersInOrg = await this.usersService.findByOrganization(organizationId);
    const isFirstUser = existingUsersInOrg.length === 0;

    const createdUser = await this.usersService.create({
      organizationId,
      firstName,
      lastName,
      email,
      roles,
      isActive: true,
    });
    await this.usersService.createInvitedMembership(createdUser.id, organizationId);

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
        isAssociation: false,
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
      isFirstUser,
    );

    this.logger.info('User invitation sent', { email, organizationId });
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
      this.logger.error('Invitation token verification failed', error);
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

    if (payload.isAssociation) {
      // The account was created through an association link: activate the user's
      // primary (default/first) organization so they have somewhere to land, and
      // leave the association membership pending for explicit acceptance.
      const primaryOrganizationId = user.organizationId;
      if (primaryOrganizationId) {
        await this.usersService.activateMembership(user.id, primaryOrganizationId);
      }
    } else {
      // Primary invite: activate the membership for the invited organization.
      await this.usersService.activateMembership(user.id, payload.organizationId);
    }

    this.logger.info('User invitation completed', {
      email: payload.email,
      organizationId: payload.organizationId,
      isAssociation: !!payload.isAssociation,
    });
    return {
      message: 'Invitation completed successfully',
      user: updatedUser,
      isAssociation: !!payload.isAssociation,
      redirectPath: payload.isAssociation ? this.getOrganizationsSectionPath() : undefined,
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

    // When resending, the user already exists, so they're not the first user
    const isFirstUser = false;

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
      isFirstUser,
    );

    this.logger.info('User invitation resent', { email, organizationId });
    return {
      message: 'Invitation resent successfully',
      email,
    };
  }
}

