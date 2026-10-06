import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { CustomPrintModule } from './custom-print/custom-print.module';
import { CheckoutModule } from './checkout/checkout.module';
import { OrdersModule } from './orders/orders.module';
import { CartSessionMiddleware } from './common/middleware/cart-session.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProductsModule,
    CartModule,
    CustomPrintModule,
    CheckoutModule,
    OrdersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Every route needs a cart session cookie available (checkout and
    // orders read req.cartSessionToken too, via the auth callback's
    // guest-cart claim), so this runs globally rather than scoped to
    // just the cart controller.
    consumer.apply(CartSessionMiddleware).forRoutes('*');
  }
}
