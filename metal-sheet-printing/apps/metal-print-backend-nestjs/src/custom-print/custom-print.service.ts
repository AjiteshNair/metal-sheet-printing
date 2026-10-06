import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from './cloudinary.service';
import { DpiService } from './dpi.service';

@Injectable()
export class CustomPrintService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private dpiService: DpiService,
  ) {}

  async create(fileName: string) {
    const { credentials, publicUrl } = this.cloudinary.generateUploadCredentials(fileName);

    const customPrint = await this.prisma.customPrint.create({
      data: {
        imageUrl: publicUrl,
        dimensions: 'A4',
        dpiStatus: 'PENDING',
      },
    });

    return { customPrint, uploadCredentials: credentials };
  }

  async validate(id: number) {
    const customPrint = await this.prisma.customPrint.findUnique({ where: { id } });
    if (!customPrint) {
      throw new NotFoundException(`Custom print ${id} not found`);
    }

    const { dpiValue, passed } = await this.dpiService.check(customPrint.imageUrl);

    return this.prisma.customPrint.update({
      where: { id },
      data: {
        dpiValue,
        dpiStatus: passed ? 'PASSED' : 'FAILED',
        failureReason: passed
          ? null
          : 'Image resolution is below the recommended threshold for an A4 print.',
      },
    });
  }
}
