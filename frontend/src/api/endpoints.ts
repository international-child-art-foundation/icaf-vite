type PathParam = number | string;

const encodePathParam = (value: PathParam): string =>
  encodeURIComponent(String(value));

export const apiEndpoints = {
  admin: {
    alterUserRole: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/role`,
    banUser: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/ban`,
    deleteMagazine: (slug: PathParam) =>
      `/admin/magazines/${encodePathParam(slug)}`,
    deleteNews: (newsSk: PathParam) => `/admin/news/${encodePathParam(newsSk)}`,
    deleteUserAccount: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/account`,
    getArtworkSubmitterEmail: (artId: PathParam) =>
      `/admin/artworks/${encodePathParam(artId)}/submitter-email`,
    getEmailByUserId: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/email`,
    getTakedownRequests: '/admin/takedowns',
    getUserCognitoInfo: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/cognito-info`,
    hideAllUserArtwork: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/hide-all`,
    magazines: '/admin/magazines',
    news: '/admin/news',
    newsBulk: '/admin/news/bulk',
    removeAllUserArtwork: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/artworks`,
    takedown: (takedownSortKey: PathParam) =>
      `/admin/takedowns/${encodePathParam(takedownSortKey)}`,
    unbanUser: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/unban`,
    unhideAllUserArtwork: (userId: PathParam) =>
      `/admin/users/${encodePathParam(userId)}/unhide-all`,
    updateMagazineStatus: (slug: PathParam) =>
      `/admin/magazines/${encodePathParam(slug)}/status`,
    updateNews: (newsSk: PathParam) => `/admin/news/${encodePathParam(newsSk)}`,
    adminUpdateArtwork: (artId: PathParam) =>
      `/admin/artworks/${encodePathParam(artId)}`,
    adminUpdateGroup: (groupId: PathParam) =>
      `/admin/groups/${encodePathParam(groupId)}`,
  },
  auth: {
    changePassword: '/auth/change-password',
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
    createTheme: '/contributor/themes',
    updateTheme: (themeSk: PathParam) =>
      `/contributor/themes/${encodePathParam(themeSk)}`,
    hiddenArtworks: '/contributor/artworks/hidden',
    rejectedArtworks: '/contributor/artworks/rejected',
    hiddenGroups: '/contributor/groups/hidden',
    pendingArtworks: '/contributor/artworks/pending',
    pendingGroups: '/contributor/groups/pending',
    updateUserRole: (userId: PathParam) =>
      `/contributor/users/${encodePathParam(userId)}/role`,
  },
  gallery: {
    artworks: '/gallery/artworks',
    artworksByFamily: (family: PathParam) =>
      `/gallery/artworks/family/${encodePathParam(family)}`,
    artworksByInstance: (family: PathParam, instance: PathParam) =>
      `/gallery/artworks/family/${encodePathParam(family)}/instance/${encodePathParam(instance)}`,
    themes: '/gallery/themes',
    groups: '/gallery/groups',
    groupsByFamily: (family: PathParam) =>
      `/gallery/groups/family/${encodePathParam(family)}`,
    groupsByInstance: (family: PathParam, instance: PathParam) =>
      `/gallery/groups/family/${encodePathParam(family)}/instance/${encodePathParam(instance)}`,
  },
  groups: {
    artwork: (artId: PathParam) =>
      `/user/group-artworks/${encodePathParam(artId)}`,
    group: (groupId: PathParam) =>
      `/user/groups/${encodePathParam(groupId)}`,
    groupArtwork: (groupId: PathParam, artId: PathParam) =>
      `/user/groups/${encodePathParam(groupId)}/artworks/${encodePathParam(artId)}`,
    groupArtworks: (groupId: PathParam) =>
      `/user/groups/${encodePathParam(groupId)}/artworks`,
    groups: '/user/groups',
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
    artworkKudos: (artId: PathParam) =>
      `/user/artworks/${encodePathParam(artId)}/kudos`,
    artworks: '/user/artworks',
    payments: '/user/payments',
    profile: '/user/profile',
  },
} as const;
