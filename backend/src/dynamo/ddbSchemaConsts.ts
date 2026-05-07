export const GSI = {
  Gallery: "GalleryGSI",
  FamilyGallery: "FamilyGalleryGSI",
  InstanceGallery: "InstanceGalleryGSI",
  Groups: "GroupsGSI",
  FamilyGroups: "FamilyGroupsGSI",
  InstanceGroups: "InstanceGroupsGSI",
  Review: "ReviewGSI",
  ByOwner: "ByOwnerGSI",
  Email: "EmailGSI",
} as const;

export const EntityType = {
  Art: "ART",
  Group: "GROUP",
  User: "USER",
  Theme: "THEME",
  TakedownRequest: "TAKEDOWN_REQUEST",
  Payment: "PAYMENT",
  AccountAction: "ACCOUNT_ACTION",
} as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];

