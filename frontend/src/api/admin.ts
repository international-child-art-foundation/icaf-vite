import type {
  AlterUserRoleRequest,
  AlterUserRoleResponse,
  BanUnbanUserResponse,
  BanUserRequest,
  DeleteMagazineResponse,
  DeleteUserAccountRequest,
  DeleteUserAccountResponse,
  GetArtworkSubmitterEmailResponse,
  GetEmailByUserIdResponse,
  GetUserCognitoInfoResponse,
  HideAllUserArtworkResponse,
  InitiateMagazineUploadRequest,
  InitiateMagazineUploadResponse,
  ListTakedownRequestsResponse,
  BulkCreateNewsRequest,
  BulkCreateNewsResponse,
  CreateNewsRequest,
  NewsMutationResponse,
  RemoveAllUserArtworkRequest,
  RemoveAllUserArtworkResponse,
  ReviewTakedownRequest,
  ReviewTakedownResponse,
  UnhideAllUserArtworkResponse,
  UpdateMagazineStatusRequest,
  UpdateMagazineStatusResponse,
  UpdateNewsRequest,
  UpdateArtworkRequest,
  UpdateGroupRequest,
  ArtworkStatus,
  AdminUpdateGroupResponse,
} from '@icaf/shared';

import {
  apiRequest,
  hasApiSuccess,
  hasArrayProperty,
  hasBooleanProperty,
  hasNumberProperty,
  hasStringProperty,
} from './client';
import { apiEndpoints } from './endpoints';
import type { PaginationQuery } from './types';

const hasMessageAndUserId = (response: unknown): boolean =>
  hasStringProperty(response, 'message') && hasStringProperty(response, 'user_id');

const isRoleMutationResponse = (response: unknown): boolean =>
  hasMessageAndUserId(response) && hasStringProperty(response, 'new_role');

const isBanUserResponse = (response: unknown): boolean =>
  hasMessageAndUserId(response) && hasBooleanProperty(response, 'banned');

const isCognitoInfoResponse = (response: unknown): boolean =>
  hasStringProperty(response, 'user_id') &&
  hasStringProperty(response, 'email') &&
  hasStringProperty(response, 'cognito_username');

const isUserEmailResponse = (response: unknown): boolean =>
  hasStringProperty(response, 'user_id') && hasStringProperty(response, 'email');

const isDeleteUserAccountResponse = (response: unknown): boolean =>
  hasMessageAndUserId(response) && hasNumberProperty(response, 'entries_deleted');

const isRemoveAllUserArtworkResponse = (response: unknown): boolean =>
  hasMessageAndUserId(response) && hasArrayProperty(response, 'failed_deletions');

const isBulkArtworkUserResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasStringProperty(response, 'user_id');

const isArtworkSubmitterEmailResponse = (response: unknown): boolean =>
  hasStringProperty(response, 'art_id') &&
  hasStringProperty(response, 'user_id') &&
  hasStringProperty(response, 'email');

const isTakedownListResponse = (response: unknown): boolean =>
  hasArrayProperty(response, 'requests');

const isTakedownMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'tdr_sk') &&
  hasStringProperty(response, 'status');

const isMagazineUploadResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'slug') &&
  hasStringProperty(response, 'presigned_url');

const isMagazineMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) && hasStringProperty(response, 'slug');

const isNewsMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'news_id') &&
  hasStringProperty(response, 'news_sk');

const isBulkNewsResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasNumberProperty(response, 'count') &&
  hasArrayProperty(response, 'news_ids');

const isArtworkMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'art_id') &&
  hasStringProperty(response, 'status');

const isGroupMutationResponse = (response: unknown): boolean =>
  hasApiSuccess(response) &&
  hasStringProperty(response, 'group_id') &&
  hasStringProperty(response, 'status');

export function banUser(
  userId: string,
  request: BanUserRequest,
): Promise<BanUnbanUserResponse> {
  return apiRequest<BanUnbanUserResponse, BanUserRequest>(
    apiEndpoints.admin.banUser(userId),
    {
      body: request,
      method: 'POST',
      validate: isBanUserResponse,
    },
  );
}

export function unbanUser(userId: string): Promise<BanUnbanUserResponse> {
  return apiRequest<BanUnbanUserResponse>(
    apiEndpoints.admin.unbanUser(userId),
    {
      method: 'POST',
      validate: isBanUserResponse,
    },
  );
}

export function alterUserRole(
  userId: string,
  request: AlterUserRoleRequest,
): Promise<AlterUserRoleResponse> {
  return apiRequest<AlterUserRoleResponse, AlterUserRoleRequest>(
    apiEndpoints.admin.alterUserRole(userId),
    { body: request, method: 'PATCH', validate: isRoleMutationResponse },
  );
}

export function getUserCognitoInfo(
  userId: string,
): Promise<GetUserCognitoInfoResponse> {
  return apiRequest<GetUserCognitoInfoResponse>(
    apiEndpoints.admin.getUserCognitoInfo(userId),
    { validate: isCognitoInfoResponse },
  );
}

export function getEmailByUserId(
  userId: string,
): Promise<GetEmailByUserIdResponse> {
  return apiRequest<GetEmailByUserIdResponse>(
    apiEndpoints.admin.getEmailByUserId(userId),
    { validate: isUserEmailResponse },
  );
}

export function deleteUserAccount(
  userId: string,
  request: DeleteUserAccountRequest,
): Promise<DeleteUserAccountResponse> {
  return apiRequest<DeleteUserAccountResponse, DeleteUserAccountRequest>(
    apiEndpoints.admin.deleteUserAccount(userId),
    { body: request, method: 'DELETE', validate: isDeleteUserAccountResponse },
  );
}

export function removeAllUserArtwork(
  userId: string,
  request: RemoveAllUserArtworkRequest,
): Promise<RemoveAllUserArtworkResponse> {
  return apiRequest<RemoveAllUserArtworkResponse, RemoveAllUserArtworkRequest>(
    apiEndpoints.admin.removeAllUserArtwork(userId),
    { body: request, method: 'DELETE', validate: isRemoveAllUserArtworkResponse },
  );
}

export function hideAllUserArtwork(
  userId: string,
): Promise<HideAllUserArtworkResponse> {
  return apiRequest<HideAllUserArtworkResponse>(
    apiEndpoints.admin.hideAllUserArtwork(userId),
    {
      method: 'POST',
      validate: isBulkArtworkUserResponse,
    },
  );
}

export function unhideAllUserArtwork(
  userId: string,
): Promise<UnhideAllUserArtworkResponse> {
  return apiRequest<UnhideAllUserArtworkResponse>(
    apiEndpoints.admin.unhideAllUserArtwork(userId),
    { method: 'POST', validate: isBulkArtworkUserResponse },
  );
}

export function getArtworkSubmitterEmail(
  artId: string,
): Promise<GetArtworkSubmitterEmailResponse> {
  return apiRequest<GetArtworkSubmitterEmailResponse>(
    apiEndpoints.admin.getArtworkSubmitterEmail(artId),
    { validate: isArtworkSubmitterEmailResponse },
  );
}

export function listTakedownRequests(
  query?: PaginationQuery,
): Promise<ListTakedownRequestsResponse> {
  return apiRequest<ListTakedownRequestsResponse>(
    apiEndpoints.admin.getTakedownRequests,
    {
      query,
      validate: isTakedownListResponse,
    },
  );
}

export function reviewTakedownRequest(
  takedownSortKey: string,
  request: ReviewTakedownRequest,
): Promise<ReviewTakedownResponse> {
  return apiRequest<ReviewTakedownResponse, ReviewTakedownRequest>(
    apiEndpoints.admin.takedown(takedownSortKey),
    { body: request, method: 'PATCH', validate: isTakedownMutationResponse },
  );
}

export function publishMagazine(
  request: InitiateMagazineUploadRequest,
): Promise<InitiateMagazineUploadResponse> {
  return apiRequest<
    InitiateMagazineUploadResponse,
    InitiateMagazineUploadRequest
  >(apiEndpoints.admin.magazines, {
    body: request,
    method: 'POST',
    validate: isMagazineUploadResponse,
  });
}

export function updateMagazineStatus(
  slug: string,
  request: UpdateMagazineStatusRequest,
): Promise<UpdateMagazineStatusResponse> {
  return apiRequest<UpdateMagazineStatusResponse, UpdateMagazineStatusRequest>(
    apiEndpoints.admin.updateMagazineStatus(slug),
    { body: request, method: 'PATCH', validate: isMagazineMutationResponse },
  );
}

export function deleteMagazine(slug: string): Promise<DeleteMagazineResponse> {
  return apiRequest<DeleteMagazineResponse>(
    apiEndpoints.admin.deleteMagazine(slug),
    {
      method: 'DELETE',
      validate: isMagazineMutationResponse,
    },
  );
}

export function createNews(
  request: CreateNewsRequest,
): Promise<NewsMutationResponse> {
  return apiRequest<NewsMutationResponse, CreateNewsRequest>(
    apiEndpoints.admin.news,
    {
      body: request,
      method: 'POST',
      validate: isNewsMutationResponse,
    },
  );
}

export function bulkCreateNews(
  request: BulkCreateNewsRequest,
): Promise<BulkCreateNewsResponse> {
  return apiRequest<BulkCreateNewsResponse, BulkCreateNewsRequest>(
    apiEndpoints.admin.newsBulk,
    {
      body: request,
      method: 'POST',
      validate: isBulkNewsResponse,
    },
  );
}

export function updateNews(
  newsSk: string,
  request: UpdateNewsRequest,
): Promise<NewsMutationResponse> {
  return apiRequest<NewsMutationResponse, UpdateNewsRequest>(
    apiEndpoints.admin.updateNews(newsSk),
    { body: request, method: 'PATCH', validate: isNewsMutationResponse },
  );
}

export function deleteNews(newsSk: string): Promise<NewsMutationResponse> {
  return apiRequest<NewsMutationResponse>(
    apiEndpoints.admin.deleteNews(newsSk),
    {
      method: 'DELETE',
      validate: isNewsMutationResponse,
    },
  );
}

export function adminUpdateArtwork(
  art_id: string,
  request: UpdateArtworkRequest | Record<string, unknown>,
): Promise<{ success: true; art_id: string; status: ArtworkStatus }> {
  return apiRequest<
    { success: true; art_id: string; status: ArtworkStatus },
    UpdateArtworkRequest | Record<string, unknown>
  >(apiEndpoints.admin.adminUpdateArtwork(art_id), {
    body: request,
    method: 'PATCH',
    validate: isArtworkMutationResponse,
  });
}

export function adminUpdateGroup(
  groupId: string,
  request: UpdateGroupRequest,
): Promise<AdminUpdateGroupResponse> {
  return apiRequest<AdminUpdateGroupResponse, UpdateGroupRequest>(
    apiEndpoints.admin.adminUpdateGroup(groupId),
    {
      body: request,
      method: 'PATCH',
      validate: isGroupMutationResponse,
    },
  );
}
