import { EntityType } from "./ddbSchemaConsts";
import { normalizeEmail } from "@icaf/shared";

// Email identity is case-insensitive in this app. All EMAIL_PK values must use
// normalized lowercase email addresses so registration, login, reset, and
// virtual-account flows resolve to the same USER entity.
export const emailPk = (email: string) => `EMAIL#${normalizeEmail(email)}` as const;

export const emailGsiSk = (type: EntityType) => `TYPE#${type}` as const;
