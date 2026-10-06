import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { MockPaymentProvider } from './payment/mock-payment.provider';
import { PAYMENT_PROVIDER } from './payment/payment-provider.interface';

@Module({
  controllers: [CheckoutController],
  providers: [
    CheckoutService,
    // Swapping to a real gateway later is a one-line change here — point
    // this token at a RazorpayPaymentProvider instead. CheckoutService,
    // the controller, and everything else in this module stays untouched.
    { provide: PAYMENT_PROVIDER, useClass: MockPaymentProvider },
  ],
})
export class CheckoutModule {}
