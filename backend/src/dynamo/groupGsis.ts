import { GSI } from "./ddbSchemaConsts";
import { parseThemeSK } from "@icaf/shared";

export const groupPk = () => "GROUPS" as const;

export const familyGroupPk = (family: string) =>
  `GROUPS#FAMILY#${family}` as const;

export const instanceGroupPk = (family: string, instanceType: string, instance: string) =>
  `GROUPS#FAMILY#${family}#${instanceType}#${instance}` as const;


export const groupGsiSk = (tsMs: number, groupId: string) =>
  `TS#${tsMs}#ID#${groupId}` as const;

export interface ApprovedGroupGSIAttrs {
  GRP_PK: string;
  FGRP_PK?: string;
  IGRP_PK?: string;
  GRP_GSI_SK: string;
}

export function buildApprovedGroupGsiAttrs(args: {
  tsMs: number;
  groupId: string;
  theme?: string;
}): ApprovedGroupGSIAttrs {
  const attrs: ApprovedGroupGSIAttrs = {
    GRP_PK: groupPk(),
    GRP_GSI_SK: groupGsiSk(args.tsMs, args.groupId),
  };
  const theme = args.theme ? parseThemeSK(args.theme) : null;
  if (theme) {
    attrs.FGRP_PK = familyGroupPk(theme.theme_family);
  }
  if (theme?.kind === "instance") {
    attrs.IGRP_PK = instanceGroupPk(theme.theme_family, theme.instance_type, theme.theme_instance);
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
export function queryInstanceGroups(family: string, instanceType: string, instance: string) {
  return { IndexName: GSI.InstanceGroups, pkAttr: "IGRP_PK" as const, pk: instanceGroupPk(family, instanceType, instance) };
}
