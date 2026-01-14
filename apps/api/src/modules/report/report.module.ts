import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportCacheService } from './report-cache.service';
import { ReportController } from './report.controller';

@Module({
  controllers: [ReportController],
  providers: [ReportService, ReportCacheService],
  exports: [ReportCacheService], // Export for use in other modules (e.g., services)
})
export class ReportModule {}
