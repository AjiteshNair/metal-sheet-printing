import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Read-only order history — split out from CheckoutService, which now only
// handles the write path (completing a checkout). Two different reasons
// to change (how an order is created vs. how it's queried) means two
// different classes.
@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async getOrder(id: number, userId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true, customPrint: true } } },
    });

    if (!order || order.uid !== userId) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async listOrdersForUser(userId: number) {
    return this.prisma.order.findMany({
      where: { uid: userId },
      include: { items: { include: { product: true, customPrint: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
