// Packages
import { Injectable, OnModuleDestroy } from '@nestjs/common';
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
  headless: true,
  pipe: true,
  dumpio: true,
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
  args: [
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-sync',
    '--no-first-run',
    '--disable-translate',
  ],
};

const PAGE_PDF_OPTIONS: PDFOptions = {
  printBackground: true,
  width: '1440px',
  height: '2040px',
};

const MAX_CONCURRENT = 2;

@Injectable()
export class ReportService implements OnModuleDestroy {
  private readonly logger: StructuredLoggerService;
  private browser: Browser | null = null;
  private browserLaunchPromise: Promise<Browser> | null = null;
  private activePdfCount = 0;
  private compiledCss: string;

  constructor(structuredLogger: StructuredLoggerService) {
    this.logger = structuredLogger.child('ReportService');
    // Load compiled CSS once at startup
    const cssPath = path.join(__dirname, './pdf/compiled.css');
    this.compiledCss = fs.readFileSync(cssPath, 'utf8');
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.logger.info('Browser instance closed');
    }
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser && this.browser.connected) {
      return this.browser;
    }

    // Mutex: if a launch is already in progress, wait for it
    if (this.browserLaunchPromise) {
      return this.browserLaunchPromise;
    }

    // Close stale browser if disconnected
    if (this.browser) {
      try {
        await this.browser.close();
      } catch {
        // Ignore close errors on stale browser
      }
      this.browser = null;
    }

    // Launch with mutex to prevent multiple concurrent launches
    this.browserLaunchPromise = puppeteer
      .launch(PUPPETEER_OPTIONS)
      .then((browser) => {
        this.browser = browser;
        this.browser.on('disconnected', () => {
          this.logger.warn('Browser disconnected unexpectedly');
          this.browser = null;
        });
        this.logger.info('Browser instance launched for PDF generation');
        return this.browser;
      })
      .catch((err) => {
        this.logger.error('Failed to launch browser', err);
        throw new Error(
          'PDF generation unavailable: browser failed to launch',
        );
      })
      .finally(() => {
        this.browserLaunchPromise = null;
      });

    return this.browserLaunchPromise;
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
    // Concurrency guard
    if (this.activePdfCount >= MAX_CONCURRENT) {
      throw new Error(
        'PDF generation is busy, please try again in a moment',
      );
    }
    this.activePdfCount++;

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

    try {
      const browser = await this.ensureBrowser();
      const page = await browser.newPage();

      try {
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
      } finally {
        await page.close();
      }
    } catch (err) {
      this.logger.error('PDF report generation failed', err, { locale });
      throw err;
    } finally {
      this.activePdfCount--;
      // Delete temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }
}
