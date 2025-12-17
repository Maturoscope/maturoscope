// Packages
import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
// Services
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get(':locale/:id')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=report.pdf')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async getPDF(
    @Param('locale') locale: string,
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    const validLocale = ['en', 'fr'].includes(locale) ? locale : 'en';
    const buffer = await this.reportService.getPDF(id, validLocale);

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      length: buffer.length,
    });
  }
}
