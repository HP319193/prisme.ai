import { validateWorkflow, validateAutomation } from "./index";

it("should validate a workflow", () => {
  expect(validateWorkflow({})).toBe(false);
  expect(
    validateWorkflow({
      do: {},
    })
  ).toBe(false);
  expect(
    validateWorkflow({
      do: [],
    })
  ).toBe(true);
  expect(
    validateWorkflow({
      do: [{}],
    })
  ).toBe(false);
  expect(
    validateWorkflow({
      do: [
        {
          foo: "bar",
        },
      ],
    })
  ).toBe(true);
  expect(
    validateWorkflow({
      do: [
        {
          "say text": "foo",
        },
      ],
    })
  ).toBe(true);
  expect(
    validateWorkflow({
      do: [
        {
          emit: {
            event: "foo",
          },
        },
      ],
    })
  ).toBe(true);
  expect(
    validateWorkflow({
      do: [
        {
          wait: {
            event: "foo",
          },
        },
      ],
    })
  ).toBe(true);
});

it("should validate automation", () => {
  expect(validateAutomation({})).toBe(false);
  expect(
    validateAutomation({
      workflows: {},
    })
  ).toBe(true);
  expect(
    validateAutomation({
      workflows: { foo: "bar" },
    })
  ).toBe(false);
  expect(
    validateAutomation({
      workflows: { foo: [] },
    })
  ).toBe(false);
  expect(
    validateAutomation({
      workflows: { foo: {} },
    })
  ).toBe(false);
  expect(
    validateAutomation({
      workflows: {
        foo: {
          do: "",
        },
      },
    })
  ).toBe(false);
  expect(
    validateAutomation({
      workflows: {
        foo: {
          do: [],
        },
      },
    })
  ).toBe(true);
  expect(
    validateAutomation({
      workflows: [
        {
          foo: "bar",
        },
      ],
    })
  ).toBe(true);
  expect(
    validateAutomation({
      workflows: {
        foo: {
          do: [
            {
              prout: "lol",
            },
          ],
        },
      },
    })
  ).toBe(true);
});
