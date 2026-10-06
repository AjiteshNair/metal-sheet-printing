import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { CustomPrintService } from './custom-print.service';

class CreateCustomPrintDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;
}

@Controller('custom-prints')
export class CustomPrintController {
  constructor(private customPrintService: CustomPrintService) {}

  @Post()
  create(@Body() dto: CreateCustomPrintDto) {
    return this.customPrintService.create(dto.fileName);
  }

  @Post(':id/validate')
  validate(@Param('id', ParseIntPipe) id: number) {
    return this.customPrintService.validate(id);
  }
}
