// Packages
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as ejs from 'ejs';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
// Types
import { LaunchOptions, PDFOptions } from 'puppeteer';

const PUPPETEER_OPTIONS: LaunchOptions = {
  executablePath: '/usr/bin/chromium-browser',
  args: [
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-setuid-sandbox',
  ],
};

const PAGE_PDF_OPTIONS: PDFOptions = {
  format: 'A4',
  printBackground: true,
};

@Injectable()
export class ReportService {
  async getPDF(id: string) {
    // Interpolate the dynamic data into the template
    const templateData = { id };
    const templatePath = path.join(__dirname, 'pdf/template.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const html = ejs.render(template, templateData);

    // Launch the browser and render our HTML to get it exported as PDF
    const browser = await puppeteer.launch(PUPPETEER_OPTIONS);
    const page = await browser.newPage();
    await page.setContent(html);
    const buffer = await page.pdf(PAGE_PDF_OPTIONS);
    await browser.close();

    return buffer;
  }
}
