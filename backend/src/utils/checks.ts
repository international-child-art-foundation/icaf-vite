import { UserEntity } from "@icaf/shared";
import { ArtworkEntity } from "@icaf/shared";

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

// Check whether a user can give kudos to an artwork
export function canUserGiveKudos(
    userId: string,
    artwork: ArtworkEntity
): { canKudo: boolean; reason?: string } {
    if (artwork.user_id === userId) {
        return { canKudo: false, reason: 'Cannot give kudos to your own artwork' };
    }
    return { canKudo: true };
}