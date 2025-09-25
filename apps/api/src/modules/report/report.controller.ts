// Packages
import { Controller, Get, Param } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';
// Services
import { ReportService } from './report.service';

const STREAMABLE_FILE_OPTIONS = {
  disposition: 'inline; filename=report.pdf',
  type: 'application/pdf; charset=utf-8',
};

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get(':id')
  async getPDF(@Param('id') id: string) {
    const buffer = await this.reportService.getPDF(id);
    return new StreamableFile(buffer, STREAMABLE_FILE_OPTIONS);
  }
}
