import Storage from "./Storage";
import localStorage from "./localStorage";

jest.mock("./localStorage", () => {
  return {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
});

it("should use Local Storage", () => {
  Storage.get("foo");
  expect(localStorage.getItem).toHaveBeenCalledWith("foo");

  Storage.set("foo", "bar");
  expect(localStorage.setItem).toHaveBeenCalledWith("foo", "bar");
  (localStorage.setItem as any).mockClear();

  Storage.set("foo", { a: 1 });
  expect(localStorage.setItem).toHaveBeenCalledWith("foo", '{"a":1}');

  Storage.remove("foo");
  expect(localStorage.removeItem).toHaveBeenCalledWith("foo");
});
