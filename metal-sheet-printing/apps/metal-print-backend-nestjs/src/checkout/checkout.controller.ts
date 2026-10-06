import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { IsNotEmpty, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CheckoutService } from './checkout.service';

class CheckoutDto {
  @IsString() @IsNotEmpty() fullName: string;
  @IsString() @IsNotEmpty() line1: string;
  line2?: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @IsString() @IsNotEmpty() pincode: string;
  @IsString() @IsNotEmpty() phone: string;
}

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post()
  complete(@Req() req: Request, @CurrentUser() user: any, @Body() dto: CheckoutDto) {
    return this.checkoutService.completeCheckout(req.cartSessionToken!, user.id, dto);
  }
}
