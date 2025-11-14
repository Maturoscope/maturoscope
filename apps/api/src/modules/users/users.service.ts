import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, FindOperator } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
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
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly configService: ConfigService,
  ) {}

  private getInvitationExpirationDays(): number {
    const configured = this.configService.get<string>('INVITATION_EXPIRATION_DAYS');
    if (!configured) {
      return 30;
    }
    const numericValue = Number(configured);
    return Number.isNaN(numericValue) ? 30 : numericValue;
  }

  private enrichUserWithStatus(user: User): UserResponseDto {
    const invitationExpirationDays = this.getInvitationExpirationDays();
    const registrationStatus = calculateRegistrationStatus(
      user.authId,
      user.createdAt,
      invitationExpirationDays,
    );

    return {
      id: user.id,
      organizationId: user.organizationId,
      authId: user.authId,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      registrationStatus,
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        avatar: user.organization.avatar,
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

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
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
      relations: ['organization'],
    });
    return this.enrichUsersWithStatus(users);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.enrichUserWithStatus(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
    return user ? this.enrichUserWithStatus(user) : null;
  }

  async findByUserEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
  }

  async findByAuthId(authId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { authId },
      relations: ['organization'],
    });
  }

  async findByOrganization(organizationId: string, excludeEmail?: string): Promise<UserResponseDto[]> {
    const whereCondition: { organizationId: string; email?: FindOperator<string> } = { 
      organizationId 
    };
    
    if (excludeEmail) {
      whereCondition.email = Not(excludeEmail);
    }

    const users = await this.userRepository.find({
      where: whereCondition,
      relations: ['organization'],
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
        throw new ConflictException('Email is already registered');
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
      relations: ['organization'],
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
        throw new ConflictException('Email is already registered');
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
        throw new ConflictException('Email is already registered');
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
        throw new ConflictException('Email is already registered');
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
