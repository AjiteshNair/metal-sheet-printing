export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

export type PaymentResult = {
  paymentStatus: 'PAID' | 'FAILED';
  providerOrderId?: string;
  providerPaymentId?: string;
};

// Any future payment integration (Razorpay, Stripe, etc.) implements this
// same interface. CheckoutService depends only on this contract — swapping
// providers means adding a new class and changing one line in
// checkout.module.ts's provider registration, never touching
// CheckoutService itself.
export interface PaymentProvider {
  charge(amount: number, orderCode: string): Promise<PaymentResult>;
}
