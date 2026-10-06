import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { IsInt, IsPositive, Min } from 'class-validator';
import { CartService } from './cart.service';

class AddProductDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number = 1;
}

class AddCustomPrintDto {
  @IsInt()
  @IsPositive()
  customPrintId: number;

  @IsPositive()
  unitPrice: number;
}

class UpdateQuantityDto {
  @IsInt()
  @Min(1)
  quantity: number;
}

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@Req() req: Request) {
    return this.cartService.getOrCreateCart(req.cartSessionToken!);
  }

  @Post('items')
  addProduct(@Req() req: Request, @Body() dto: AddProductDto) {
    return this.cartService.addProduct(req.cartSessionToken!, dto.productId, dto.quantity);
  }

  @Post('items/custom')
  addCustomPrint(@Req() req: Request, @Body() dto: AddCustomPrintDto) {
    return this.cartService.addCustomPrint(req.cartSessionToken!, dto.customPrintId, dto.unitPrice);
  }

  @Patch('items/:id')
  updateQuantity(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateQuantityDto,
  ) {
    return this.cartService.updateQuantity(req.cartSessionToken!, id, dto.quantity);
  }

  @Delete('items/:id')
  removeItem(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.cartService.removeItem(req.cartSessionToken!, id);
  }
}
