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

import {
  apiRequest,
  hasApiSuccess,
  hasArrayProperty,
  hasNumberProperty,
  hasStringProperty,
  isApiObject,
} from './client';
import { apiEndpoints } from './endpoints';
import type { PaginationQuery } from './types';

const isUserProfileResponse = (response: unknown): boolean =>
  isApiObject(response) &&
  hasStringProperty(response, 'user_id') &&
  hasStringProperty(response, 'email') &&
  hasStringProperty(response, 'role');

const isPaymentsResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'payments');

const isArtworkListResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'artworks');

const isSubmitArtworkResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'art_id') &&
  hasStringProperty(response, 'presigned_url');

const isArtworkMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasStringProperty(response, 'art_id');

const isDeleteAllArtworksResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasNumberProperty(response, 'artworks_deleted') &&
  hasNumberProperty(response, 'total_deleted');

export function getUserProfile(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>(apiEndpoints.user.profile, {
    validate: isUserProfileResponse,
  });
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
    validate: isPaymentsResponse,
  });
}

export function listArtworkSubmissions(
  query?: PaginationQuery,
): Promise<ListArtworkSubmissionsResponse> {
  return apiRequest<ListArtworkSubmissionsResponse>(apiEndpoints.user.artworks, {
    query,
    validate: isArtworkListResponse,
  });
}

export function submitArtwork(request: SubmitArtworkRequest): Promise<SubmitArtworkResponse> {
  return apiRequest<SubmitArtworkResponse, SubmitArtworkRequest>(apiEndpoints.user.artworks, {
    body: request,
    method: 'POST',
    validate: isSubmitArtworkResponse,
  });
}

export function updateArtwork(
  artId: string,
  request: UpdateArtworkRequest,
): Promise<UpdateArtworkResponse> {
  return apiRequest<UpdateArtworkResponse, UpdateArtworkRequest>(
    apiEndpoints.user.artwork(artId),
    { body: request, method: 'PATCH', validate: isArtworkMutationResponse },
  );
}

export function deleteArtwork(artId: string): Promise<void> {
  return apiRequest<void>(apiEndpoints.user.artwork(artId), { method: 'DELETE' });
}

export function deleteAllArtworks(): Promise<DeleteAllArtworksResponse> {
  return apiRequest<DeleteAllArtworksResponse>(apiEndpoints.user.artworks, {
    method: 'DELETE',
    validate: isDeleteAllArtworksResponse,
  });
}

export function voteArtwork(artId: string): Promise<VoteArtworkResponse> {
  return apiRequest<VoteArtworkResponse>(apiEndpoints.user.artworkKudos(artId), {
    method: 'POST',
    validate: isArtworkMutationResponse,
  });
}
