import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CART_INCLUDE = {
  items: {
    include: {
      product: { include: { images: { orderBy: { sortWeight: 'asc' as const }, take: 1 } } },
      customPrint: true,
    },
  },
};

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(sessionToken: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { sessionToken },
      include: CART_INCLUDE,
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { sessionToken },
        include: CART_INCLUDE,
      });
    }

    return cart;
  }

  async addProduct(sessionToken: string, productId: number, quantity: number) {
    const cart = await this.getOrCreateCart(sessionToken);

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    // Same product added twice — bump quantity on the existing line instead
    // of creating a duplicate row.
    const existing = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existing) {
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: product.price,
        },
      });
    }

    return this.getOrCreateCart(sessionToken);
  }

  async addCustomPrint(sessionToken: string, customPrintId: number, unitPrice: number) {
    const cart = await this.getOrCreateCart(sessionToken);

    const customPrint = await this.prisma.customPrint.findUnique({ where: { id: customPrintId } });
    if (!customPrint) {
      throw new NotFoundException(`Custom print ${customPrintId} not found`);
    }

    await this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        customPrintId,
        quantity: 1,
        unitPrice,
      },
    });

    return this.getOrCreateCart(sessionToken);
  }

  async updateQuantity(sessionToken: string, itemId: number, quantity: number) {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1 — use remove to delete an item.');
    }

    const cart = await this.getOrCreateCart(sessionToken);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException(`Cart item ${itemId} not found in this cart`);

    await this.prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return this.getOrCreateCart(sessionToken);
  }

  async removeItem(sessionToken: string, itemId: number) {
    const cart = await this.getOrCreateCart(sessionToken);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException(`Cart item ${itemId} not found in this cart`);

    await this.prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreateCart(sessionToken);
  }
}
