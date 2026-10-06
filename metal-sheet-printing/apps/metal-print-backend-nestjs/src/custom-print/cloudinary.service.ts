import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';

export type UploadCredentials = {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  public_id: string;
  upload_endpoint: string;
};

@Injectable()
export class CloudinaryService {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor(private config: ConfigService) {
    this.cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME')!;
    this.apiKey = this.config.get<string>('CLOUDINARY_API_KEY')!;
    this.apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET')!;

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    });
  }

  generateUploadCredentials(fileName: string): { credentials: UploadCredentials; publicUrl: string } {
    const timestamp = Math.round(Date.now() / 1000);
    const ext = fileName.split('.').pop() ?? 'jpg';
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const public_id = `custom-prints/${uuidv4()}-${baseName}`;

    const paramsToSign = { timestamp, public_id };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, this.apiSecret);

    const publicUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload/${public_id}.${ext}`;

    return {
      credentials: {
        signature,
        timestamp,
        api_key: this.apiKey,
        cloud_name: this.cloudName,
        public_id,
        upload_endpoint: `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      },
      publicUrl,
    };
  }
}
