import { Injectable } from '@nestjs/common';
import { PaymentProvider, PaymentResult } from './payment-provider.interface';

// Auto-approves every charge — no real gateway involved. This is what
// CheckoutService currently receives via the PAYMENT_PROVIDER token.
// Replace with RazorpayPaymentProvider (implementing the same interface)
// and update the one provider binding in checkout.module.ts when you're
// ready for real payments — CheckoutService needs no changes at all.
@Injectable()
export class MockPaymentProvider implements PaymentProvider {
  async charge(amount: number, orderCode: string): Promise<PaymentResult> {
    return {
      paymentStatus: 'PAID',
      providerOrderId: `mock_${orderCode}`,
      providerPaymentId: `mock_pay_${orderCode}`,
    };
  }
}
