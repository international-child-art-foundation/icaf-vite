import type {
  ListGroupSubmissionsResponse,
  SubmitArtworkResponse,
  SubmitArtworkToGroupRequest,
  UpdateArtworkRequest,
  UpdateArtworkResponse,
  UpdateGroupRequest,
  UpdateGroupResponse,
} from '@icaf/shared';

import {
  apiRequest,
  hasApiSuccess,
  hasArrayProperty,
  hasStringProperty,
} from './client';
import { apiEndpoints } from './endpoints';
import type { PaginationQuery } from './types';

export type UpdateConstituentArtworkRequest = UpdateArtworkRequest;

const isGroupListResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'groups');

const isGroupMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasStringProperty(response, 'group_id');

const isArtworkSubmitResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasStringProperty(response, 'art_id');

const isArtworkMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasStringProperty(response, 'art_id');

export function listGroupSubmissions(
  query?: PaginationQuery,
): Promise<ListGroupSubmissionsResponse> {
  return apiRequest<ListGroupSubmissionsResponse>(apiEndpoints.groups.groups, {
    query,
    validate: isGroupListResponse,
  });
}

export function updateGroup(
  groupId: string,
  request: UpdateGroupRequest,
): Promise<UpdateGroupResponse> {
  return apiRequest<UpdateGroupResponse, UpdateGroupRequest>(
    apiEndpoints.groups.group(groupId),
    { body: request, method: 'PATCH', validate: isGroupMutationResponse },
  );
}

export function deleteGroup(groupId: string): Promise<void> {
  return apiRequest<void>(apiEndpoints.groups.group(groupId), { method: 'DELETE' });
}

export function submitArtworkToGroup(
  groupId: string,
  request: SubmitArtworkToGroupRequest,
): Promise<SubmitArtworkResponse> {
  return apiRequest<SubmitArtworkResponse, SubmitArtworkToGroupRequest>(
    apiEndpoints.groups.groupArtworks(groupId),
    { body: request, method: 'POST', validate: isArtworkSubmitResponse },
  );
}

export function deleteArtworkFromGroup(groupId: string, artId: string): Promise<void> {
  return apiRequest<void>(apiEndpoints.groups.groupArtwork(groupId, artId), {
    method: 'DELETE',
  });
}

export function updateConstituentArtwork(
  artId: string,
  request: UpdateConstituentArtworkRequest,
): Promise<UpdateArtworkResponse> {
  return apiRequest<UpdateArtworkResponse, UpdateConstituentArtworkRequest>(
    apiEndpoints.groups.artwork(artId),
    { body: request, method: 'PATCH', validate: isArtworkMutationResponse },
  );
}
