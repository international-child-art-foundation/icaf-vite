import { GSI } from "./ddbSchemaConsts";
import { parseThemeSK } from "@icaf/shared";

const galleryPk = () => "GALLERY" as const;
const familyGalleryPk = (family: string) =>
  `FAMILY#${family}` as const;
const instanceGalleryPk = (family: string, instanceType: string, instance: string) =>
  `FAMILY#${family}#${instanceType}#${instance}` as const;
const artGsiSk = (tsMs: number, artId: string) =>
  `TS#${tsMs}#ART#${artId}` as const;

interface ApprovedArtworkGsiAttrs {
  GALL_PK: string;
  FAM_PK?: string;
  INST_PK?: string;
  ART_GSI_SK: string;
}

export function buildApprovedArtworkGsiAttrs(args: {
  tsMs: number;
  artId: string;
  theme?: string;
}): ApprovedArtworkGsiAttrs {
  const attrs: ApprovedArtworkGsiAttrs = {
    GALL_PK: galleryPk(),
    ART_GSI_SK: artGsiSk(args.tsMs, args.artId),
  };
  const theme = args.theme ? parseThemeSK(args.theme) : null;
  if (theme) {
    attrs.FAM_PK = familyGalleryPk(theme.theme_family);
  }
  if (theme?.kind === "instance") {
    attrs.INST_PK = instanceGalleryPk(theme.theme_family, theme.instance_type, theme.theme_instance);
  }
  return attrs;
}

export const ARTWORK_GSI_ATTRS_TO_REMOVE = [
  "GALL_PK",
  "FAM_PK",
  "INST_PK",
  "ART_GSI_SK",
] as const;

export function queryGallery() {
  return { IndexName: GSI.Gallery, pkAttr: "GALL_PK" as const, pk: galleryPk() };
}
export function queryFamilyGallery(family: string) {
  return { IndexName: GSI.FamilyGallery, pkAttr: "FAM_PK" as const, pk: familyGalleryPk(family) };
}
export function queryInstanceGallery(family: string, instanceType: string, instance: string) {
  return { IndexName: GSI.InstanceGallery, pkAttr: "INST_PK" as const, pk: instanceGalleryPk(family, instanceType, instance) };
}
