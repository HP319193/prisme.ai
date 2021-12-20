import HTTPError from "./HTTPError";

it("should construct", () => {
  const error = new HTTPError("error", 400);
  expect(error.code).toBe(400);
  expect(error.message).toBe("error");
  expect(`${error}`).toBe("400 error");
});
