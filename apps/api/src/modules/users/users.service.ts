import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Organization } from '../organizations/entities/organization.entity';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

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
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['organization'],
    });
  }

  async findOne(id: string): Promise<User> {
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

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['organization'],
    });
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

  async findByOrganization(organizationId: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { organizationId },
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateUser(email: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    
    // If email is being updated, check that it doesn't already exist
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

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Validate UUID format
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const user = await this.findOne(id);

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
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email is already registered');
      }
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    // Validate UUID format
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
