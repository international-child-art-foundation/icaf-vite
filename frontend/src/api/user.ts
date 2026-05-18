import type {
  DeleteAccountRequest,
  DeleteAllArtworksResponse,
  ListArtworkSubmissionsResponse,
  ListUserPaymentsResponse,
  SubmitArtworkRequest,
  SubmitArtworkResponse,
  UpdateArtworkRequest,
  UpdateArtworkResponse,
  UserProfileResponse,
  VoteArtworkResponse,
} from '@icaf/shared';

import { apiRequest } from './client';
import { apiEndpoints } from './endpoints';
import type { PaginationQuery } from './types';

export function getUserProfile(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>(apiEndpoints.user.profile);
}

export function deleteAccount(request: DeleteAccountRequest): Promise<void> {
  return apiRequest<void, DeleteAccountRequest>(apiEndpoints.user.account, {
    body: request,
    method: 'DELETE',
  });
}

export function listDonations(query?: PaginationQuery): Promise<ListUserPaymentsResponse> {
  return apiRequest<ListUserPaymentsResponse>(apiEndpoints.user.payments, {
    query,
  });
}

export function listArtworkSubmissions(
  query?: PaginationQuery,
): Promise<ListArtworkSubmissionsResponse> {
  return apiRequest<ListArtworkSubmissionsResponse>(apiEndpoints.user.artworks, {
    query,
  });
}

export function submitArtwork(request: SubmitArtworkRequest): Promise<SubmitArtworkResponse> {
  return apiRequest<SubmitArtworkResponse, SubmitArtworkRequest>(apiEndpoints.user.artworks, {
    body: request,
    method: 'POST',
  });
}

export function updateArtwork(
  artId: string,
  request: UpdateArtworkRequest,
): Promise<UpdateArtworkResponse> {
  return apiRequest<UpdateArtworkResponse, UpdateArtworkRequest>(
    apiEndpoints.user.artwork(artId),
    { body: request, method: 'PATCH' },
  );
}

export function deleteArtwork(artId: string): Promise<void> {
  return apiRequest<void>(apiEndpoints.user.artwork(artId), { method: 'DELETE' });
}

export function deleteAllArtworks(): Promise<DeleteAllArtworksResponse> {
  return apiRequest<DeleteAllArtworksResponse>(apiEndpoints.user.artworks, { method: 'DELETE' });
}

export function voteArtwork(artId: string): Promise<VoteArtworkResponse> {
  return apiRequest<VoteArtworkResponse>(apiEndpoints.user.artworkKudos(artId), {
    method: 'POST',
  });
}
