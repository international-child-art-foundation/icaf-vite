type PathParam = number | string;

const encodePathParam = (value: PathParam): string => encodeURIComponent(String(value));

export const apiEndpoints = {
  admin: {
    alterUserRole: (userId: PathParam) => `/admin/users/${encodePathParam(userId)}/role`,
    banUser: (userId: PathParam) => `/admin/users/${encodePathParam(userId)}/ban`,
    deleteMagazine: (slug: PathParam) => `/admin/magazines/${encodePathParam(slug)}`,
    deleteNews: (newsId: PathParam) => `/admin/news/${encodePathParam(newsId)}`,
    deleteUserAccount: (userId: PathParam) => `/admin/users/${encodePathParam(userId)}/account`,
    getArtworkSubmitterEmail: (artId: PathParam) =>
      `/admin/artworks/${encodePathParam(artId)}/submitter-email`,
    getEmailByUserId: (userId: PathParam) => `/admin/users/${encodePathParam(userId)}/email`,
    getTakedownRequests: '/admin/takedowns',
    getUserCognitoInfo: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/cognito-info`,
    hideAllUserArtwork: (userId: PathParam) => `/admin/users/${encodePathParam(userId)}/hide-all`,
    magazines: '/admin/magazines',
    news: '/admin/news',
    removeAllUserArtwork: (userId: PathParam) => `/admin/users/${encodePathParam(userId)}/artworks`,
    takedown: (takedownSortKey: PathParam) =>
      `/admin/takedowns/${encodePathParam(takedownSortKey)}`,
    unbanUser: (userId: PathParam) => `/admin/users/${encodePathParam(userId)}/unban`,
    unhideAllUserArtwork: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/unhide-all`,
    updateMagazineStatus: (slug: PathParam) => `/admin/magazines/${encodePathParam(slug)}/status`,
    updateNews: (newsId: PathParam) => `/admin/news/${encodePathParam(newsId)}`,
  },
  auth: {
    changePassword: '/auth/change-password',
    confirmDefaultRegistration: '/auth/default-registration/confirm',
    confirmForgotPassword: '/auth/confirm-forgot-password',
    createAndVerify: '/auth/create-and-verify',
    defaultRegistration: '/auth/default-registration',
    forgotPassword: '/auth/forgot-password',
    login: '/auth/login',
    logout: '/auth/logout',
    requestCreateAndVerify: '/auth/create-and-verify/request',
    resendVerification: '/auth/resend-verification',
    status: '/auth/status',
  },
  contributor: {
    changeArtworkStatus: (artId: PathParam) =>
      `/contributor/artworks/${encodePathParam(artId)}/status`,
    changeGroupStatus: (groupId: PathParam) =>
      `/contributor/groups/${encodePathParam(groupId)}/status`,
    hiddenArtworks: '/contributor/artworks/hidden',
    hiddenGroups: '/contributor/groups/hidden',
    pendingArtworks: '/contributor/artworks/pending',
    pendingGroups: '/contributor/groups/pending',
    updateUserRole: (userId: PathParam) => `/contributor/users/${encodePathParam(userId)}/role`,
  },
  gallery: {
    artworks: '/gallery/artworks',
    artworksByFamily: (family: PathParam) => `/gallery/artworks/family/${encodePathParam(family)}`,
    artworksByInstance: (family: PathParam, instance: PathParam) =>
      `/gallery/artworks/family/${encodePathParam(family)}/instance/${encodePathParam(instance)}`,
    groups: '/gallery/groups',
    groupsByFamily: (family: PathParam) => `/gallery/groups/family/${encodePathParam(family)}`,
    groupsByInstance: (family: PathParam, instance: PathParam) =>
      `/gallery/groups/family/${encodePathParam(family)}/instance/${encodePathParam(instance)}`,
  },
  guardian: {
    artwork: (artId: PathParam) => `/guardian/artworks/${encodePathParam(artId)}`,
    group: (groupId: PathParam) => `/guardian/groups/${encodePathParam(groupId)}`,
    groupArtwork: (groupId: PathParam, artId: PathParam) =>
      `/guardian/groups/${encodePathParam(groupId)}/artworks/${encodePathParam(artId)}`,
    groupArtworks: (groupId: PathParam) => `/guardian/groups/${encodePathParam(groupId)}/artworks`,
    groups: '/guardian/groups',
  },
  public: {
    artwork: (artId: PathParam) => `/artworks/${encodePathParam(artId)}`,
    artworks: '/artworks',
    group: (groupId: PathParam) => `/groups/${encodePathParam(groupId)}`,
    groups: '/groups',
    magazines: '/magazines',
    news: '/news',
    takedown: '/takedown',
  },
  user: {
    account: '/user/account',
    artwork: (artId: PathParam) => `/user/artworks/${encodePathParam(artId)}`,
    artworkKudos: (artId: PathParam) => `/user/artworks/${encodePathParam(artId)}/kudos`,
    artworks: '/user/artworks',
    payments: '/user/payments',
    profile: '/user/profile',
  },
} as const;
