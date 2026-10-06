import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { PAYMENT_PROVIDER, PaymentProvider } from './payment/payment-provider.interface';

export type ShippingAddressInput = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
};

@Injectable()
export class CheckoutService {
  constructor(
    private prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private paymentProvider: PaymentProvider,
  ) {}

  async completeCheckout(sessionToken: string, userId: number, address: ShippingAddressInput) {
    const cart = await this.prisma.cart.findUnique({
      where: { sessionToken },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Your cart is empty.');
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    const orderCode = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

    // CheckoutService doesn't know or care whether this is a mock or a
    // real gateway — it only knows the PaymentProvider contract.
    const payment = await this.paymentProvider.charge(totalAmount, orderCode);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderCode,
          uid: userId,
          address: address as any,
          status: payment.paymentStatus === 'PAID' ? 'PROCESSING' : 'PENDING',
          paymentStatus: payment.paymentStatus,
          totalAmount,
          razorpayOrderId: payment.providerOrderId,
          razorpayPaymentId: payment.providerPaymentId,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              customPrintId: item.customPrintId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: { include: { product: true, customPrint: true } },
        },
      });

      // Only clear the cart once payment has actually succeeded — a failed
      // charge should leave the cart intact so the customer can retry.
      if (payment.paymentStatus === 'PAID') {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return created;
    });

    return order;
  }
}
