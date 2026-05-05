import { PaymentEntity } from './types.js';

export function sanitizePaymentEntity(
    data: Pick<PaymentEntity, 'currency' | 'email'>
): typeof data {
    return {
        ...data,
        currency: data.currency?.toUpperCase().trim(),
        email: data.email?.normalize('NFC').trim().toLowerCase(),
    };
}
