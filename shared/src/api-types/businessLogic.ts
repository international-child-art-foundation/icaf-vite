/**
 * Business Logic
 *
 * Shared guard functions used across multiple Lambda handlers.
 */

import { ArtworkEntity } from './artworkTypes.js';
import { UserEntity } from './userTypes.js';

// Check whether a user can give kudos to an artwork
export function canUserGiveKudos(
    userId: string,
    artwork: ArtworkEntity
): { canKudo: boolean; reason?: string } {
    if (artwork.user_id === userId) {
        return { canKudo: false, reason: 'Cannot give kudos to your own artwork' };
    }
    if (artwork.status !== 'approved') {
        return { canKudo: false, reason: 'Can only give kudos to approved artwork' };
    }
    return { canKudo: true };
}

// Check whether a user is allowed to submit artwork
export function canUserSubmitArtwork(
    user: UserEntity | undefined | null
): { canSubmit: boolean; reason?: string } {
    if (!user) {
        return { canSubmit: false, reason: 'User profile not found' };
    }
    if (user.banned) {
        return { canSubmit: false, reason: 'Account is banned' };
    }
    return { canSubmit: true };
}

// Role hierarchy check
// Order (ascending): user < guardian < contributor < admin
const ROLE_RANK: Record<string, number> = {
    user: 0,
    guardian: 1,
    contributor: 2,
    admin: 3,
};

export function hasMinimumRole(userRole: string | undefined, requiredRole: string): boolean {
    return (ROLE_RANK[userRole ?? ''] ?? -1) >= (ROLE_RANK[requiredRole] ?? 999);
}
