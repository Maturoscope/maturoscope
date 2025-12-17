// Packages
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as ejs from 'ejs';
import * as fs from 'fs';
import * as os from 'os';
import puppeteer, { Browser } from 'puppeteer';
// Types
import { LaunchOptions, PDFOptions } from 'puppeteer';

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
  private loadTranslations(locale: string): Record<string, unknown> {
    const localePath = path.join(__dirname, `./pdf/locales/${locale}.json`);
    const localeContent = fs.readFileSync(localePath, 'utf8');
    return JSON.parse(localeContent);
  }

  async getPDF(id: string, locale: string = 'en'): Promise<Buffer> {
    // Load translations for the specified locale
    const t = this.loadTranslations(locale);

    // Interpolate the dynamic data into the template
    const templateData = { id, t };
    const templatePath = path.join(__dirname, 'pdf/template.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, templateData);

    // Write HTML to a temp file (avoids data URL size limits)
    const tempFilePath = path.join(
      os.tmpdir(),
      `report-${id}-${Date.now()}.html`,
    );
    fs.writeFileSync(tempFilePath, html, 'utf8');

    let browser: Browser | null = null;

    try {
      // Launch the browser
      browser = await puppeteer.launch(PUPPETEER_OPTIONS);
      const page = await browser.newPage();

      // Set a longer timeout for the page
      page.setDefaultTimeout(30000);

      // Navigate to the temp file using file:// protocol (more reliable than data URL)
      await page.goto(`file://${tempFilePath}`, {
        waitUntil: ['load', 'networkidle0'],
        timeout: 30000,
      });

      // Wait for Tailwind CDN to process and apply styles
      await page.waitForFunction(
        () => {
          const styles = document.querySelectorAll('style');
          return styles.length > 0;
        },
        { timeout: 15000 },
      );

      // Wait for computed styles to be applied to body
      await page.waitForFunction(
        () => {
          const body = document.body;
          const computedStyle = window.getComputedStyle(body);
          return computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
        },
        { timeout: 10000 },
      );

      // Generate PDF
      const pdfBuffer = await page.pdf(PAGE_PDF_OPTIONS);

      return Buffer.from(pdfBuffer);
    } finally {
      // Always cleanup: close browser and delete temp file
      if (browser) {
        await browser.close();
      }
      // Delete temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  }
}
