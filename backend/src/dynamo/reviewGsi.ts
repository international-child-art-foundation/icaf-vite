import { EntityType } from "./ddbSchemaConsts";
import { Status } from "./shared";

export const reviewPk = () => "REVIEW" as const;

export const reviewGsiSk = (
  status: Status,
  type: EntityType,
  tsMs: number,
  id: string,
) => `STATUS#${status}#TYPE#${type}#TS#${tsMs}#ID#${id}` as const;
