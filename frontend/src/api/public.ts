import type {
  GalleryArtworksResponse,
  GalleryGroupsResponse,
  GalleryQueryParams,
  GetArtworkResponse,
  GetGroupResponse,
  GuestSubmitArtworkRequest,
  CreateArtworkUploadRequest,
  CreateArtworkUploadResponse,
  InitiateTakedownRequest,
  InitiateTakedownResponse,
  ListMagazinesResponse,
  ListNewsResponse,
  ListThemesResponse,
  SubmitArtworkResponse,
  AuthenticatedCreateGroupRequest,
  CreateGroupRequest,
  GuestCreateGroupRequest,
  SubmitGroupResponse,
  VoteArtworkResponse,
} from '@icaf/shared';

import {
  DEFAULT_API_CACHE_TTL_MS,
  apiRequest,
  hasApiSuccess,
  hasArrayProperty,
  hasNumberProperty,
  hasStringProperty,
} from './client';
import { apiEndpoints } from './endpoints';
import type { PaginationQuery } from './types';

type GalleryRequestOptions = {
  bypassCache?: boolean;
  cacheTtlMs?: number;
};

type PublicReadOptions = {
  bypassCache?: boolean;
  cacheTtlMs?: number;
};

const isSuccessfulArtworkSubmitResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasStringProperty(response, 'art_id');

const isSuccessfulArtworkUploadResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'art_id') &&
  hasStringProperty(response, 'presigned_url');

const isSuccessfulGroupSubmitResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasStringProperty(response, 'group_id');

const isArtworkResponse = (response: unknown): boolean =>
  typeof response === 'object' &&
  response !== null &&
  !Array.isArray(response) &&
  'artwork' in response;

const isGroupResponse = (response: unknown): boolean =>
  typeof response === 'object' &&
  response !== null &&
  !Array.isArray(response) &&
  'group' in response;

const isSuccessfulTakedownResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'tdr_id') &&
  hasNumberProperty(response, 'scheduled_execution_at');

const isArtworkKudosResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasStringProperty(response, 'art_id');

const isMagazinesResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'magazines');

const isNewsResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'news');

const isGalleryArtworksResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'artworks') &&
  hasNumberProperty(response, 'count') &&
  hasStringProperty(response, 'sort');

const isThemesResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'themes') && hasNumberProperty(response, 'count');

const isGalleryGroupsResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'groups') &&
  hasNumberProperty(response, 'count') &&
  hasStringProperty(response, 'sort');

export function submitGuestArtwork(
  request: GuestSubmitArtworkRequest,
): Promise<SubmitArtworkResponse> {
  return apiRequest<SubmitArtworkResponse, GuestSubmitArtworkRequest>(
    apiEndpoints.public.artworks,
    { body: request, method: 'POST', validate: isSuccessfulArtworkSubmitResponse },
  );
}

export function createArtworkUpload(
  request: CreateArtworkUploadRequest,
): Promise<CreateArtworkUploadResponse> {
  return apiRequest<CreateArtworkUploadResponse, CreateArtworkUploadRequest>(
    apiEndpoints.public.artworkUploads,
    {
      body: request,
      method: 'POST',
      validate: isSuccessfulArtworkUploadResponse,
    },
  );
}

export function createGuestGroup(request: GuestCreateGroupRequest): Promise<SubmitGroupResponse> {
  return apiRequest<SubmitGroupResponse, GuestCreateGroupRequest>(apiEndpoints.public.groups, {
    body: request,
    method: 'POST',
    validate: isSuccessfulGroupSubmitResponse,
  });
}

export function createAuthenticatedGroup(
  request: AuthenticatedCreateGroupRequest,
): Promise<SubmitGroupResponse> {
  return apiRequest<SubmitGroupResponse, AuthenticatedCreateGroupRequest>(
    apiEndpoints.public.groups,
    { body: request, method: 'POST', validate: isSuccessfulGroupSubmitResponse },
  );
}

export function createGroup(request: CreateGroupRequest): Promise<SubmitGroupResponse> {
  return apiRequest<SubmitGroupResponse, CreateGroupRequest>(apiEndpoints.public.groups, {
    body: request,
    method: 'POST',
    validate: isSuccessfulGroupSubmitResponse,
  });
}

export function getArtwork(
  artId: string,
  options?: PublicReadOptions,
): Promise<GetArtworkResponse> {
  return apiRequest<GetArtworkResponse>(apiEndpoints.public.artwork(artId), {
    bypassCache: options?.bypassCache,
    cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
    validate: isArtworkResponse,
  });
}

export function giveArtworkKudos(artId: string): Promise<VoteArtworkResponse> {
  return apiRequest<VoteArtworkResponse>(apiEndpoints.public.artworkKudos(artId), {
    method: 'POST',
    validate: isArtworkKudosResponse,
  });
}

export function getGroup(
  groupId: string,
  options?: PublicReadOptions,
): Promise<GetGroupResponse> {
  return apiRequest<GetGroupResponse>(apiEndpoints.public.group(groupId), {
    bypassCache: options?.bypassCache,
    cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
    validate: isGroupResponse,
  });
}

export function initiateTakedown(
  request: InitiateTakedownRequest,
): Promise<InitiateTakedownResponse> {
  return apiRequest<InitiateTakedownResponse, InitiateTakedownRequest>(
    apiEndpoints.public.takedown,
    { body: request, method: 'POST', validate: isSuccessfulTakedownResponse },
  );
}

export function listMagazines(
  options?: PublicReadOptions,
): Promise<ListMagazinesResponse> {
  return apiRequest<ListMagazinesResponse>(apiEndpoints.public.magazines, {
    bypassCache: options?.bypassCache,
    cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
    validate: isMagazinesResponse,
  });
}

export function listNews(
  query?: PaginationQuery,
  options?: PublicReadOptions,
): Promise<ListNewsResponse> {
  return apiRequest<ListNewsResponse>(apiEndpoints.public.news, {
    bypassCache: options?.bypassCache,
    cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
    query,
    validate: isNewsResponse,
  });
}

export function listGalleryArtworks(
  query?: GalleryQueryParams,
  options?: GalleryRequestOptions,
): Promise<GalleryArtworksResponse> {
  return apiRequest<GalleryArtworksResponse>(apiEndpoints.gallery.artworks, {
    bypassCache: options?.bypassCache,
    cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
    query,
    validate: isGalleryArtworksResponse,
  });
}

export function listGalleryArtworksByFamily(
  family: string,
  query?: GalleryQueryParams,
  options?: GalleryRequestOptions,
): Promise<GalleryArtworksResponse> {
  return apiRequest<GalleryArtworksResponse>(
    apiEndpoints.gallery.artworksByFamily(family),
    {
      bypassCache: options?.bypassCache,
      cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
      query,
      validate: isGalleryArtworksResponse,
    },
  );
}

export function listGalleryArtworksByInstance(
  family: string,
  instanceType: string,
  instance: string,
  query?: GalleryQueryParams,
  options?: GalleryRequestOptions,
): Promise<GalleryArtworksResponse> {
  return apiRequest<GalleryArtworksResponse>(
    apiEndpoints.gallery.artworksByInstance(family, instanceType, instance),
    {
      bypassCache: options?.bypassCache,
      cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
      query,
      validate: isGalleryArtworksResponse,
    },
  );
}

export function listGalleryThemes(
  options?: PublicReadOptions,
): Promise<ListThemesResponse> {
  return apiRequest<ListThemesResponse>(apiEndpoints.gallery.themes, {
    bypassCache: options?.bypassCache,
    cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
    validate: isThemesResponse,
  });
}

export function listGalleryGroups(
  query?: GalleryQueryParams,
  options?: GalleryRequestOptions,
): Promise<GalleryGroupsResponse> {
  return apiRequest<GalleryGroupsResponse>(apiEndpoints.gallery.groups, {
    bypassCache: options?.bypassCache,
    cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
    query,
    validate: isGalleryGroupsResponse,
  });
}

export function listGalleryGroupsByFamily(
  family: string,
  query?: GalleryQueryParams,
  options?: GalleryRequestOptions,
): Promise<GalleryGroupsResponse> {
  return apiRequest<GalleryGroupsResponse>(
    apiEndpoints.gallery.groupsByFamily(family),
    {
      bypassCache: options?.bypassCache,
      cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
      query,
      validate: isGalleryGroupsResponse,
    },
  );
}

export function listGalleryGroupsByInstance(
  family: string,
  instanceType: string,
  instance: string,
  query?: GalleryQueryParams,
  options?: GalleryRequestOptions,
): Promise<GalleryGroupsResponse> {
  return apiRequest<GalleryGroupsResponse>(
    apiEndpoints.gallery.groupsByInstance(family, instanceType, instance),
    {
      bypassCache: options?.bypassCache,
      cacheTtlMs: options?.cacheTtlMs ?? DEFAULT_API_CACHE_TTL_MS,
      query,
      validate: isGalleryGroupsResponse,
    },
  );
}
