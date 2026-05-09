// used for ART and GROUP entities
export const Status = {
  Pending: "pending_review",
  Approved: "approved",
  Rejected: "rejected",
  Hidden: "hidden",
} as const;
export type Status = (typeof Status)[keyof typeof Status];
