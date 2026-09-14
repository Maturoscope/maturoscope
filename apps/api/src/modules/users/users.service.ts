import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserOrganization, MembershipStatus } from './entities/user-organization.entity';
import { OvhS3Service } from '../../common/storage/ovh-s3.service';
import { UploadedFile } from '../../common/types/uploaded-file.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Organization } from '../organizations/entities/organization.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { calculateRegistrationStatus, membershipRegistrationStatus } from './helpers/registration-status.helper';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserOrganization)
    private readonly membershipRepository: Repository<UserOrganization>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly configService: ConfigService,
    private readonly ovhS3: OvhS3Service,
  ) {}

  // Allowed avatar types (validated server-side, not only in the Next proxy).
  private static readonly AVATAR_ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/svg+xml',
  ];
  private static readonly AVATAR_MAX_SIZE = 4 * 1024 * 1024; // 4MB

  /** Stable per-user avatar key (no extension) so replacing overwrites in place. */
  private avatarKey(userId: string): string {
    return `users/${userId}/avatar`;
  }

  /** Uploads a profile picture to object storage and stores its URL on the user. */
  async updateAvatarByEmail(email: string, file: UploadedFile): Promise<UserResponseDto> {
    if (!file || !file.buffer || !file.mimetype) {
      throw new BadRequestException('Invalid file upload');
    }
    // Validate on the backend too: a direct API call must not bypass the proxy.
    if (!UsersService.AVATAR_ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG or SVG are allowed.');
    }
    if (file.buffer.length > UsersService.AVATAR_MAX_SIZE) {
      throw new BadRequestException('File size exceeds 4MB limit.');
    }
    const user = await this.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    // Fixed key (no extension) — avoids orphaned objects when the type changes.
    const { url } = await this.ovhS3.uploadObject(file, this.avatarKey(user.id));
    user.avatar = url;
    await this.userRepository.save(user);
    return (await this.findByEmail(email))!;
  }

  /** Clears the user's profile picture (also removes the object from storage). */
  async removeAvatarByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (user.avatar) {
      await this.ovhS3.deleteObject(this.avatarKey(user.id));
    }
    user.avatar = null;
    await this.userRepository.save(user);
    return (await this.findByEmail(email))!;
  }

  /**
   * Active memberships for a user, ordered with the default first, then by join
   * date. Includes the organization relation.
   */
  async getActiveMemberships(userId: string): Promise<UserOrganization[]> {
    return this.membershipRepository.find({
      where: { userId, status: MembershipStatus.ACTIVE },
      relations: { organization: true },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  /** A single membership for (user, organization), if any. */
  async getMembership(
    userId: string,
    organizationId: string,
  ): Promise<UserOrganization | null> {
    return this.membershipRepository.findOne({
      where: { userId, organizationId },
    });
  }

  /**
   * Ensures an invited membership exists for (user, organization). If one already
   * exists it is returned untouched (its invitedAt is refreshed). The first
   * membership a user ever gets becomes their default.
   */
  async createInvitedMembership(
    userId: string,
    organizationId: string,
  ): Promise<UserOrganization> {
    const existing = await this.getMembership(userId, organizationId);
    if (existing) {
      existing.invitedAt = new Date();
      return this.membershipRepository.save(existing);
    }

    const membershipsCount = await this.membershipRepository.count({
      where: { userId },
    });

    const membership = this.membershipRepository.create({
      userId,
      organizationId,
      status: MembershipStatus.INVITED,
      isDefault: membershipsCount === 0,
      invitedAt: new Date(),
    });
    return this.membershipRepository.save(membership);
  }

  /**
   * Activates a membership (invited -> active). If the user has no default active
   * organization yet, this one becomes the default.
   */
  async activateMembership(
    userId: string,
    organizationId: string,
  ): Promise<UserOrganization | null> {
    const membership = await this.getMembership(userId, organizationId);
    if (!membership) return null;

    membership.status = MembershipStatus.ACTIVE;
    membership.isActive = true;
    membership.joinedAt = membership.joinedAt ?? new Date();

    const hasDefault = await this.membershipRepository.count({
      where: { userId, status: MembershipStatus.ACTIVE, isDefault: true },
    });
    if (hasDefault === 0) {
      membership.isDefault = true;
    }

    return this.membershipRepository.save(membership);
  }

  /**
   * Whether the user can access the organization: an accepted membership that is
   * also enabled (a disabled membership blocks access to that org only).
   */
  async hasActiveMembership(userId: string, organizationId: string): Promise<boolean> {
    const count = await this.membershipRepository.count({
      where: { userId, organizationId, status: MembershipStatus.ACTIVE, isActive: true },
    });
    return count > 0;
  }

  /**
   * Resets an existing membership to a fresh pending invitation (used when
   * resending to an expired or rejected membership).
   */
  async resetMembershipToInvited(
    userId: string,
    organizationId: string,
  ): Promise<UserOrganization> {
    const membership = await this.getMembership(userId, organizationId);
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }
    membership.status = MembershipStatus.INVITED;
    membership.isActive = true;
    membership.invitedAt = new Date();
    return this.membershipRepository.save(membership);
  }

  /** Enable/disable a user's membership in an organization (per-org access). */
  async setMembershipActive(
    userId: string,
    organizationId: string,
    isActive: boolean,
  ): Promise<UserOrganization> {
    const membership = await this.getMembership(userId, organizationId);
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }
    membership.isActive = isActive;
    return this.membershipRepository.save(membership);
  }

  /** All memberships for a user (active + invited), with the organization. */
  async getMembershipsOverview(userId: string): Promise<UserOrganization[]> {
    return this.membershipRepository.find({
      where: { userId },
      relations: { organization: true },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  /** Accept a pending invitation: invited -> active. */
  async acceptInvitation(userId: string, organizationId: string): Promise<UserOrganization> {
    const membership = await this.getMembership(userId, organizationId);
    if (!membership || membership.status !== MembershipStatus.INVITED) {
      throw new NotFoundException('No pending invitation for this organization');
    }
    return (await this.activateMembership(userId, organizationId))!;
  }

  /**
   * Decline a pending invitation: keep the membership as rejected so the
   * organization still sees it (red + resend) and can re-invite later.
   */
  async declineInvitation(userId: string, organizationId: string): Promise<void> {
    const membership = await this.getMembership(userId, organizationId);
    if (!membership || membership.status !== MembershipStatus.INVITED) {
      throw new NotFoundException('No pending invitation for this organization');
    }
    membership.status = MembershipStatus.REJECTED;
    await this.membershipRepository.save(membership);
  }

  /** Leave an organization: remove the active membership (never the default). */
  async leaveOrganization(userId: string, organizationId: string): Promise<void> {
    const membership = await this.getMembership(userId, organizationId);
    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new NotFoundException('You are not a member of this organization');
    }
    if (membership.isDefault) {
      throw new BadRequestException(
        'You cannot leave your default organization. Set another one as default first.',
      );
    }
    await this.membershipRepository.remove(membership);
  }

  /** Change the default organization (must be an active membership). */
  async setDefaultOrganization(userId: string, organizationId: string): Promise<void> {
    const membership = await this.getMembership(userId, organizationId);
    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      throw new BadRequestException('You can only set an active organization as default');
    }
    // Atomic: unset the previous default, set the new one, and keep the legacy
    // organizationId column in sync — so a failure can't leave the user default-less.
    await this.membershipRepository.manager.transaction(async (tx) => {
      await tx.update(UserOrganization, { userId, isDefault: true }, { isDefault: false });
      await tx.update(UserOrganization, { id: membership.id }, { isDefault: true });
      await tx.update(User, { id: userId }, { organizationId });
    });
  }

  /** The user's default active organization id, if any. */
  async getDefaultOrganizationId(userId: string): Promise<string | null> {
    const membership = await this.membershipRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE, isDefault: true },
    });
    return membership?.organizationId ?? null;
  }

  /**
   * The organization a session should start on: the accessible (active + enabled)
   * default, else the first accessible membership, else null (no access).
   */
  async getSessionOrganizationId(userId: string): Promise<string | null> {
    const accessible = await this.membershipRepository.find({
      where: { userId, status: MembershipStatus.ACTIVE, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
    return accessible[0]?.organizationId ?? null;
  }

  /**
   * Resolves which organization a request should operate on. A requested id
   * (from the active-organization header/cookie) is honoured only if the user
   * has an accessible membership for it; otherwise we fall back to their
   * accessible default / first accessible organization.
   */
  async resolveActiveOrganizationId(
    email: string,
    requestedOrganizationId?: string,
  ): Promise<string | null> {
    const user = await this.findByUserEmail(email);
    if (!user) return null;

    if (requestedOrganizationId) {
      const membership = await this.membershipRepository.findOne({
        where: {
          userId: user.id,
          organizationId: requestedOrganizationId,
          status: MembershipStatus.ACTIVE,
          isActive: true,
        },
      });
      if (membership) return membership.organizationId;
    }

    return this.getSessionOrganizationId(user.id);
  }

  private getInvitationExpirationDays(): number {
    // First try to use INVITATION_TOKEN_EXPIRATION (same as JWT token expiration)
    const tokenExpiration = this.configService.get<string>('INVITATION_TOKEN_EXPIRATION');
    
    if (tokenExpiration) {
      // If it's a number (seconds), convert to days
      const numericValue = Number(tokenExpiration);
      if (!Number.isNaN(numericValue)) {
        // Convert seconds to days
        return Math.floor(numericValue / (24 * 60 * 60));
      }
      
      // If it's a string like '30d', '7d', etc., parse it
      const match = tokenExpiration.match(/^(\d+)([dhms])$/);
      if (match) {
        const value = Number(match[1]);
        const unit = match[2];
        
        switch (unit) {
          case 'd':
            return value;
          case 'h':
            return value / 24;
          case 'm':
            return value / (24 * 60);
          case 's':
            return value / (24 * 60 * 60);
          default:
            return 30;
        }
      }
    }
    
    // Fallback to INVITATION_EXPIRATION_DAYS for backward compatibility
    const expirationDays = this.configService.get<string>('INVITATION_EXPIRATION_DAYS');
    if (expirationDays) {
      const numericValue = Number(expirationDays);
      return Number.isNaN(numericValue) ? 30 : numericValue;
    }
    
    // Default to 30 days
    return 30;
  }

  private enrichUserWithStatus(user: User): UserResponseDto {
    const invitationExpirationDays = this.getInvitationExpirationDays();
    const registrationStatus = calculateRegistrationStatus(
      user.authId,
      user.createdAt,
      invitationExpirationDays,
    );

    // Derive multi-organization context when memberships have been loaded.
    let defaultOrganizationId: string | undefined;
    let sessionOrganizationId: string | undefined;
    let pendingInvitationsCount: number | undefined;
    if (user.memberships) {
      defaultOrganizationId = user.memberships.find(
        (m) => m.status === MembershipStatus.ACTIVE && m.isDefault,
      )?.organizationId;
      // Accessible (accepted + enabled) organizations, default first — the one a
      // session should land on.
      const accessible = user.memberships
        .filter((m) => m.status === MembershipStatus.ACTIVE && m.isActive)
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
      sessionOrganizationId = accessible[0]?.organizationId;
      pendingInvitationsCount = user.memberships.filter(
        (m) => m.status === MembershipStatus.INVITED,
      ).length;
    }

    return {
      id: user.id,
      organizationId: user.organizationId,
      authId: user.authId,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      isSuperAdmin: user.isSuperAdmin,
      avatar: user.avatar,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      registrationStatus,
      defaultOrganizationId,
      sessionOrganizationId,
      pendingInvitationsCount,
      organization: user.organization ? {
        id: user.organization.id,
        key: user.organization.key,
        name: user.organization.name,
        email: user.organization.email,
        avatar: user.organization.avatar,
        signature: user.organization.signature,
        language: user.organization.language,
        font: user.organization.font,
        theme: user.organization.theme,
        url: user.organization.url,
      } : undefined,
    };
  }

  private enrichUsersWithStatus(users: User[]): UserResponseDto[] {
    return users.map((user) => this.enrichUserWithStatus(user));
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validate organization exists
    const organization = await this.organizationRepository.findOne({
      where: { id: createUserDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${createUserDto.organizationId} not found`);
    }

    // Check if email already exists in users
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('This email address is already registered in our database. Please use a different one.');
    }

    // Check if email exists in organizations
    const existingOrganization = await this.organizationRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingOrganization) {
      // Allow the email if it's the organization's own email and the user is being created for that same organization
      if (existingOrganization.id !== createUserDto.organizationId) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
      // If it's the same organization's email, we allow it (it's the first user being created for this org)
    }

    // Create user in local database
    const user = this.userRepository.create({
      ...createUserDto,
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true,
    });
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      order: { createdAt: 'DESC' },
      relations: { organization: true },
    });
    return this.enrichUsersWithStatus(users);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: { organization: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.enrichUserWithStatus(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: { organization: true, memberships: { organization: true } },
    });
    return user ? this.enrichUserWithStatus(user) : null;
  }

  async findByUserEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: { organization: true },
    });
  }

  async findByAuthId(authId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { authId },
      relations: { organization: true },
    });
  }

  async findByOrganization(organizationId: string, _excludeEmail?: string): Promise<UserResponseDto[]> {
    // Membership-based: a user belongs to an organization through user_organizations
    // (active or invited), not through the legacy organizationId column — otherwise
    // users associated to additional organizations would be missing here.
    const memberships = await this.membershipRepository.find({
      where: { organizationId },
      relations: { user: { organization: true } },
      order: { createdAt: 'DESC' },
    });

    const expirationDays = this.getInvitationExpirationDays();

    // Registration status and active flag come from the membership, not the
    // global user, so each organization sees its own view of the member.
    return memberships
      .filter((membership) => !!membership.user)
      .map((membership) => ({
        ...this.enrichUserWithStatus(membership.user),
        isActive: membership.isActive,
        registrationStatus: membershipRegistrationStatus(
          membership.status,
          membership.invitedAt,
          expirationDays,
        ),
      }));
  }

  async updateUser(email: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findByUserEmail(updateData.email);
      if (existingUser) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
      // Check if email exists in organizations
      const existingOrganization = await this.organizationRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingOrganization) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
    }
    
    Object.assign(user, updateData);
    return await this.userRepository.save(user);
  }

  async getUserRoles(userId: string): Promise<string[]> {
    const user = await this.findOne(userId);
    return user.roles || [];
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Validate UUID format
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    // Get raw user for update
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { organization: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If organizationId is being updated, check that the organization exists
    if (updateUserDto.organizationId && updateUserDto.organizationId !== user.organizationId) {
      const organization = await this.organizationRepository.findOne({
        where: { id: updateUserDto.organizationId },
      });
      if (!organization) {
        throw new NotFoundException(`Organization with ID ${updateUserDto.organizationId} not found`);
      }
    }

    // If email is being updated, check that it doesn't already exist
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUserResponse = await this.findByEmail(updateUserDto.email);
      if (existingUserResponse) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
      // Check if email exists in organizations
      const existingOrganization = await this.organizationRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingOrganization) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    return this.enrichUserWithStatus(updatedUser);
  }

  async updateByEmail(email: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const userResponse = await this.findByEmail(email);
    
    if (!userResponse) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // Get the raw user for update
    const user = await this.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (updateUserDto.organizationId && updateUserDto.organizationId !== user.organizationId) {
      const organization = await this.organizationRepository.findOne({
        where: { id: updateUserDto.organizationId },
      });
      if (!organization) {
        throw new NotFoundException(`Organization with ID ${updateUserDto.organizationId} not found`);
      }
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
      // Check if email exists in organizations
      const existingOrganization = await this.organizationRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingOrganization) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    return this.enrichUserWithStatus(updatedUser);
  }

  async updateUserWithNewCreatedAt(email: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.findByUserEmail(updateData.email);
      if (existingUser) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
      // Check if email exists in organizations
      const existingOrganization = await this.organizationRepository.findOne({
        where: { email: updateData.email },
      });
      if (existingOrganization) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
    }
    
    Object.assign(user, updateData);
    // Reset createdAt to current date
    user.createdAt = new Date();
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);
  }
}
