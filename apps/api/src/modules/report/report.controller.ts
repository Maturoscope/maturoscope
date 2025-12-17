// Packages
import {
  Controller,
  Post,
  Header,
  Param,
  Body,
  StreamableFile,
} from '@nestjs/common';
// Services
import { ReportService } from './report.service';
// Types
import { ReportDataDto } from './dto/report-data.dto';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

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
}
