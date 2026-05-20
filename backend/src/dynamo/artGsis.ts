import { GSI } from "./ddbSchemaConsts";

const galleryPk = () => "GALLERY" as const;
const familyGalleryPk = (family: string) =>
  `FAMILY#${family}` as const;
const instanceGalleryPk = (family: string, instance: string) =>
  `FAMILY#${family}#INSTANCE#${instance}` as const;
const artGsiSk = (timestampMs: number, artId: string) =>
  `TS#${timestampMs}#ART#${artId}` as const;

interface ApprovedArtworkGsiAttrs {
  GALL_PK: string;
  FAM_PK?: string;
  INST_PK?: string;
  ART_GSI_SK: string;
}

export function buildApprovedArtworkGsiAttrs(args: {
  timestampMs: number;
  artId: string;
  family?: string;
  instance?: string;
}): ApprovedArtworkGsiAttrs {
  const attrs: ApprovedArtworkGsiAttrs = {
    GALL_PK: galleryPk(),
    ART_GSI_SK: artGsiSk(args.timestampMs, args.artId),
  };
  if (args.family) {
    attrs.FAM_PK = familyGalleryPk(args.family);
  }
  if (args.family && args.instance) {
    attrs.INST_PK = instanceGalleryPk(args.family, args.instance);
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
export function queryInstanceGallery(family: string, instance: string) {
  return { IndexName: GSI.InstanceGallery, pkAttr: "INST_PK" as const, pk: instanceGalleryPk(family, instance) };
}
