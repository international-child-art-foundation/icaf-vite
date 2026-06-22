import { describe, expect, it } from "vitest";
import { EntityType } from "./ddbSchemaConsts";
import { emailGsiSk, emailPk } from "./emailGsi";
import { normalizeEmail } from "@icaf/shared";

describe("email normalization", () => {
  it("normalizes user-submitted emails to lowercase trimmed form", () => {
    expect(normalizeEmail("  Mixed.Case+Tag@Example.COM  ")).toBe(
      "mixed.case+tag@example.com",
    );
  });

  it("uses normalized lowercase email addresses for EMAIL_PK", () => {
    expect(emailPk("  Mixed.Case+Tag@Example.COM  ")).toBe(
      "EMAIL#mixed.case+tag@example.com",
    );
  });

  it("keeps the user email GSI sort key stable", () => {
    expect(emailGsiSk(EntityType.User)).toBe("TYPE#USER");
  });
});
