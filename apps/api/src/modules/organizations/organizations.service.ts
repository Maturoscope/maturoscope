import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { OvhS3Service } from '../../common/storage/ovh-s3.service';
import { UploadedFile } from '../../common/types/uploaded-file.type';
import { UsersService } from '../users/users.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    private readonly ovhS3: OvhS3Service,
    private readonly usersService: UsersService,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto): Promise<Organization> {

    const existingByKey = await this.organizationRepository.findOne({
      where: { key: createOrganizationDto.key },
    });

    if (existingByKey) {
      throw new ConflictException('Organization key is already registered');
    }

    const existingByEmail = await this.organizationRepository.findOne({
      where: { email: createOrganizationDto.email },
    });

    if (existingByEmail) {
      throw new ConflictException('Organization email is already registered');
    }

    const organization = this.organizationRepository.create(createOrganizationDto);
    return await this.organizationRepository.save(organization);
  }

  async findAll(): Promise<Organization[]> {
    return await this.organizationRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['users'],
    });
  }

  async findOne(id: string): Promise<Organization> {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['users'],
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
      relations: ['users'],
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
        throw new ConflictException('Organization email is already registered');
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

  async remove(id: string): Promise<void> {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }

    const organization = await this.findOne(id);
    await this.organizationRepository.remove(organization);
  }
}
