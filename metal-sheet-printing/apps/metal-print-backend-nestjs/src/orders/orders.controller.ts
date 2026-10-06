import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.ordersService.listOrdersForUser(user.id);
  }

  @Get(':id')
  getOne(@CurrentUser() user: any, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrder(id, user.id);
  }
}
