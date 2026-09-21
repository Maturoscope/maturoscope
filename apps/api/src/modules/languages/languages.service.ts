import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { ServiceTranslation } from '../services/entities/service-translation.entity';
import { OrganizationLanguage } from '../organizations/entities/organization-language.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import {
  SUPPORTED_LANGUAGES,
  LanguageCode,
  normalizeLanguage,
  isSupportedLanguage,
} from '../../common/i18n/languages';
import {
  LanguageStatusDto,
  ServiceTranslationStatusDto,
} from './dto/language-status.dto';
import {
  GetTranslationsResponseDto,
  SaveTranslationsDto,
  ServiceTranslationEntryDto,
} from './dto/translation.dto';

/**
 * Derives the language availability (Live/Draft) for an organization and the
 * translation completeness (Done/Missing) for its services, from the
 * `service_translations` and `organization_languages` tables.
 *
 * Rules (confirmed with the client):
 *  - A translation is complete when BOTH name and description are non-empty.
 *  - A language is Live when it is enabled and every ACTIVE service is complete
 *    in that language (an org with no active services is trivially Live).
 *  - The default language is always Live.
 *  - A service is Done when it is complete in every enabled non-default language.
 *
 * This module owns no HTTP surface (that arrives in the next phase); it is the
 * reusable computation layer.
 */
@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(OrganizationLanguage)
    private readonly organizationLanguageRepository: Repository<OrganizationLanguage>,
    @InjectRepository(ServiceTranslation)
    private readonly serviceTranslationRepository: Repository<ServiceTranslation>,
    private readonly organizationsService: OrganizationsService,
  ) {}

  /** Whether a translation row counts as complete (both fields present). */
  private isComplete(translation?: ServiceTranslation): boolean {
    return (
      !!translation?.name?.trim() && !!translation?.description?.trim()
    );
  }

  private translationFor(
    service: Service,
    code: LanguageCode,
  ): ServiceTranslation | undefined {
    return service.translations?.find((t) => t.languageCode === code);
  }

  /** The organization's default (source) language, normalized to a supported code. */
  async getDefaultLanguage(organizationId: string): Promise<LanguageCode> {
    const organization = await this.organizationsService.findOne(organizationId);
    return normalizeLanguage(organization.defaultLanguage);
  }

  /** Codes the organization has turned on (always includes the default). */
  async getEnabledLanguages(organizationId: string): Promise<LanguageCode[]> {
    const [defaultLanguage, rows] = await Promise.all([
      this.getDefaultLanguage(organizationId),
      this.organizationLanguageRepository.find({ where: { organizationId } }),
    ]);
    const enabled = new Set<LanguageCode>([defaultLanguage]);
    for (const row of rows) {
      if (row.enabled) {
        const code = normalizeLanguage(row.languageCode);
        if ((SUPPORTED_LANGUAGES as readonly string[]).includes(row.languageCode)) {
          enabled.add(code);
        }
      }
    }
    return SUPPORTED_LANGUAGES.filter((code) => enabled.has(code));
  }

  /**
   * Full status for the 6 languages of an organization: enabled flag, default
   * flag, derived Live/Draft/off, and translation progress over active services.
   */
  async getLanguageStatuses(
    organizationId: string,
  ): Promise<LanguageStatusDto[]> {
    const [defaultLanguage, orgLanguages, activeServices] = await Promise.all([
      this.getDefaultLanguage(organizationId),
      this.organizationLanguageRepository.find({ where: { organizationId } }),
      this.serviceRepository.find({
        where: { organizationId, isActive: true },
        relations: ['translations'],
      }),
    ]);

    const enabledByCode = new Map<string, boolean>();
    for (const row of orgLanguages) {
      enabledByCode.set(normalizeLanguage(row.languageCode), row.enabled);
    }

    const total = activeServices.length * 2;

    return SUPPORTED_LANGUAGES.map((code) => {
      const isDefault = code === defaultLanguage;
      const enabled = isDefault || enabledByCode.get(code) === true;

      let translated = 0;
      for (const service of activeServices) {
        const translation = this.translationFor(service, code);
        if (translation?.name?.trim()) translated += 1;
        if (translation?.description?.trim()) translated += 1;
      }

      let status: LanguageStatusDto['status'];
      if (!enabled) {
        status = 'off';
      } else if (isDefault || total === 0 || translated === total) {
        status = 'live';
      } else {
        status = 'draft';
      }

      return { code, isDefault, enabled, status, translated, total };
    });
  }

  /**
   * Per-service Done/Missing across the enabled non-default languages. Covers
   * every service of the org (the services table lists active and inactive).
   */
  async getServiceTranslationStatuses(
    organizationId: string,
  ): Promise<ServiceTranslationStatusDto[]> {
    const [defaultLanguage, enabledLanguages, services] = await Promise.all([
      this.getDefaultLanguage(organizationId),
      this.getEnabledLanguages(organizationId),
      this.serviceRepository.find({
        where: { organizationId },
        relations: ['translations'],
      }),
    ]);

    const targetLanguages = enabledLanguages.filter(
      (code) => code !== defaultLanguage,
    );

    return services.map((service) =>
      this.computeServiceStatus(service, targetLanguages),
    );
  }

  /** Done/Missing for a single service (used by the per-service edit action). */
  async getServiceTranslationStatus(
    organizationId: string,
    serviceId: string,
  ): Promise<ServiceTranslationStatusDto> {
    const [defaultLanguage, enabledLanguages, service] = await Promise.all([
      this.getDefaultLanguage(organizationId),
      this.getEnabledLanguages(organizationId),
      this.serviceRepository.findOne({
        where: { id: serviceId, organizationId },
        relations: ['translations'],
      }),
    ]);

    if (!service) {
      return { serviceId, status: 'done', missingLanguages: [] };
    }

    const targetLanguages = enabledLanguages.filter(
      (code) => code !== defaultLanguage,
    );
    return this.computeServiceStatus(service, targetLanguages);
  }

  private computeServiceStatus(
    service: Service,
    targetLanguages: LanguageCode[],
  ): ServiceTranslationStatusDto {
    const missingLanguages = targetLanguages.filter(
      (code) => !this.isComplete(this.translationFor(service, code)),
    );
    return {
      serviceId: service.id,
      status: missingLanguages.length === 0 ? 'done' : 'missing',
      missingLanguages,
    };
  }

  /**
   * Public (end-user) view: the languages a visitor can pick for an organization
   * — the ones that are Live (fully translated) — plus the default language.
   * Resolved by the organization's public key.
   */
  async getPublicLanguages(
    organizationKey: string,
  ): Promise<{ defaultLanguage: LanguageCode; languages: LanguageCode[] }> {
    const organization =
      await this.organizationsService.findByKey(organizationKey);
    const statuses = await this.getLanguageStatuses(organization.id);
    return {
      defaultLanguage: normalizeLanguage(organization.defaultLanguage),
      languages: statuses.filter((s) => s.status === 'live').map((s) => s.code),
    };
  }

  // --- Mutations -----------------------------------------------------------

  /** Turn a language on/off. The default language cannot be turned off. */
  async setLanguageEnabled(
    organizationId: string,
    languageCodeRaw: string,
    enabled: boolean,
  ): Promise<LanguageStatusDto[]> {
    if (!isSupportedLanguage(languageCodeRaw)) {
      throw new BadRequestException(`Unsupported language "${languageCodeRaw}"`);
    }
    const code = normalizeLanguage(languageCodeRaw);
    const defaultLanguage = await this.getDefaultLanguage(organizationId);
    if (code === defaultLanguage && !enabled) {
      throw new BadRequestException(
        'The default language cannot be turned off',
      );
    }

    const existing = await this.organizationLanguageRepository.findOne({
      where: { organizationId, languageCode: code },
    });
    if (existing) {
      existing.enabled = enabled;
      await this.organizationLanguageRepository.save(existing);
    } else {
      await this.organizationLanguageRepository.save(
        this.organizationLanguageRepository.create({
          organizationId,
          languageCode: code,
          enabled,
        }),
      );
    }

    return this.getLanguageStatuses(organizationId);
  }

  /** Set the default (source) language. Only a Live language can become default. */
  async setDefaultLanguage(
    organizationId: string,
    languageCodeRaw: string,
  ): Promise<LanguageStatusDto[]> {
    if (!isSupportedLanguage(languageCodeRaw)) {
      throw new BadRequestException(`Unsupported language "${languageCodeRaw}"`);
    }
    const code = normalizeLanguage(languageCodeRaw);
    const statuses = await this.getLanguageStatuses(organizationId);
    const target = statuses.find((s) => s.code === code);
    if (target && target.status !== 'live') {
      throw new BadRequestException(
        'Only a fully translated (Live) language can be set as default',
      );
    }

    // Guarantee the new default is enabled, then persist it.
    await this.setLanguageEnabled(organizationId, code, true);
    await this.organizationsService.updateDefaultLanguage(organizationId, code);
    return this.getLanguageStatuses(organizationId);
  }

  // --- Translations (manage translations modal) ----------------------------

  /**
   * Source (default-language) + target text and per-field status for the
   * services being translated into `language`. When `serviceId` is given the
   * result is scoped to that single service (per-service edit); otherwise it
   * covers every service of the org.
   */
  async getTranslations(
    organizationId: string,
    languageRaw: string,
    serviceId?: string,
  ): Promise<GetTranslationsResponseDto> {
    if (!isSupportedLanguage(languageRaw)) {
      throw new BadRequestException(`Unsupported language "${languageRaw}"`);
    }
    const language = normalizeLanguage(languageRaw);
    const defaultLanguage = await this.getDefaultLanguage(organizationId);
    if (language === defaultLanguage) {
      throw new BadRequestException(
        'The default language is the source and has no translations to manage',
      );
    }

    const services = await this.serviceRepository.find({
      where: serviceId
        ? { id: serviceId, organizationId }
        : { organizationId },
      relations: ['translations'],
      order: { createdAt: 'ASC' },
    });

    let translated = 0;
    const entries: ServiceTranslationEntryDto[] = services.map((service) => {
      const source = this.translationFor(service, defaultLanguage);
      const target = this.translationFor(service, language);
      const name = target?.name ?? '';
      const description = target?.description ?? '';
      const nameStatus = name.trim() ? 'done' : 'missing';
      const descriptionStatus = description.trim() ? 'done' : 'missing';
      if (nameStatus === 'done') translated += 1;
      if (descriptionStatus === 'done') translated += 1;
      return {
        serviceId: service.id,
        sourceName: source?.name ?? service.nameEn ?? service.name ?? '',
        sourceDescription:
          source?.description ?? service.descriptionEn ?? service.description ?? '',
        name,
        description,
        nameStatus,
        descriptionStatus,
      };
    });

    return {
      language,
      defaultLanguage,
      progress: { translated, total: services.length * 2 },
      services: entries,
    };
  }

  /**
   * Upsert target-language translations for one or more services. Cannot target
   * the default language (that is edited via the service form itself).
   */
  async saveTranslations(
    organizationId: string,
    dto: SaveTranslationsDto,
  ): Promise<GetTranslationsResponseDto> {
    if (!isSupportedLanguage(dto.language)) {
      throw new BadRequestException(`Unsupported language "${dto.language}"`);
    }
    const language = normalizeLanguage(dto.language);
    const defaultLanguage = await this.getDefaultLanguage(organizationId);
    if (language === defaultLanguage) {
      throw new BadRequestException(
        'The default language cannot be edited through translations',
      );
    }

    const serviceIds = dto.entries.map((e) => e.serviceId);
    if (serviceIds.length === 0) {
      return this.getTranslations(organizationId, language);
    }

    // Validate all services belong to the organization.
    const services = await this.serviceRepository.find({
      where: { id: In(serviceIds), organizationId },
    });
    const ownedIds = new Set(services.map((s) => s.id));
    const foreign = serviceIds.find((id) => !ownedIds.has(id));
    if (foreign) {
      throw new NotFoundException(
        `Service "${foreign}" not found in this organization`,
      );
    }

    for (const entry of dto.entries) {
      const existing = await this.serviceTranslationRepository.findOne({
        where: { serviceId: entry.serviceId, languageCode: language },
      });
      if (existing) {
        if (entry.name !== undefined) existing.name = entry.name;
        if (entry.description !== undefined) existing.description = entry.description;
        await this.serviceTranslationRepository.save(existing);
      } else {
        await this.serviceTranslationRepository.save(
          this.serviceTranslationRepository.create({
            serviceId: entry.serviceId,
            languageCode: language,
            name: entry.name,
            description: entry.description,
          }),
        );
      }

      // Keep the legacy fr columns in sync so existing readers stay consistent.
      if (language === 'fr') {
        await this.serviceRepository.update(
          { id: entry.serviceId, organizationId },
          {
            ...(entry.name !== undefined && { nameFr: entry.name }),
            ...(entry.description !== undefined && {
              descriptionFr: entry.description,
            }),
          },
        );
      }
    }

    return this.getTranslations(organizationId, language);
  }
}
