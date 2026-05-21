import type {
  GalleryArtworksResponse,
  GalleryGroupsResponse,
  GalleryQueryParams,
  GetArtworkResponse,
  GetGroupResponse,
  GuestSubmitArtworkRequest,
  InitiateTakedownRequest,
  InitiateTakedownResponse,
  ListMagazinesResponse,
  ListNewsResponse,
  SubmitArtworkResponse,
  AuthenticatedCreateGroupRequest,
  CreateGroupRequest,
  GuestCreateGroupRequest,
  SubmitGroupResponse,
} from '@icaf/shared';

import { apiRequest } from './client';
import { apiEndpoints } from './endpoints';
import type { PaginationQuery } from './types';

export function submitGuestArtwork(
  request: GuestSubmitArtworkRequest,
): Promise<SubmitArtworkResponse> {
  return apiRequest<SubmitArtworkResponse, GuestSubmitArtworkRequest>(
    apiEndpoints.public.artworks,
    { body: request, method: 'POST' },
  );
}

export function createGuestGroup(request: GuestCreateGroupRequest): Promise<SubmitGroupResponse> {
  return apiRequest<SubmitGroupResponse, GuestCreateGroupRequest>(apiEndpoints.public.groups, {
    body: request,
    method: 'POST',
  });
}

export function createAuthenticatedGroup(
  request: AuthenticatedCreateGroupRequest,
): Promise<SubmitGroupResponse> {
  return apiRequest<SubmitGroupResponse, AuthenticatedCreateGroupRequest>(
    apiEndpoints.public.groups,
    { body: request, method: 'POST' },
  );
}

export function createGroup(request: CreateGroupRequest): Promise<SubmitGroupResponse> {
  return apiRequest<SubmitGroupResponse, CreateGroupRequest>(apiEndpoints.public.groups, {
    body: request,
    method: 'POST',
  });
}

export function getArtwork(artId: string): Promise<GetArtworkResponse> {
  return apiRequest<GetArtworkResponse>(apiEndpoints.public.artwork(artId));
}

export function getGroup(groupId: string): Promise<GetGroupResponse> {
  return apiRequest<GetGroupResponse>(apiEndpoints.public.group(groupId));
}

export function initiateTakedown(
  request: InitiateTakedownRequest,
): Promise<InitiateTakedownResponse> {
  return apiRequest<InitiateTakedownResponse, InitiateTakedownRequest>(
    apiEndpoints.public.takedown,
    { body: request, method: 'POST' },
  );
}

export function listMagazines(): Promise<ListMagazinesResponse> {
  return apiRequest<ListMagazinesResponse>(apiEndpoints.public.magazines);
}

export function listNews(query?: PaginationQuery): Promise<ListNewsResponse> {
  return apiRequest<ListNewsResponse>(apiEndpoints.public.news, {
    query,
  });
}

export function listGalleryArtworks(
  query?: GalleryQueryParams,
): Promise<GalleryArtworksResponse> {
  return apiRequest<GalleryArtworksResponse>(apiEndpoints.gallery.artworks, {
    query,
  });
}

export function listGalleryArtworksByFamily(
  family: string,
  query?: GalleryQueryParams,
): Promise<GalleryArtworksResponse> {
  return apiRequest<GalleryArtworksResponse>(apiEndpoints.gallery.artworksByFamily(family), {
    query,
  });
}

export function listGalleryArtworksByInstance(
  family: string,
  instance: string,
  query?: GalleryQueryParams,
): Promise<GalleryArtworksResponse> {
  return apiRequest<GalleryArtworksResponse>(
    apiEndpoints.gallery.artworksByInstance(family, instance),
    { query },
  );
}

export function listGalleryGroups(query?: GalleryQueryParams): Promise<GalleryGroupsResponse> {
  return apiRequest<GalleryGroupsResponse>(apiEndpoints.gallery.groups, {
    query,
  });
}

export function listGalleryGroupsByFamily(
  family: string,
  query?: GalleryQueryParams,
): Promise<GalleryGroupsResponse> {
  return apiRequest<GalleryGroupsResponse>(apiEndpoints.gallery.groupsByFamily(family), {
    query,
  });
}

export function listGalleryGroupsByInstance(
  family: string,
  instance: string,
  query?: GalleryQueryParams,
): Promise<GalleryGroupsResponse> {
  return apiRequest<GalleryGroupsResponse>(
    apiEndpoints.gallery.groupsByInstance(family, instance),
    { query },
  );
}
