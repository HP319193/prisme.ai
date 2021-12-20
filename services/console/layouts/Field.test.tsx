import Field from "./Field";
import renderer from "react-test-renderer";
import { useField } from "react-final-form";

jest.mock("react-final-form", () => {
  const mock = {
    input: {},
    meta: {},
  };
  return {
    useField: () => mock,
  };
});
it("should render", () => {
  const root = renderer.create(<Field label="foo">Foo</Field>);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render an input", () => {
  const root = renderer.create(
    <Field label="foo">
      {({ className, input, meta }) => (
        <input className={className} {...input} {...meta} />
      )}
    </Field>
  );
  expect(root.toJSON()).toMatchSnapshot();
});

it("should render an invalid input", () => {
  useField("foo").meta.error = "error";
  useField("foo").meta.touched = true;
  const root = renderer.create(
    <Field label="foo">
      {({ className, input, meta }) => (
        <input className={className} {...input} {...meta} />
      )}
    </Field>
  );
  expect(root.toJSON()).toMatchSnapshot();
});
