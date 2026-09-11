import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, FindOperator } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { UserOrganization, MembershipStatus } from './entities/user-organization.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Organization } from '../organizations/entities/organization.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { calculateRegistrationStatus } from './helpers/registration-status.helper';
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
  ) {}

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
    membership.joinedAt = membership.joinedAt ?? new Date();

    const hasDefault = await this.membershipRepository.count({
      where: { userId, status: MembershipStatus.ACTIVE, isDefault: true },
    });
    if (hasDefault === 0) {
      membership.isDefault = true;
    }

    return this.membershipRepository.save(membership);
  }

  /** Whether the user has an active membership in the given organization. */
  async hasActiveMembership(userId: string, organizationId: string): Promise<boolean> {
    const count = await this.membershipRepository.count({
      where: { userId, organizationId, status: MembershipStatus.ACTIVE },
    });
    return count > 0;
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

  /** Decline a pending invitation: remove the invited membership. */
  async declineInvitation(userId: string, organizationId: string): Promise<void> {
    const membership = await this.getMembership(userId, organizationId);
    if (!membership || membership.status !== MembershipStatus.INVITED) {
      throw new NotFoundException('No pending invitation for this organization');
    }
    await this.membershipRepository.remove(membership);
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
    await this.membershipRepository.update({ userId, isDefault: true }, { isDefault: false });
    membership.isDefault = true;
    await this.membershipRepository.save(membership);
    // Keep the legacy organizationId column in sync with the default membership.
    await this.userRepository.update({ id: userId }, { organizationId });
  }

  /** The user's default active organization id, if any. */
  async getDefaultOrganizationId(userId: string): Promise<string | null> {
    const membership = await this.membershipRepository.findOne({
      where: { userId, status: MembershipStatus.ACTIVE, isDefault: true },
    });
    return membership?.organizationId ?? null;
  }

  /**
   * Resolves which organization a request should operate on. A requested id
   * (from the active-organization header/cookie) is honoured only if the user
   * has an active membership for it; otherwise we fall back to their default
   * membership, and finally to the legacy `organizationId` column.
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
        },
      });
      if (membership) return membership.organizationId;
    }

    const defaultOrganizationId = await this.getDefaultOrganizationId(user.id);
    return defaultOrganizationId ?? user.organizationId ?? null;
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
    let pendingInvitationsCount: number | undefined;
    if (user.memberships) {
      defaultOrganizationId = user.memberships.find(
        (m) => m.status === MembershipStatus.ACTIVE && m.isDefault,
      )?.organizationId;
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
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      registrationStatus,
      defaultOrganizationId,
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

  async findByOrganization(organizationId: string, excludeEmail?: string): Promise<UserResponseDto[]> {
    const whereCondition: { organizationId: string; email?: FindOperator<string> } = { 
      organizationId 
    };
    
    // Note: excludeEmail parameter is kept for backward compatibility but not used
    // We want to show all users including the admin (user with same email as organization)
    // The admin's switch will be disabled in the frontend instead

    const users = await this.userRepository.find({
      where: whereCondition,
      relations: { organization: true },
      order: { createdAt: 'DESC' },
    });
    return this.enrichUsersWithStatus(users);
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
