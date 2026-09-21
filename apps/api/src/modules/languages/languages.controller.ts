import {
  Controller,
  Get,
  Patch,
  Put,
  Param,
  Body,
  Query,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Auth } from '../../common/decorators/auth.decorator';
import { AuthenticatedUser } from '../../common/auth-module/interfaces/authenticated-user.interface';
import { UsersService } from '../users/users.service';
import { LanguagesService } from './languages.service';
import {
  SetLanguageEnabledDto,
  SetDefaultLanguageDto,
  SaveTranslationsDto,
} from './dto/translation.dto';

@ApiTags('languages')
@Controller('languages')
export class LanguagesController {
  constructor(
    private readonly languagesService: LanguagesService,
    private readonly usersService: UsersService,
  ) {}

  private async getOrganizationId(
    req: Request & { user?: AuthenticatedUser },
  ): Promise<string> {
    const email = req.user?.email;
    if (!email) {
      throw new ForbiddenException('Unable to determine requester identity');
    }
    const requestedOrganizationId = req.headers['x-active-organization'] as
      | string
      | undefined;
    const organizationId = await this.usersService.resolveActiveOrganizationId(
      email,
      requestedOrganizationId,
    );
    if (!organizationId) {
      throw new ForbiddenException('User or organization not found');
    }
    return organizationId;
  }

  @Get('public/:key')
  @ApiOperation({
    summary: 'Get live languages for an organization (PUBLIC)',
    description:
      'Returns the default language and the Live (fully translated) languages a ' +
      'visitor can choose, resolved by the organization public key. Used by the ' +
      'end-user application.',
  })
  @ApiParam({ name: 'key', description: 'Organization public key' })
  @ApiResponse({ status: 200, description: 'Default + live languages' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getPublicLanguages(@Param('key') key: string) {
    return this.languagesService.getPublicLanguages(key);
  }

  @Get()
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get language availability',
    description:
      "Lists the 6 languages with their enabled flag and derived Live/Draft status for the current user's organization.",
  })
  @ApiResponse({ status: 200, description: 'Language statuses' })
  async getLanguages(@Req() req: Request & { user?: AuthenticatedUser }) {
    const organizationId = await this.getOrganizationId(req);
    return this.languagesService.getLanguageStatuses(organizationId);
  }

  @Get('services-status')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get per-service translation status',
    description:
      'Returns Done/Missing per service across the enabled non-default languages.',
  })
  @ApiResponse({ status: 200, description: 'Per-service translation statuses' })
  async getServicesStatus(@Req() req: Request & { user?: AuthenticatedUser }) {
    const organizationId = await this.getOrganizationId(req);
    return this.languagesService.getServiceTranslationStatuses(organizationId);
  }

  @Get('translations')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get translations for a language',
    description:
      'Source (default-language) text plus target text and per-field status for the services being translated. Scope to one service with serviceId.',
  })
  @ApiQuery({ name: 'language', required: true, example: 'es' })
  @ApiQuery({ name: 'serviceId', required: false })
  @ApiResponse({ status: 200, description: 'Translations view' })
  async getTranslations(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Query('language') language: string,
    @Query('serviceId') serviceId?: string,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.languagesService.getTranslations(
      organizationId,
      language,
      serviceId,
    );
  }

  @Put('translations')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Save translations for a language',
    description:
      'Upserts target-language name/description for one or more services.',
  })
  @ApiResponse({ status: 200, description: 'Translations saved' })
  async saveTranslations(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Body() dto: SaveTranslationsDto,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.languagesService.saveTranslations(organizationId, dto);
  }

  // Declared before ":code" so the literal path wins the route match.
  @Patch('default')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Set the default language',
    description: 'Only a fully translated (Live) language can be set as default.',
  })
  @ApiResponse({ status: 200, description: 'Default language updated' })
  @ApiResponse({ status: 400, description: 'Language is not Live' })
  async setDefaultLanguage(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Body() dto: SetDefaultLanguageDto,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.languagesService.setDefaultLanguage(organizationId, dto.language);
  }

  @Patch(':code')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Enable or disable a language',
    description:
      'Turns a language on/off. The default language cannot be turned off. Translations are kept when a language is turned off.',
  })
  @ApiParam({ name: 'code', example: 'es' })
  @ApiResponse({ status: 200, description: 'Language toggled' })
  @ApiResponse({ status: 400, description: 'Invalid language or default off' })
  async setLanguageEnabled(
    @Req() req: Request & { user?: AuthenticatedUser },
    @Param('code') code: string,
    @Body() dto: SetLanguageEnabledDto,
  ) {
    const organizationId = await this.getOrganizationId(req);
    return this.languagesService.setLanguageEnabled(
      organizationId,
      code,
      dto.enabled,
    );
  }
}
