import type {
  ChangeArtworkStatusRequest,
  ChangeArtworkStatusResponse,
  ChangeGroupStatusRequest,
  ChangeGroupStatusResponse,
  ReviewArtworkQueueResponse,
  ReviewGroupQueueResponse,
  UpdateUserRoleRequest,
  UpdateUserRoleResponse,
} from '@icaf/shared';

import { apiRequest } from './client';
import { apiEndpoints } from './endpoints';
import type { PaginationQuery } from './types';

export function fetchPendingArtworks(
  query?: PaginationQuery,
): Promise<ReviewArtworkQueueResponse> {
  return apiRequest<ReviewArtworkQueueResponse>(apiEndpoints.contributor.pendingArtworks, {
    query,
  });
}

export function fetchHiddenArtworks(
  query?: PaginationQuery,
): Promise<ReviewArtworkQueueResponse> {
  return apiRequest<ReviewArtworkQueueResponse>(apiEndpoints.contributor.hiddenArtworks, {
    query,
  });
}

export function changeArtworkStatus(
  artId: string,
  request: ChangeArtworkStatusRequest,
): Promise<ChangeArtworkStatusResponse> {
  return apiRequest<ChangeArtworkStatusResponse, ChangeArtworkStatusRequest>(
    apiEndpoints.contributor.changeArtworkStatus(artId),
    { body: request, method: 'PATCH' },
  );
}

export function fetchPendingGroups(query?: PaginationQuery): Promise<ReviewGroupQueueResponse> {
  return apiRequest<ReviewGroupQueueResponse>(apiEndpoints.contributor.pendingGroups, {
    query,
  });
}

export function fetchHiddenGroups(query?: PaginationQuery): Promise<ReviewGroupQueueResponse> {
  return apiRequest<ReviewGroupQueueResponse>(apiEndpoints.contributor.hiddenGroups, {
    query,
  });
}

export function changeGroupStatus(
  groupId: string,
  request: ChangeGroupStatusRequest,
): Promise<ChangeGroupStatusResponse> {
  return apiRequest<ChangeGroupStatusResponse, ChangeGroupStatusRequest>(
    apiEndpoints.contributor.changeGroupStatus(groupId),
    { body: request, method: 'PATCH' },
  );
}

export function updateUserRole(
  userId: string,
  request: UpdateUserRoleRequest,
): Promise<UpdateUserRoleResponse> {
  return apiRequest<UpdateUserRoleResponse, UpdateUserRoleRequest>(
    apiEndpoints.contributor.updateUserRole(userId),
    { body: request, method: 'PATCH' },
  );
}
