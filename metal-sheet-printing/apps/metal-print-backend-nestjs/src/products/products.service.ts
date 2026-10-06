import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: { images: { orderBy: { sortWeight: 'asc' } } },
      orderBy: { id: 'asc' },
    });
  }

  async getById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortWeight: 'asc' } } },
    });
    if (!product || !product.isActive) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }
}
