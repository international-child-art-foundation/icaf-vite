import { EntityType } from "./ddbSchemaConsts";
import { Status } from "./shared";

export const reviewPk = () => "REVIEW" as const;

export const reviewGsiSk = (
  status: Status,
  type: EntityType,
  timestampMs: number,
  id: string,
) => `STATUS#${status}#TYPE#${type}#TS#${timestampMs}#ID#${id}` as const;
