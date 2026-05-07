import { EntityType } from "./ddbSchemaConsts";

export const emailPk = (email: string) => `EMAIL#${email}` as const;

export const emailGsiSk = (type: EntityType) => `TYPE#${type}` as const;
