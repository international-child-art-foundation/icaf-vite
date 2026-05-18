const PAYMENT_SERVICES = ['stripe'] as const;
export type PaymentService = typeof PAYMENT_SERVICES[number];

export function isValidPaymentService(s: string): s is PaymentService {
    return PAYMENT_SERVICES.includes(s as PaymentService);
}

export function validatePaymentEntity(data: any): string[] {
    const errors: string[] = [];

    if (!data.user_id?.trim()) {
        errors.push('user_id is required');
    }

    if (!data.payment_id?.trim()) {
        errors.push('payment_id is required');
    }

    if (!isValidPaymentService(data.payment_service)) {
        errors.push(`payment_service must be one of: ${PAYMENT_SERVICES.join(', ')}`);
    }

    if (!Number.isInteger(data.amount_cents) || data.amount_cents < 0) {
        errors.push('amount_cents must be a non-negative integer');
    }

    if (!data.currency?.trim()) {
        errors.push('currency is required');
    }

    return errors;
}
