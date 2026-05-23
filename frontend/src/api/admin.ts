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
  NewsMutationResponse,
  RemoveAllUserArtworkRequest,
  RemoveAllUserArtworkResponse,
  ReviewTakedownRequest,
  ReviewTakedownResponse,
  UnhideAllUserArtworkResponse,
  UpdateMagazineStatusRequest,
  UpdateMagazineStatusResponse,
  CreateNewsRequest,
  UpdateNewsRequest,
  UpdateArtworkRequest,
  UpdateGroupRequest,
  ArtworkStatus,
  AdminUpdateGroupResponse,
} from '@icaf/shared';

import { apiRequest } from './client';
import { apiEndpoints } from './endpoints';
import type { PaginationQuery } from './types';

export function banUser(
  userId: string,
  request: BanUserRequest,
): Promise<BanUnbanUserResponse> {
  return apiRequest<BanUnbanUserResponse, BanUserRequest>(
    apiEndpoints.admin.banUser(userId),
    {
      body: request,
      method: 'POST',
    },
  );
}

export function unbanUser(userId: string): Promise<BanUnbanUserResponse> {
  return apiRequest<BanUnbanUserResponse>(
    apiEndpoints.admin.unbanUser(userId),
    {
      method: 'POST',
    },
  );
}

export function alterUserRole(
  userId: string,
  request: AlterUserRoleRequest,
): Promise<AlterUserRoleResponse> {
  return apiRequest<AlterUserRoleResponse, AlterUserRoleRequest>(
    apiEndpoints.admin.alterUserRole(userId),
    { body: request, method: 'PATCH' },
  );
}

export function getUserCognitoInfo(
  userId: string,
): Promise<GetUserCognitoInfoResponse> {
  return apiRequest<GetUserCognitoInfoResponse>(
    apiEndpoints.admin.getUserCognitoInfo(userId),
  );
}

export function getEmailByUserId(
  userId: string,
): Promise<GetEmailByUserIdResponse> {
  return apiRequest<GetEmailByUserIdResponse>(
    apiEndpoints.admin.getEmailByUserId(userId),
  );
}

export function deleteUserAccount(
  userId: string,
  request: DeleteUserAccountRequest,
): Promise<DeleteUserAccountResponse> {
  return apiRequest<DeleteUserAccountResponse, DeleteUserAccountRequest>(
    apiEndpoints.admin.deleteUserAccount(userId),
    { body: request, method: 'DELETE' },
  );
}

export function removeAllUserArtwork(
  userId: string,
  request: RemoveAllUserArtworkRequest,
): Promise<RemoveAllUserArtworkResponse> {
  return apiRequest<RemoveAllUserArtworkResponse, RemoveAllUserArtworkRequest>(
    apiEndpoints.admin.removeAllUserArtwork(userId),
    { body: request, method: 'DELETE' },
  );
}

export function hideAllUserArtwork(
  userId: string,
): Promise<HideAllUserArtworkResponse> {
  return apiRequest<HideAllUserArtworkResponse>(
    apiEndpoints.admin.hideAllUserArtwork(userId),
    {
      method: 'POST',
    },
  );
}

export function unhideAllUserArtwork(
  userId: string,
): Promise<UnhideAllUserArtworkResponse> {
  return apiRequest<UnhideAllUserArtworkResponse>(
    apiEndpoints.admin.unhideAllUserArtwork(userId),
    { method: 'POST' },
  );
}

export function getArtworkSubmitterEmail(
  artId: string,
): Promise<GetArtworkSubmitterEmailResponse> {
  return apiRequest<GetArtworkSubmitterEmailResponse>(
    apiEndpoints.admin.getArtworkSubmitterEmail(artId),
  );
}

export function listTakedownRequests(
  query?: PaginationQuery,
): Promise<ListTakedownRequestsResponse> {
  return apiRequest<ListTakedownRequestsResponse>(
    apiEndpoints.admin.getTakedownRequests,
    {
      query,
    },
  );
}

export function reviewTakedownRequest(
  takedownSortKey: string,
  request: ReviewTakedownRequest,
): Promise<ReviewTakedownResponse> {
  return apiRequest<ReviewTakedownResponse, ReviewTakedownRequest>(
    apiEndpoints.admin.takedown(takedownSortKey),
    { body: request, method: 'PATCH' },
  );
}

export function publishMagazine(
  request: InitiateMagazineUploadRequest,
): Promise<InitiateMagazineUploadResponse> {
  return apiRequest<
    InitiateMagazineUploadResponse,
    InitiateMagazineUploadRequest
  >(apiEndpoints.admin.magazines, { body: request, method: 'POST' });
}

export function updateMagazineStatus(
  slug: string,
  request: UpdateMagazineStatusRequest,
): Promise<UpdateMagazineStatusResponse> {
  return apiRequest<UpdateMagazineStatusResponse, UpdateMagazineStatusRequest>(
    apiEndpoints.admin.updateMagazineStatus(slug),
    { body: request, method: 'PATCH' },
  );
}

export function deleteMagazine(slug: string): Promise<DeleteMagazineResponse> {
  return apiRequest<DeleteMagazineResponse>(
    apiEndpoints.admin.deleteMagazine(slug),
    {
      method: 'DELETE',
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
    },
  );
}

export function updateNews(
  newsId: string,
  request: UpdateNewsRequest,
): Promise<NewsMutationResponse> {
  return apiRequest<NewsMutationResponse, UpdateNewsRequest>(
    apiEndpoints.admin.updateNews(newsId),
    { body: request, method: 'PATCH' },
  );
}

export function deleteNews(newsId: string): Promise<NewsMutationResponse> {
  return apiRequest<NewsMutationResponse>(
    apiEndpoints.admin.deleteNews(newsId),
    {
      method: 'DELETE',
    },
  );
}

export function adminUpdateArtwork(
  art_id: string,
  request: UpdateArtworkRequest | Record<string, unknown>,
): Promise<{ success: true; art_id: string; status: ArtworkStatus }> {
  return apiRequest<{ success: true; art_id: string; status: ArtworkStatus }, UpdateArtworkRequest | Record<string, unknown>>(
    apiEndpoints.admin.adminUpdateArtwork(art_id),
    {
      body: request,
      method: 'PATCH',
    },
  );
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
    },
  );
}
