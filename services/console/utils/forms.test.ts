import { isFormFieldValid } from "./forms";

it("should check if field is valid", () => {
  expect(isFormFieldValid({ touched: false, error: undefined })).toBe(false);
  expect(isFormFieldValid({ touched: true, error: undefined })).toBe(false);
  expect(isFormFieldValid({ touched: false, error: "error" })).toBe(false);
  expect(isFormFieldValid({ touched: true, error: "error" })).toBe(true);
});
