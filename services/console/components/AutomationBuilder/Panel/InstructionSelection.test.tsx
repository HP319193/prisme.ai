import InstructionSelection from "./InstructionSelection";
import renderer, { act } from "react-test-renderer";
import { useAutomationBuilder } from "../context";
import { InputText } from "primereact/inputtext";

jest.mock("../context", () => {
  const mock = {}
  return {
    useAutomationBuilder: () => mock
  }
})

beforeEach(() => {
  useAutomationBuilder().instructionsSchemas = [
    ['logical', { emit: {}, wait: {} }, { icon: '/icon' }],
    ['workspace', { kermit: {}, waitress: {} }, { icon: '/icon' }]
  ]
})

it("should render", () => {
  const onSubmit = jest.fn();
  const root = renderer.create(<InstructionSelection onSubmit={onSubmit} />);
  expect(root.toJSON()).toMatchSnapshot();
});

it('should filter', () => {
  const onSubmit = jest.fn();
  const root = renderer.create(<InstructionSelection onSubmit={onSubmit} />);

  act(() => {
    root.root.findByType(InputText).props.onChange({ target: { value: 'ait' } })
  })

  expect(root.toJSON()).toMatchSnapshot();
})
