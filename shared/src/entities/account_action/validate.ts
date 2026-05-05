import { AccountActionType } from './types.js';

export const ACCOUNT_ACTION_TYPES: AccountActionType[] = [
    'ban',
    'unban',
    'reject_artwork',
    'reject_group',
    'waive_payment',
    'delete_artwork',
    'change_password',
    'hide_artwork',
    'hide_artwork_bulk',
    'hide_group',
    'hide_all',
];

export function isValidAccountActionType(action: string): action is AccountActionType {
    return ACCOUNT_ACTION_TYPES.includes(action as AccountActionType);
}
