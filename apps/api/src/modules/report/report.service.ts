// Packages
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import puppeteer, { Browser } from 'puppeteer';
// Types
import { LaunchOptions, PDFOptions } from 'puppeteer';
import { ReportDataDto } from './dto/report-data.dto';
import { buildPageLayout } from './pdf/page-layout-builder';
import { StructuredLoggerService } from '../../common/logger/structured-logger.service';

const PUPPETEER_OPTIONS: LaunchOptions = {
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  args: [
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
  ],
};

const PAGE_PDF_OPTIONS: PDFOptions = {
  printBackground: true,
  width: '1440px',
  height: '2040px',
};

@Injectable()
export class ReportService {
  private readonly logger: StructuredLoggerService;
  private compiledCss: string;

  constructor(structuredLogger: StructuredLoggerService) {
    this.logger = structuredLogger.child('ReportService');
    // Load compiled CSS once at startup
    const cssPath = path.join(__dirname, './pdf/compiled.css');
    this.compiledCss = fs.readFileSync(cssPath, 'utf8');
  }

  private loadTranslations(locale: string): Record<string, unknown> {
    const localePath = path.join(__dirname, `./pdf/locales/${locale}.json`);
    const localeContent = fs.readFileSync(localePath, 'utf8');
    return JSON.parse(localeContent);
  }

  async getPDF(
    reportData: ReportDataDto,
    locale: string = 'en',
  ): Promise<Buffer> {
    // Load translations for the specified locale
    const t = this.loadTranslations(locale);

    // Build dynamic page layout based on content volume
    const pages = buildPageLayout(reportData);

    // Interpolate the dynamic data into the template
    const templateData = {
      reportData,
      t,
      baseDir: __dirname,
      pages,
      compiledCss: this.compiledCss,
    };
    const templatePath = path.join(__dirname, 'pdf/template.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, templateData);

    // Write HTML to a temp file (avoids data URL size limits)
    const tempFilePath = path.join(
      os.tmpdir(),
      `report-${crypto.randomUUID()}.html`,
    );
    fs.writeFileSync(tempFilePath, html, 'utf8');

    let browser: Browser | null = null;

    try {
      browser = await puppeteer.launch(PUPPETEER_OPTIONS);
      const page = await browser.newPage();

      await page.goto(`file://${tempFilePath}`, {
        waitUntil: 'load',
        timeout: 30000,
      });

      // Brief wait for styles to apply (CSS is already inlined, no network needed)
      await page.waitForFunction(
        () => {
          const body = document.body;
          const computedStyle = window.getComputedStyle(body);
          return computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
        },
        { timeout: 10000 },
      );

      const pdfBuffer = await page.pdf(PAGE_PDF_OPTIONS);
      const buffer = Buffer.from(pdfBuffer);
      this.logger.info('PDF report generated', {
        locale,
        sizeBytes: buffer.length,
      });
      return buffer;
    } catch (err) {
      this.logger.error('PDF report generation failed', err, { locale });
      throw err;
    } finally {
      if (browser) {
        await browser.close();
      }
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }
}
