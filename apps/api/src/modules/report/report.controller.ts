// Packages
import {
  Controller,
  Post,
  Get,
  Delete,
  Header,
  Param,
  Body,
  StreamableFile,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
// Services
import { ReportService } from './report.service';
import { ReportCacheService } from './report-cache.service';
// Types
import { ReportDataDto } from './dto/report-data.dto';

@Controller('report')
export class ReportController {
  private readonly logger = new Logger(ReportController.name);

  constructor(
    private readonly reportService: ReportService,
    private readonly reportCacheService: ReportCacheService,
  ) {}

  @Post(':locale')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=report.pdf')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async getPDF(
    @Param('locale') locale: string,
    @Body() reportData: ReportDataDto,
  ): Promise<StreamableFile> {
    const validLocale = ['en', 'fr'].includes(locale) ? locale : 'en';
    const buffer = await this.reportService.getPDF(reportData, validLocale);

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      length: buffer.length,
    });
  }

  /**
   * Generate and cache a PDF report
   * Returns a cache ID that can be used to download or attach the PDF
   */
  @Post('generate-cached/:locale')
  @HttpCode(HttpStatus.OK)
  async generateCachedPDF(
    @Param('locale') locale: string,
    @Body() reportData: ReportDataDto,
  ): Promise<{ pdfId: string; expiresIn: number }> {
    const validLocale = ['en', 'fr'].includes(locale) ? locale : 'en';
    
    // Generate the PDF
    const buffer = await this.reportService.getPDF(reportData, validLocale);
    
    // Cache it
    const pdfId = await this.reportCacheService.cachePdf(buffer);
    
    return {
      pdfId,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Download a cached PDF
   */
  @Get('cached/:pdfId')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=maturity-report.pdf')
  async getCachedPDF(@Param('pdfId') pdfId: string): Promise<StreamableFile> {
    const startTime = Date.now();
    this.logger.log(`[PERFORMANCE] Download cached PDF request: ${pdfId}`);
    
    const buffer = await this.reportCacheService.getCachedPdf(pdfId);
    
    const totalTime = Date.now() - startTime;
    this.logger.log(`[PERFORMANCE] PDF retrieved in ${totalTime}ms (size: ${buffer.length} bytes)`);
    
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      length: buffer.length,
    });
  }

  /**
   * Delete a cached PDF (called when user closes browser)
   */
  @Delete('cached/:pdfId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCachedPDF(@Param('pdfId') pdfId: string): Promise<void> {
    this.logger.log(`🗑️ DELETE request received for PDF: ${pdfId}`);
    try {
      await this.reportCacheService.deleteCachedPdf(pdfId);
      this.logger.log(`✅ Successfully deleted PDF: ${pdfId}`);
    } catch (error) {
      this.logger.error(`❌ Error deleting PDF ${pdfId}:`, error);
      throw error;
    }
  }

  /**
   * Get cache statistics (for monitoring)
   */
  @Get('cache/stats')
  getCacheStats() {
    this.logger.log('📊 Cache stats requested');
    return this.reportCacheService.getCacheStats();
  }

  /**
   * Force cleanup of orphaned files (manual trigger)
   */
  @Post('cache/cleanup-orphaned')
  async cleanupOrphanedFiles() {
    this.logger.log('🧹 Manual cleanup of orphaned files requested');
    await this.reportCacheService.cleanupOrphanedFiles();
    return { message: 'Orphaned files cleanup completed', stats: this.reportCacheService.getCacheStats() };
  }

  @Post('cache/heartbeat/:pdfId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async heartbeat(@Param('pdfId') pdfId: string): Promise<void> {
    const success = this.reportCacheService.updateHeartbeat(pdfId);
    if (!success) {
      this.logger.warn(`⚠️ Heartbeat received for invalid PDF ID: ${pdfId}`);
    }
  }
}
