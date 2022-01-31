import ConditionForm from "./ConditionForm";
import renderer, { act } from "react-test-renderer";
import { Form } from "react-final-form";

it("should render", () => {
  const onSubmit = jest.fn();
  const root = renderer.create(<ConditionForm onSubmit={onSubmit} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it("should submit", () => {
  const onSubmit = jest.fn();
  const root = renderer.create(<ConditionForm onSubmit={onSubmit} />);
  act(() => {
    root.root.findByType(Form).props.onSubmit({
      condition: '$a == 1'
    })
  })
  expect(onSubmit).toHaveBeenCalledWith('$a == 1')
});
