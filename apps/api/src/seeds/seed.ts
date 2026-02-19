import { AppDataSource } from '../data-source';
import { Organization, OrganizationStatus } from '../modules/organizations/entities/organization.entity';
import { User } from '../modules/users/entities/user.entity';
import { Service } from '../modules/services/entities/service.entity';
import { ServiceGapCoverage, ScaleType } from '../modules/services/entities/service-gap-coverage.entity';
import { OrganizationStatistics } from '../modules/statistics/entities/organization-statistics.entity';

async function seed() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    const organizationRepository = AppDataSource.getRepository(Organization);
    const userRepository = AppDataSource.getRepository(User);
    const serviceRepository = AppDataSource.getRepository(Service);
    const gapCoverageRepository = AppDataSource.getRepository(ServiceGapCoverage);
    const statisticsRepository = AppDataSource.getRepository(OrganizationStatistics);

    // Check if seed data already exists
    const existingOrg = await organizationRepository.findOne({
      where: { key: 'synopp' },
    });

    if (existingOrg) {
      console.log('⚠️  Seed data already exists. Skipping seed.');
      console.log('   To re-seed, delete the existing data first.');
      await AppDataSource.destroy();
      process.exit(0);
    }

    console.log('🌱 Starting database seed...');

    // 1. Create Synopp Organization
    console.log('📝 Creating Synopp organization...');
    const synoppOrg = organizationRepository.create({
      key: 'synopp',
      name: 'Synopp',
      email: 'admin@synopp.io',
      font: 'Inter',
      theme: 'light',
      signature: 'Synopp Team',
      language: 'en',
      status: OrganizationStatus.ACTIVE,
    });
    const savedOrg = await organizationRepository.save(synoppOrg);
    console.log(`✅ Created organization: ${savedOrg.name} (${savedOrg.id})`);

    // 2. Create Sample Users
    console.log('👥 Creating sample users...');
    
    const adminUser = userRepository.create({
      organizationId: savedOrg.id,
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@synopp.io',
      roles: ['admin'],
      isActive: true,
    });
    const savedAdminUser = await userRepository.save(adminUser);
    console.log(`✅ Created admin user: ${savedAdminUser.email}`);

    const regularUser = userRepository.create({
      organizationId: savedOrg.id,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@synopp.io',
      roles: ['user'],
      isActive: true,
    });
    const savedRegularUser = await userRepository.save(regularUser);
    console.log(`✅ Created regular user: ${savedRegularUser.email}`);

    // 3. Create Sample Services
    console.log('🔧 Creating sample services...');

    const service1 = serviceRepository.create({
      organizationId: savedOrg.id,
      name: 'Technology Assessment Service',
      nameEn: 'Technology Assessment Service',
      nameFr: 'Service d\'évaluation technologique',
      description: 'Comprehensive technology readiness assessment for your innovation projects.',
      descriptionEn: 'Comprehensive technology readiness assessment for your innovation projects.',
      descriptionFr: 'Évaluation complète de la maturité technologique pour vos projets d\'innovation.',
      url: 'https://example.com/tech-assessment',
      mainContactFirstName: 'Jane',
      mainContactLastName: 'Smith',
      mainContactEmail: 'jane.smith@synopp.io',
      secondaryContactFirstName: 'Bob',
      secondaryContactLastName: 'Johnson',
      secondaryContactEmail: 'bob.johnson@synopp.io',
    });
    const savedService1 = await serviceRepository.save(service1);
    console.log(`✅ Created service: ${savedService1.name}`);

    const service2 = serviceRepository.create({
      organizationId: savedOrg.id,
      name: 'Market Analysis Service',
      nameEn: 'Market Analysis Service',
      nameFr: 'Service d\'analyse de marché',
      description: 'Detailed market readiness analysis to understand market potential.',
      descriptionEn: 'Detailed market readiness analysis to understand market potential.',
      descriptionFr: 'Analyse détaillée de la maturité du marché pour comprendre le potentiel commercial.',
      url: 'https://example.com/market-analysis',
      mainContactFirstName: 'Alice',
      mainContactLastName: 'Williams',
      mainContactEmail: 'alice.williams@synopp.io',
    });
    const savedService2 = await serviceRepository.save(service2);
    console.log(`✅ Created service: ${savedService2.name}`);

    const service3 = serviceRepository.create({
      organizationId: savedOrg.id,
      name: 'Manufacturing Readiness Service',
      nameEn: 'Manufacturing Readiness Service',
      nameFr: 'Service de maturité manufacturière',
      description: 'Evaluate manufacturing readiness and production capabilities.',
      descriptionEn: 'Evaluate manufacturing readiness and production capabilities.',
      descriptionFr: 'Évaluer la maturité manufacturière et les capacités de production.',
      url: 'https://example.com/manufacturing',
      mainContactFirstName: 'Charlie',
      mainContactLastName: 'Brown',
      mainContactEmail: 'charlie.brown@synopp.io',
    });
    const savedService3 = await serviceRepository.save(service3);
    console.log(`✅ Created service: ${savedService3.name}`);

    // 4. Create Gap Coverages for Services
    console.log('📊 Creating gap coverages...');

    // Service 1 - Technology Assessment (TRL focused)
    const gapCoverages1 = [
      { questionId: 'Q1', level: 1, scaleType: ScaleType.TRL },
      { questionId: 'Q1', level: 2, scaleType: ScaleType.TRL },
      { questionId: 'Q1', level: 3, scaleType: ScaleType.TRL },
      { questionId: 'Q2', level: 2, scaleType: ScaleType.TRL },
      { questionId: 'Q2', level: 3, scaleType: ScaleType.TRL },
      { questionId: 'Q3', level: 3, scaleType: ScaleType.TRL },
      { questionId: 'Q3', level: 4, scaleType: ScaleType.TRL },
    ];

    for (const coverage of gapCoverages1) {
      const gapCoverage = gapCoverageRepository.create({
        serviceId: savedService1.id,
        ...coverage,
      });
      await gapCoverageRepository.save(gapCoverage);
    }
    console.log(`✅ Created ${gapCoverages1.length} gap coverages for ${savedService1.name}`);

    // Service 2 - Market Analysis (MkRL focused)
    const gapCoverages2 = [
      { questionId: 'Q4', level: 1, scaleType: ScaleType.MkRL },
      { questionId: 'Q4', level: 2, scaleType: ScaleType.MkRL },
      { questionId: 'Q5', level: 2, scaleType: ScaleType.MkRL },
      { questionId: 'Q5', level: 3, scaleType: ScaleType.MkRL },
      { questionId: 'Q6', level: 3, scaleType: ScaleType.MkRL },
      { questionId: 'Q6', level: 4, scaleType: ScaleType.MkRL },
    ];

    for (const coverage of gapCoverages2) {
      const gapCoverage = gapCoverageRepository.create({
        serviceId: savedService2.id,
        ...coverage,
      });
      await gapCoverageRepository.save(gapCoverage);
    }
    console.log(`✅ Created ${gapCoverages2.length} gap coverages for ${savedService2.name}`);

    // Service 3 - Manufacturing Readiness (MfRL focused)
    const gapCoverages3 = [
      { questionId: 'Q7', level: 1, scaleType: ScaleType.MfRL },
      { questionId: 'Q7', level: 2, scaleType: ScaleType.MfRL },
      { questionId: 'Q8', level: 2, scaleType: ScaleType.MfRL },
      { questionId: 'Q8', level: 3, scaleType: ScaleType.MfRL },
      { questionId: 'Q9', level: 3, scaleType: ScaleType.MfRL },
      { questionId: 'Q9', level: 4, scaleType: ScaleType.MfRL },
    ];

    for (const coverage of gapCoverages3) {
      const gapCoverage = gapCoverageRepository.create({
        serviceId: savedService3.id,
        ...coverage,
      });
      await gapCoverageRepository.save(gapCoverage);
    }
    console.log(`✅ Created ${gapCoverages3.length} gap coverages for ${savedService3.name}`);

    // 5. Create Organization Statistics
    console.log('📈 Creating organization statistics...');
    const statistics = statisticsRepository.create({
      organizationId: savedOrg.id,
      startedAssessments: 0,
      completedAssessments: 0,
      contactedServices: 0,
      usersByCategoryAndLevel: {
        TRL: {},
        MkRL: {},
        MfRL: {},
      },
    });
    await statisticsRepository.save(statistics);
    console.log('✅ Created organization statistics');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Organization: ${savedOrg.name} (${savedOrg.key})`);
    console.log(`   - Users: 2 (1 admin, 1 regular)`);
    console.log(`   - Services: 3`);
    console.log(`   - Gap Coverages: ${gapCoverages1.length + gapCoverages2.length + gapCoverages3.length}`);
    console.log(`   - Statistics: 1 record`);

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed();
}

export default seed;
