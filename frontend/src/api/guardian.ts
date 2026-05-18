import type {
  ListGroupSubmissionsResponse,
  SubmitArtworkResponse,
  SubmitArtworkRequest,
  SubmitGroupRequest,
  SubmitGroupResponse,
  UpdateArtworkRequest,
  UpdateArtworkResponse,
  UpdateGroupRequest,
  UpdateGroupResponse,
} from '@icaf/shared';

import { apiRequest } from './client';
import { apiEndpoints } from './endpoints';
import type { PaginationQuery } from './types';

export type SubmitArtworkToGroupRequest = Omit<SubmitArtworkRequest, 'group_id' | 'is_virtual'>;
export type UpdateConstituentArtworkRequest = UpdateArtworkRequest;

export function listGroupSubmissions(
  query?: PaginationQuery,
): Promise<ListGroupSubmissionsResponse> {
  return apiRequest<ListGroupSubmissionsResponse>(apiEndpoints.guardian.groups, {
    query,
  });
}

export function createGroup(request: SubmitGroupRequest): Promise<SubmitGroupResponse> {
  return apiRequest<SubmitGroupResponse, SubmitGroupRequest>(apiEndpoints.guardian.groups, {
    body: request,
    method: 'POST',
  });
}

export function updateGroup(
  groupId: string,
  request: UpdateGroupRequest,
): Promise<UpdateGroupResponse> {
  return apiRequest<UpdateGroupResponse, UpdateGroupRequest>(
    apiEndpoints.guardian.group(groupId),
    { body: request, method: 'PATCH' },
  );
}

export function deleteGroup(groupId: string): Promise<void> {
  return apiRequest<void>(apiEndpoints.guardian.group(groupId), { method: 'DELETE' });
}

export function submitArtworkToGroup(
  groupId: string,
  request: SubmitArtworkToGroupRequest,
): Promise<SubmitArtworkResponse> {
  return apiRequest<SubmitArtworkResponse, SubmitArtworkToGroupRequest>(
    apiEndpoints.guardian.groupArtworks(groupId),
    { body: request, method: 'POST' },
  );
}

export function deleteArtworkFromGroup(groupId: string, artId: string): Promise<void> {
  return apiRequest<void>(apiEndpoints.guardian.groupArtwork(groupId, artId), {
    method: 'DELETE',
  });
}

export function updateConstituentArtwork(
  artId: string,
  request: UpdateConstituentArtworkRequest,
): Promise<UpdateArtworkResponse> {
  return apiRequest<UpdateArtworkResponse, UpdateConstituentArtworkRequest>(
    apiEndpoints.guardian.artwork(artId),
    { body: request, method: 'PATCH' },
  );
}
