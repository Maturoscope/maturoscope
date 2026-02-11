// Packages
import {
  Controller,
  Post,
  Header,
  Param,
  Body,
  StreamableFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
// Services
import { ReportService } from './report.service';
// Types
import { ReportDataDto } from './dto/report-data.dto';

@ApiTags('report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post(':locale')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'inline; filename=report.pdf')
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @ApiOperation({ 
    summary: 'Generate PDF report (PUBLIC)',
    description: 'Generates a comprehensive maturity assessment PDF report with all three scales (TRL, MkRL, MfRL), gaps, and risk analysis. This is a PUBLIC endpoint called from the end-user application.'
  })
  @ApiParam({ name: 'locale', enum: ['en', 'fr'], description: 'Report language', example: 'en' })
  @ApiBody({ type: ReportDataDto })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF report generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid report data' })
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
