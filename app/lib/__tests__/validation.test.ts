import { describe, expect, it } from "vitest";

import { shippingFormSchema } from "../validation";

const validForm = {
  fullName: "Ada Lovelace",
  email: "ada@lovelace.dev",
  phone: "09123456789",
  address: "123 Main Street, Building 5",
  city: "Tehran",
  postalCode: "1234567890",
};

describe("shippingFormSchema", () => {
  it("accepts all five common Iranian mobile formats", () => {
    const phones = [
      "09123456789", // 0 + 9xx
      "+989123456789", // +98 international
      "00989123456789", // 0098 international
      "989123456789", // 98 without plus
      "9123456789", // no prefix at all
    ];

    for (const phone of phones) {
      const result = shippingFormSchema.safeParse({ ...validForm, phone });

      expect(result.success, `expected "${phone}" to be accepted`).toBe(true);
    }
  });

  it("rejects a landline with the Iranian phone message", () => {
    const result = shippingFormSchema.safeParse({
      ...validForm,
      phone: "02112345678", // Tehran landline, not a mobile
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/Iranian phone/);
  });

  it("requires a properly shaped email address", () => {
    const bad = shippingFormSchema.safeParse({
      ...validForm,
      email: "not-an-email",
    });

    expect(bad.success).toBe(false);

    const good = shippingFormSchema.safeParse({
      ...validForm,
      email: "ada@lovelace.dev",
    });

    expect(good.success).toBe(true);
  });

  it("requires a postal code of exactly ten digits", () => {
    for (const postalCode of ["1234", "12345678901", "12345678a0"]) {
      const result = shippingFormSchema.safeParse({ ...validForm, postalCode });

      expect(
        result.success,
        `expected "${postalCode}" to be rejected`,
      ).toBe(false);
    }
  });

  it("trims values before validating them", () => {
    const result = shippingFormSchema.safeParse({
      ...validForm,
      fullName: "  Ada Lovelace ",
      phone: " 09123456789 ",
      postalCode: " 1234567890 ",
    });

    expect(result.success).toBe(true);
    expect(result.data?.phone).toBe("09123456789");
    expect(result.data?.fullName).toBe("Ada Lovelace");
    expect(result.data?.postalCode).toBe("1234567890");
  });

  it("accepts a complete valid form", () => {
    const result = shippingFormSchema.safeParse(validForm);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(validForm);
  });
});
