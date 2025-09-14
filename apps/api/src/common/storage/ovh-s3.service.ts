import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { UploadedFile } from '../types/uploaded-file.type';

@Injectable()
export class OvhS3Service {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl?: string;
  private readonly forcePathStyle: boolean;
  private readonly makePublic: boolean;
  private readonly endpointUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('OVH_S3_ENDPOINT');
    const region = this.config.get<string>('OVH_S3_REGION') || 'us-east-1';
    const accessKeyId = this.config.get<string>('OVH_S3_ACCESS_KEY');
    const secretAccessKey = this.config.get<string>('OVH_S3_SECRET_KEY');
    this.bucketName = this.config.get<string>('OVH_S3_BUCKET') as string;
    this.publicBaseUrl = this.config.get<string>('OVH_S3_PUBLIC_BASE_URL') || undefined;
    this.forcePathStyle = (this.config.get<string>('OVH_S3_FORCE_PATH_STYLE') || 'true') === 'true';
    this.makePublic = (this.config.get<string>('OVH_S3_PUBLIC_READ') || 'true') === 'true';

    if (!endpoint || !accessKeyId || !secretAccessKey || !this.bucketName) {
      throw new Error('Missing OVH S3 configuration (OVH_S3_* env vars)');
    }

    this.s3 = new S3Client({
      region,
      endpoint,
      forcePathStyle: this.forcePathStyle,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.endpointUrl = endpoint;
  }

  private buildPublicUrl(key: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }
    // Fallback to derived URL from endpoint
    const base = (this.endpointUrl || '').replace(/\/$/, '');
    if (this.forcePathStyle) {
      return `${base}/${this.bucketName}/${key}`;
    }
    // virtual-hosted-style
    const withoutProtocol = base.replace(/^https?:\/\//, '').replace(/\/$/, '');
    return `https://${this.bucketName}.${withoutProtocol}/${key}`;
  }

  async uploadObject(file: UploadedFile, key: string): Promise<{ key: string; url: string }>
  {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: this.makePublic ? 'public-read' : undefined,
      });

      await this.s3.send(command);
      return { key, url: this.buildPublicUrl(key) };
    } catch (error) {
        console.error(error);
      throw new InternalServerErrorException('Error uploading file to object storage');
    }
  }
}


