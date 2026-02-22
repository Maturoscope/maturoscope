import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OvhS3Service } from '../../common/storage/ovh-s3.service';
import { UploadedFile } from '../../common/types/uploaded-file.type';
import { UsersService } from '../users/users.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { RegistrationStatus } from '../users/helpers/registration-status.helper';
import { validate as uuidValidate } from 'uuid';
import { StructuredLoggerService } from '../../common/logger/structured-logger.service';

@Injectable()
export class OrganizationsService {
  private readonly logger: StructuredLoggerService;

  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly ovhS3: OvhS3Service,
    private readonly usersService: UsersService,
    structuredLogger: StructuredLoggerService,
  ) {
    this.logger = structuredLogger.child('OrganizationsService');
  }

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {

    const existingByKey = await this.organizationRepository.findOne({
      where: { key: createOrganizationDto.key },
    });

    if (existingByKey) {
      throw new ConflictException('Organization key is already registered');
    }

    // Check if email already exists in organizations
    const existingByEmail = await this.organizationRepository.findOne({
      where: { email: createOrganizationDto.email },
    });

    if (existingByEmail) {
      throw new ConflictException('This email address is already registered in our database. Please use a different one.');
    }

    // Check if email exists in users
    const existingUser = await this.usersService.findByEmail(createOrganizationDto.email);
    if (existingUser) {
      throw new ConflictException('This email address is already registered in our database. Please use a different one.');
    }

    const organization = this.organizationRepository.create(createOrganizationDto);
    return await this.organizationRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findAllWithRegistrationStatus(): Promise<OrganizationResponseDto[]> {
    const organizations = await this.findAll();
    
    const organizationsWithStatus = await Promise.all(
      organizations.map(async (org) => {
        try {
          // Get all users for this organization without excluding any email
          // We use findByOrganization without excludeEmail to get all users including the first one
          const users = await this.usersService.findByOrganization(org.id);
          
          if (users && users.length > 0) {
            // Find the first user created (oldest by createdAt)
            // The array is ordered DESC, so the oldest is at the end
            const firstUser = users.reduce((oldest, current) => {
              const oldestDate = new Date(oldest.createdAt).getTime();
              const currentDate = new Date(current.createdAt).getTime();
              return currentDate < oldestDate ? current : oldest;
            });
            
            // Use the registrationStatus that's already calculated by the backend
            return {
              id: org.id,
              name: org.name,
              email: org.email,
              key: org.key,
              isActive: org.status === 'active',
              createdAt: org.createdAt,
              registrationStatus: firstUser.registrationStatus || 'pending',
              userEmail: firstUser.email,
            };
          }
        } catch (error) {
          this.logger.error('Error getting registration status for organization', error, { organizationId: org.id });
        }
        
        // If no user found, return organization with pending status
        return {
          id: org.id,
          name: org.name,
          email: org.email,
          key: org.key,
          isActive: org.status === 'active',
          createdAt: org.createdAt,
          registrationStatus: 'pending' as RegistrationStatus,
          userEmail: org.email,
        };
      })
    );
    
    return organizationsWithStatus;
  }

  async findOne(id: string): Promise<Organization> {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const organization = await this.organizationRepository.findOne({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }

    return organization;
  }

  async findByKey(key: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { key }
    });

    if (!organization) {
      throw new NotFoundException(`Organization with key ${key} not found`);
    }

    return organization;
  }

  async findByEmail(email: string): Promise<Organization | null> {
    return await this.organizationRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<Organization> {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const organization = await this.findOne(id);

    if (updateOrganizationDto.key && updateOrganizationDto.key !== organization.key) {
      const existingByKey = await this.findByKey(updateOrganizationDto.key);
      if (existingByKey) {
        throw new ConflictException('Organization key is already registered');
      }
    }

    if (updateOrganizationDto.email && updateOrganizationDto.email !== organization.email) {
      const existingByEmail = await this.findByEmail(updateOrganizationDto.email);
      if (existingByEmail) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
      // Check if email exists in users
      const existingUser = await this.usersService.findByEmail(updateOrganizationDto.email);
      if (existingUser) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
    }

    Object.assign(organization, updateOrganizationDto);
    return await this.organizationRepository.save(organization);
  }

  async updateAvatar(id: string, file: UploadedFile): Promise<Organization> {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    if (!file || !file.buffer || !file.mimetype) {
      throw new BadRequestException('Invalid file upload');
    }

    const organization = await this.findOne(id);
    const extension = file.mimetype.split('/')[1] || 'bin';
    const key = `organizations/${id}/avatar.${extension}`;

    const { url } = await this.ovhS3.uploadObject(file, key);

    organization.avatar = url;
    return await this.organizationRepository.save(organization);
  }

  async updateAvatarByUserEmail(email: string | undefined, file: UploadedFile): Promise<Organization> {
    if (!email) {
      throw new UnauthorizedException('Missing auth token or email claim');
    }
    const user = await this.usersService.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (!user.organizationId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    return this.updateAvatar(user.organizationId, file);
  }

  async removeAvatarByUserEmail(email: string | undefined): Promise<Organization> {
    if (!email) {
      throw new UnauthorizedException('Missing auth token or email claim');
    }
    const user = await this.usersService.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (!user.organizationId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    
    const organization = await this.findOne(user.organizationId);
    organization.avatar = '';
    return await this.organizationRepository.save(organization);
  }

  async updateSignatureByUserEmail(email: string | undefined, file: UploadedFile): Promise<Organization> {
    if (!email) {
      throw new UnauthorizedException('Missing auth token or email claim');
    }
    const user = await this.usersService.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (!user.organizationId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    return this.updateSignature(user.organizationId, file);
  }

  async updateSignature(organizationId: string, file: UploadedFile): Promise<Organization> {
    if (!uuidValidate(organizationId)) {
      throw new BadRequestException(`Invalid UUID format: ${organizationId}`);
    }

    if (!file) {
      throw new BadRequestException('No signature file provided');
    }

    // Validate file type (images only for signatures)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only images are allowed for signatures.');
    }

    // Validate file size (max 4MB)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size && file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 4MB.');
    }

    const organization = await this.findOne(organizationId);
    const extension = file.mimetype.split('/')[1] || 'bin';
    const key = `organizations/${organizationId}/pdfsignature.${extension}`;

    const { url } = await this.ovhS3.uploadObject(file, key);

    organization.signature = url;
    return await this.organizationRepository.save(organization);
  }

  async removeSignatureByUserEmail(email: string | undefined): Promise<Organization> {
    if (!email) {
      throw new UnauthorizedException('Missing auth token or email claim');
    }
    const user = await this.usersService.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (!user.organizationId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    
    const organization = await this.findOne(user.organizationId);
    organization.signature = '';
    return await this.organizationRepository.save(organization);
  }

  async updateLanguageByUserEmail(email: string | undefined, language: string): Promise<Organization> {
    if (!email) {
      throw new UnauthorizedException('Missing auth token or email claim');
    }
    
    if (!language) {
      throw new BadRequestException('Language is required');
    }

    // Validate language
    const allowedLanguages = ['EN', 'FR'];
    if (!allowedLanguages.includes(language)) {
      throw new BadRequestException(`Invalid language. Allowed values: ${allowedLanguages.join(', ')}`);
    }

    const user = await this.usersService.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (!user.organizationId) {
      throw new BadRequestException('User is not associated with an organization');
    }
    
    const organization = await this.findOne(user.organizationId);
    organization.language = language;
    return await this.organizationRepository.save(organization);
  }

  async updateProfileByUserEmail(email: string | undefined, updateData: { name: string; key: string; email: string }): Promise<Organization> {
    if (!email) {
      throw new UnauthorizedException('Missing auth token or email claim');
    }

    const { name, key, email: newEmail } = updateData;

    if (!name || !key || !newEmail) {
      throw new BadRequestException('Name, key, and email are required');
    }

    const user = await this.usersService.findByUserEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    if (!user.organizationId) {
      throw new BadRequestException('User is not associated with an organization');
    }

    const organization = await this.findOne(user.organizationId);

    // Check for conflicts if changing key or email
    if (key !== organization.key) {
      const existingByKey = await this.organizationRepository.findOne({ where: { key } });
      if (existingByKey && existingByKey.id !== organization.id) {
        throw new ConflictException('Organization key is already registered');
      }
    }

    if (newEmail !== organization.email) {
      const existingByEmail = await this.organizationRepository.findOne({ where: { email: newEmail } });
      if (existingByEmail && existingByEmail.id !== organization.id) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
      // Check if email exists in users
      const existingUser = await this.usersService.findByEmail(newEmail);
      if (existingUser) {
        throw new ConflictException('This email address is already registered in our database. Please use a different one.');
      }
    }

    organization.name = name;
    organization.key = key;
    organization.email = newEmail;

    return await this.organizationRepository.save(organization);
  }

  async remove(id: string): Promise<void> {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);
  }
}
