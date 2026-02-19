import { PricingType } from '@prisma/client';

export class PriceDisplayUtil {
  static formatPrice(
    pricingType: PricingType,
    amount?: number,
    perUnit?: string,
    currency: string = 'NGN',
  ): string {
    const symbol = currency === 'NGN' ? '₦' : currency;
    const formatted = amount
      ? `${symbol}${amount.toLocaleString()}`
      : '';

    switch (pricingType) {
      case 'FIXED':
        return perUnit ? `${formatted} ${perUnit}` : formatted;
      case 'NEGOTIABLE':
        return 'Price Negotiable';
      case 'BOTH':
        return perUnit
          ? `${formatted} ${perUnit} (Negotiable)`
          : `${formatted} (Negotiable)`;
      default:
        return 'Contact for price';
    }
  }
}