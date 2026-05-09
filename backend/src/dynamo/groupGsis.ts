import { GSI } from "./ddbSchemaConsts";

export const groupPk = () => "GROUPS" as const;

export const familyGroupPk = (family: string) =>
  `GROUPS#FAMILY#${family}` as const;

export const instanceGroupPk = (family: string, instance: string) =>
  `GROUPS#FAMILY#${family}#INSTANCE#${instance}` as const;


export const groupGsiSk = (timestampMs: number, groupId: string) =>
  `TS#${timestampMs}#ID#${groupId}` as const;

export interface ApprovedGroupGSIAttrs {
  GRP_PK: string;
  FGRP_PK?: string;
  IGRP_PK?: string;
  GRP_GSI_SK: string;
}

export function buildApprovedGroupGsiAttrs(args: {
  timestampMs: number;
  groupId: string;
  family?: string;
  instance?: string;
}): ApprovedGroupGSIAttrs {
  const attrs: ApprovedGroupGSIAttrs = {
    GRP_PK: groupPk(),
    GRP_GSI_SK: groupGsiSk(args.timestampMs, args.groupId),
  };
  if (args.family) {
    attrs.FGRP_PK = familyGroupPk(args.family);
  }
  if (args.family && args.instance) {
    attrs.IGRP_PK = instanceGroupPk(args.family, args.instance);
  }
  return attrs;
}

export const GROUP_GSI_ATTRS_TO_REMOVE = [
  "GRP_PK",
  "FGRP_PK",
  "IGRP_PK",
  "GRP_GSI_SK",
] as const;

export function queryGroups() {
  return { IndexName: GSI.Groups, pkAttr: "GRP_PK" as const, pk: groupPk() };
}
export function queryFamilyGroups(family: string) {
  return { IndexName: GSI.FamilyGroups, pkAttr: "FGRP_PK" as const, pk: familyGroupPk(family) };
}
export function queryInstanceGroups(family: string, instance: string) {
  return { IndexName: GSI.InstanceGroups, pkAttr: "IGRP_PK" as const, pk: instanceGroupPk(family, instance) };
}
