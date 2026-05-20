import { describe, it, expect } from 'vitest';
import { canUserSubmitArtwork, canUserGiveKudos } from './checks';
import type { UserEntity, ArtworkEntity } from '@icaf/shared';

const baseUser: UserEntity = {
  user_id: 'u1',
  email: 'test@example.com',
  is_virtual: false,
  timestamp: 1000,
  banned: false,
  has_magazine_subscription: false,
  has_newsletter_subscription: false,
  type: 'USER',
};

const baseArtwork: ArtworkEntity = {
  art_id: 'art1',
  user_id: 'u2',
  is_virtual: false,
  status: 'approved',
  kudos_count: 0,
  timestamp: 1000,
  release_hash: 'a'.repeat(64),
  type: 'ART',
};

describe('canUserSubmitArtwork', () => {
  it('allows a normal user to submit', () => {
    expect(canUserSubmitArtwork(baseUser)).toEqual({ canSubmit: true });
  });

  it('blocks a banned user', () => {
    const { canSubmit } = canUserSubmitArtwork({ ...baseUser, banned: true });
    expect(canSubmit).toBe(false);
  });

  it('blocks when user is undefined', () => {
    const { canSubmit } = canUserSubmitArtwork(undefined);
    expect(canSubmit).toBe(false);
  });

  it('blocks when user is null', () => {
    const { canSubmit } = canUserSubmitArtwork(null);
    expect(canSubmit).toBe(false);
  });
});

describe('canUserGiveKudos', () => {
  it('allows kudos on approved artwork by another user', () => {
    expect(canUserGiveKudos('u1', baseArtwork)).toEqual({ canKudo: true });
  });

  it('blocks a user from kudos-ing their own artwork', () => {
    const { canKudo } = canUserGiveKudos('u2', baseArtwork);
    expect(canKudo).toBe(false);
  });
});
