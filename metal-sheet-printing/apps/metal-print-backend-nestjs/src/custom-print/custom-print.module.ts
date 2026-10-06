import { Module } from '@nestjs/common';
import { CustomPrintController } from './custom-print.controller';
import { CustomPrintService } from './custom-print.service';
import { CloudinaryService } from './cloudinary.service';
import { DpiService } from './dpi.service';

@Module({
  controllers: [CustomPrintController],
  providers: [CustomPrintService, CloudinaryService, DpiService],
  exports: [CustomPrintService],
})
export class CustomPrintModule {}
