import type {
  ChangeArtworkStatusRequest,
  ChangeArtworkStatusResponse,
  ChangeGroupStatusRequest,
  ChangeGroupStatusResponse,
  CreateThemeRequest,
  PatchTheme,
  ReviewArtworkQueueResponse,
  ReviewGroupQueueResponse,
  UpdateUserRoleRequest,
  UpdateUserRoleResponse,
  createThemeResponse,
} from '@icaf/shared';

import {
  apiRequest,
  clearApiResponseCache,
  hasApiMessage,
  hasApiSuccess,
  hasArrayProperty,
  hasStringProperty,
} from './client';
import { apiEndpoints } from './endpoints';
import { clearGalleryThemesCache } from './public';
import type { PaginationQuery } from './types';

const isArtworkQueueResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'artworks');

const isGroupQueueResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'groups');

const isArtworkMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'art_id') &&
  hasStringProperty(response, 'status');

const isGroupMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'group_id') &&
  hasStringProperty(response, 'status');

const isUserRoleResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'user_id') &&
  hasStringProperty(response, 'new_role');

const isThemeMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasApiMessage(response);

export function fetchPendingArtworks(
  query?: PaginationQuery,
): Promise<ReviewArtworkQueueResponse> {
  return apiRequest<ReviewArtworkQueueResponse>(
    apiEndpoints.contributor.pendingArtworks,
    {
      query,
      validate: isArtworkQueueResponse,
    },
  );
}

export function fetchHiddenArtworks(
  query?: PaginationQuery,
): Promise<ReviewArtworkQueueResponse> {
  return apiRequest<ReviewArtworkQueueResponse>(
    apiEndpoints.contributor.hiddenArtworks,
    {
      query,
      validate: isArtworkQueueResponse,
    },
  );
}

export function fetchRejectedArtworks(
  query?: PaginationQuery,
): Promise<ReviewArtworkQueueResponse> {
  return apiRequest<ReviewArtworkQueueResponse>(
    apiEndpoints.contributor.rejectedArtworks,
    {
      query,
      validate: isArtworkQueueResponse,
    },
  );
}

export function changeArtworkStatus(
  artId: string,
  request: ChangeArtworkStatusRequest,
): Promise<ChangeArtworkStatusResponse> {
  return apiRequest<ChangeArtworkStatusResponse, ChangeArtworkStatusRequest>(
    apiEndpoints.contributor.changeArtworkStatus(artId),
    { body: request, method: 'PATCH', validate: isArtworkMutationResponse },
  ).then((response) => {
    clearApiResponseCache({
      method: 'GET',
      pathPrefix: apiEndpoints.gallery.artworks,
    });
    clearApiResponseCache({
      method: 'GET',
      pathPrefix: apiEndpoints.public.artwork(artId),
    });
    return response;
  });
}

export function fetchPendingGroups(
  query?: PaginationQuery,
): Promise<ReviewGroupQueueResponse> {
  return apiRequest<ReviewGroupQueueResponse>(
    apiEndpoints.contributor.pendingGroups,
    {
      query,
      validate: isGroupQueueResponse,
    },
  );
}

export function fetchHiddenGroups(
  query?: PaginationQuery,
): Promise<ReviewGroupQueueResponse> {
  return apiRequest<ReviewGroupQueueResponse>(
    apiEndpoints.contributor.hiddenGroups,
    {
      query,
      validate: isGroupQueueResponse,
    },
  );
}

export function changeGroupStatus(
  groupId: string,
  request: ChangeGroupStatusRequest,
): Promise<ChangeGroupStatusResponse> {
  return apiRequest<ChangeGroupStatusResponse, ChangeGroupStatusRequest>(
    apiEndpoints.contributor.changeGroupStatus(groupId),
    { body: request, method: 'PATCH', validate: isGroupMutationResponse },
  ).then((response) => {
    clearApiResponseCache({
      method: 'GET',
      pathPrefix: apiEndpoints.gallery.groups,
    });
    clearApiResponseCache({
      method: 'GET',
      pathPrefix: apiEndpoints.public.group(groupId),
    });
    return response;
  });
}

export function updateUserRole(
  userId: string,
  request: UpdateUserRoleRequest,
): Promise<UpdateUserRoleResponse> {
  return apiRequest<UpdateUserRoleResponse, UpdateUserRoleRequest>(
    apiEndpoints.contributor.updateUserRole(userId),
    { body: request, method: 'PATCH', validate: isUserRoleResponse },
  );
}

export function createTheme(
  request: CreateThemeRequest,
): Promise<createThemeResponse> {
  return apiRequest<createThemeResponse, CreateThemeRequest>(
    apiEndpoints.contributor.createTheme,
    { body: request, method: 'POST', validate: isThemeMutationResponse },
  ).then((response) => {
    clearGalleryThemesCache();
    clearApiResponseCache({
      method: 'GET',
      pathPrefix: apiEndpoints.gallery.themes,
    });
    return response;
  });
}

export function updateTheme(
  themeSk: string,
  request: PatchTheme,
): Promise<createThemeResponse> {
  return apiRequest<createThemeResponse, PatchTheme>(
    apiEndpoints.contributor.updateTheme(themeSk),
    { body: request, method: 'PATCH', validate: isThemeMutationResponse },
  ).then((response) => {
    clearGalleryThemesCache();
    clearApiResponseCache({
      method: 'GET',
      pathPrefix: apiEndpoints.gallery.themes,
    });
    return response;
  });
}
