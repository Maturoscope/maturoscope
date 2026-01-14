import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

interface CachedPdf {
  id: string;
  filePath: string;
  createdAt: Date;
  expiresAt: Date;
  lastHeartbeat: Date; // Track last heartbeat to detect dead sessions
}

@Injectable()
export class ReportCacheService {
  private readonly logger = new Logger(ReportCacheService.name);
  private readonly cache: Map<string, CachedPdf> = new Map();
  private readonly cacheDir: string;
  private readonly maxAgeMinutes = 15; // PDFs expire after 15 minutes
  private readonly maxAgeHours = 15 / 60; // For backwards compatibility in stats

  constructor() {
    // Create a dedicated cache directory
    this.cacheDir = path.join(os.tmpdir(), 'maturoscope-pdf-cache');
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    this.logger.log(`PDF cache directory: ${this.cacheDir}`);
    
    // Clean up orphaned files on startup (from previous server instances)
    this.cleanupOrphanedFilesOnStartup();
  }

  /**
   * Cleanup orphaned files on service startup
   * This handles files left over from previous server instances
   */
  private cleanupOrphanedFilesOnStartup(): void {
    if (!fs.existsSync(this.cacheDir)) {
      return;
    }

    const files = fs.readdirSync(this.cacheDir);
    let deletedCount = 0;
    let deletedSizeBytes = 0;
    
    for (const file of files) {
      if (file.endsWith('.pdf')) {
        const filePath = path.join(this.cacheDir, file);
        try {
          const stats = fs.statSync(filePath);
          fs.unlinkSync(filePath);
          deletedCount++;
          deletedSizeBytes += stats.size;
        } catch (error) {
          this.logger.error(`Error deleting orphaned file on startup: ${error.message}`);
        }
      }
    }

    if (deletedCount > 0) {
      const deletedSizeMB = (deletedSizeBytes / (1024 * 1024)).toFixed(2);
      this.logger.log(`Startup cleanup: Deleted ${deletedCount} orphaned file(s) (${deletedSizeMB} MB)`);
    }
  }

  /**
   * Store a PDF in cache
   * @param pdfBuffer - The PDF buffer to cache
   * @returns The cache ID
   */
  async cachePdf(pdfBuffer: Buffer): Promise<string> {
    const cacheId = uuidv4();
    const fileName = `report-${cacheId}.pdf`;
    const filePath = path.join(this.cacheDir, fileName);

    // Write PDF to file
    fs.writeFileSync(filePath, pdfBuffer);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.maxAgeMinutes * 60 * 1000);

    // Store in memory cache
    this.cache.set(cacheId, {
      id: cacheId,
      filePath,
      createdAt: now,
      expiresAt,
      lastHeartbeat: now, // Initialize heartbeat
    });

    const sizeMB = (pdfBuffer.length / (1024 * 1024)).toFixed(2);
    this.logger.log(`Cached PDF: ${cacheId} (${sizeMB} MB)`);
    return cacheId;
  }

  /**
   * Retrieve a cached PDF
   * @param cacheId - The cache ID
   * @returns The PDF buffer
   */
  async getCachedPdf(cacheId: string): Promise<Buffer> {
    const cached = this.cache.get(cacheId);

    if (!cached) {
      throw new NotFoundException(`Cached PDF with ID ${cacheId} not found`);
    }

    // Check if expired
    if (new Date() > cached.expiresAt) {
      await this.deleteCachedPdf(cacheId);
      throw new NotFoundException(`Cached PDF with ID ${cacheId} has expired`);
    }

    // Check if file exists
    if (!fs.existsSync(cached.filePath)) {
      this.cache.delete(cacheId);
      throw new NotFoundException(`Cached PDF file with ID ${cacheId} not found on disk`);
    }

    return fs.readFileSync(cached.filePath);
  }

  /**
   * Delete a cached PDF
   * @param cacheId - The cache ID
   */
  async deleteCachedPdf(cacheId: string): Promise<void> {
    const cached = this.cache.get(cacheId);

    if (!cached) {
      // Check if file exists on disk even if not in memory (orphaned file)
      const filePath = path.join(this.cacheDir, `report-${cacheId}.pdf`);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          return;
        } catch (error) {
          this.logger.error(`Error deleting orphaned PDF file: ${error.message}`);
          throw error;
        }
      }
      return;
    }

    // Delete file from disk
    if (fs.existsSync(cached.filePath)) {
      try {
        fs.unlinkSync(cached.filePath);
      } catch (error) {
        this.logger.error(`Error deleting PDF file: ${error.message}`);
        throw error;
      }
    }

    // Remove from memory cache
    this.cache.delete(cacheId);
  }

  /**
   * Check if a PDF is cached and not expired
   * @param cacheId - The cache ID
   * @returns True if cached and valid
   */
  isCached(cacheId: string): boolean {
    const cached = this.cache.get(cacheId);
    if (!cached) return false;
    return new Date() <= cached.expiresAt;
  }

  /**
   * Update heartbeat for a cached PDF (indicates session is still alive)
   * @param cacheId - The cache ID
   */
  updateHeartbeat(cacheId: string): boolean {
    const cached = this.cache.get(cacheId);
    if (!cached) {
      return false;
    }
    cached.lastHeartbeat = new Date();
    return true;
  }

  /**
   * Cleanup PDFs with no heartbeat for more than 3 minutes (session likely dead)
   * This is longer than the 15-minute expiration to avoid conflicts
   */
  @Cron('*/3 * * * *') // Every 3 minutes
  async cleanupDeadSessions(): Promise<void> {
    const now = new Date();
    const DEAD_SESSION_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes
    let deletedCount = 0;

    for (const [cacheId, cached] of this.cache.entries()) {
      const timeSinceLastHeartbeat = now.getTime() - cached.lastHeartbeat.getTime();
      if (timeSinceLastHeartbeat > DEAD_SESSION_THRESHOLD_MS) {
        await this.deleteCachedPdf(cacheId);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.logger.log(`Cleanup: Removed ${deletedCount} dead session(s)`);
    }
  }

  /**
   * Cleanup expired PDFs (runs every 10 minutes)
   */
  @Cron('*/10 * * * *') // Every 10 minutes
  async cleanupExpiredPdfs(): Promise<void> {
    const now = new Date();
    let deletedCount = 0;

    for (const [cacheId, cached] of this.cache.entries()) {
      if (now > cached.expiresAt) {
        await this.deleteCachedPdf(cacheId);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.logger.log(`Cleanup: Deleted ${deletedCount} expired PDF(s)`);
    }
  }

  /**
   * Cleanup all orphaned files in cache directory (runs every 5 minutes)
   * Files that exist on disk but not in memory cache
   */
  @Cron('*/5 * * * *') // Every 5 minutes
  async cleanupOrphanedFiles(): Promise<void> {
    if (!fs.existsSync(this.cacheDir)) {
      return;
    }

    const files = fs.readdirSync(this.cacheDir);
    const cachedFiles = new Set(
      Array.from(this.cache.values()).map(c => path.basename(c.filePath))
    );

    let deletedCount = 0;
    let deletedSizeBytes = 0;
    
    for (const file of files) {
      if (!cachedFiles.has(file) && file.endsWith('.pdf')) {
        const filePath = path.join(this.cacheDir, file);
        try {
          const stats = fs.statSync(filePath);
          fs.unlinkSync(filePath);
          deletedCount++;
          deletedSizeBytes += stats.size;
        } catch (error) {
          this.logger.error(`Error deleting orphaned file: ${error.message}`);
        }
      }
    }

    if (deletedCount > 0) {
      const deletedSizeMB = (deletedSizeBytes / (1024 * 1024)).toFixed(2);
      this.logger.log(`Cleanup: Deleted ${deletedCount} orphaned file(s) (${deletedSizeMB} MB)`);
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const files = fs.existsSync(this.cacheDir) ? fs.readdirSync(this.cacheDir) : [];
    const totalSizeBytes = files.reduce((total, file) => {
      const filePath = path.join(this.cacheDir, file);
      try {
        const stats = fs.statSync(filePath);
        return total + stats.size;
      } catch {
        return total;
      }
    }, 0);

    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
    const now = Date.now();
    
    const pdfs = Array.from(this.cache.values()).map(cached => ({
      id: cached.id,
      ageMinutes: ((now - cached.createdAt.getTime()) / (1000 * 60)).toFixed(1),
      expiresInMinutes: ((cached.expiresAt.getTime() - now) / (1000 * 60)).toFixed(1),
      filePath: cached.filePath,
    }));

    return {
      totalCached: this.cache.size,
      filesOnDisk: files.length,
      totalSizeMB,
      totalSizeBytes,
      cacheDir: this.cacheDir,
      maxAgeHours: this.maxAgeHours,
      pdfs,
    };
  }

  /**
   * Log cache statistics to console
   */
  private logCacheStats() {
    const stats = this.getCacheStats();
    this.logger.log(`Cache: ${stats.totalCached} PDFs in memory, ${stats.filesOnDisk} files on disk, ${stats.totalSizeMB} MB`);
  }
}

