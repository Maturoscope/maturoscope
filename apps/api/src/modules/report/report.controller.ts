// Packages
import { Controller, Get, Header, Param, StreamableFile } from '@nestjs/common';
// Services
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get(':id')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=report.pdf')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  async getPDF(@Param('id') id: string): Promise<StreamableFile> {
    const buffer = await this.reportService.getPDF(id);

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      length: buffer.length,
    });
  }
}
