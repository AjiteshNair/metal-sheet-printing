import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

const A4_SHORT_IN = 8.27;
const A4_LONG_IN = 11.69;
const MINIMUM_DPI = 150;

export type DpiCheckResult = {
  dpiValue: number;
  passed: boolean;
};

@Injectable()
export class DpiService {
  async check(imageUrl: string): Promise<DpiCheckResult> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image for DPI check: ${imageUrl}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Could not read image pixel dimensions');
    }

    const isLandscape = metadata.width > metadata.height;
    const shortSideIn = isLandscape ? A4_LONG_IN : A4_SHORT_IN;
    const longSideIn = isLandscape ? A4_SHORT_IN : A4_LONG_IN;
    const shortSidePx = isLandscape ? metadata.height : metadata.width;
    const longSidePx = isLandscape ? metadata.width : metadata.height;

    const effectiveDpi = Math.min(shortSidePx / shortSideIn, longSidePx / longSideIn);

    return {
      dpiValue: Math.round(effectiveDpi),
      passed: effectiveDpi >= MINIMUM_DPI,
    };
  }
}
