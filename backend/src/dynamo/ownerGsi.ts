import { EntityType } from "./ddbSchemaConsts";


export const byOwnerPk = (userId: string) => `OWNER#${userId}` as const;

export const byOwnerGsiSk = (
  type: EntityType,
  tsMs: number,
  id: string,
) => `TYPE#${type}#TS#${tsMs}#ID#${id}` as const;

