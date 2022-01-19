import { selectText } from "./dom";
it("should select text", () => {
  jest.spyOn(document, "createRange");
  const element = document.createElement("div");
  element.innerText = "foo";
  selectText(element);
  expect(document.createRange).toHaveBeenCalled();
});
