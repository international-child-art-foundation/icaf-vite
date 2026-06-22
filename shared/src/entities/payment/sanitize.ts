import { PaymentEntity } from './types.js';

export function sanitizePaymentEntity(
    data: Pick<PaymentEntity, 'currency' | 'email' | 'purpose'>
): typeof data {
    return {
        ...data,
        currency: data.currency?.toUpperCase().trim(),
        email: data.email?.normalize('NFC').trim().toLowerCase(),
        purpose: data.purpose?.normalize('NFC').trim() as PaymentEntity['purpose'],
    };
}
