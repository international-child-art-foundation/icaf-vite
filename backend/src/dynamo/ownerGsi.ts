import { EntityType } from "./ddbSchemaConsts";


export const byOwnerPk = (userId: string) => `OWNER#${userId}` as const;

export const byOwnerGsiSk = (
  type: EntityType,
  timestampMs: number,
  id: string,
) => `TYPE#${type}#TS#${timestampMs}#ID#${id}` as const;

