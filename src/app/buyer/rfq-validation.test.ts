import { describe, expect, it } from "vitest";
import { rfqSchema } from "./rfq-validation";

const validRfq = {
  title: "Custom shipping boxes",
  categoryId: "00000000-0000-4000-8000-000000000002",
  description: "Strong five-ply boxes for shipping small appliances.",
  quantity: "500",
  unit: "boxes",
  deliveryLocation: "Hinganghat, Wardha, Maharashtra",
  deliveryLatitude: "20.55",
  deliveryLongitude: "78.84",
  imageUrl: "",
  deadline: "2099-10-05",
};

describe("RFQ validation", () => {
  it("accepts a complete future RFQ", () => {
    const result = rfqSchema.safeParse(validRfq);

    expect(result.success).toBe(true);
  });

  it.each([
    ["a missing category", { categoryId: "" }],
    ["a short title", { title: "Hi" }],
    ["a short description", { description: "Too short" }],
    ["a non-positive quantity", { quantity: "0" }],
    ["a past deadline", { deadline: "2020-01-01" }],
  ])("rejects %s", (_caseName, invalidFields) => {
    const result = rfqSchema.safeParse({ ...validRfq, ...invalidFields });

    expect(result.success).toBe(false);
  });

  it("accepts an empty optional image and location coordinates", () => {
    const result = rfqSchema.safeParse({
      ...validRfq,
      deliveryLatitude: "",
      deliveryLongitude: "",
      imageUrl: "",
    });

    expect(result.success).toBe(true);
  });
});