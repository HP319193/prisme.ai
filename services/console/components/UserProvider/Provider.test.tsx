import UserProvider from "./Provider";
import renderer, { act } from "react-test-renderer";
import { useUser } from ".";
import api from "../../api/api";
import ApiError from "../../api/ApiError";
import Storage from "../../utils/Storage";

beforeEach(() => {
  Storage.remove("auth-token");
  jest.resetAllMocks();
});

it("should fetch me without auth", async () => {
  jest.spyOn(api, "me");
  let context: any = {};
  const Test = () => {
    context = useUser();
    return null;
  };
  const root = renderer.create(
    <UserProvider>
      <Test />
    </UserProvider>
  );
  await act(async () => {
    await true;
  });
  expect(api.me).toHaveBeenCalled();
});

it("should fetch me with auth", async () => {
  jest.spyOn(api, "me").mockReturnValue(Promise.resolve({}));
  api.token = "token";
  let context: any = {};
  const Test = () => {
    context = useUser();
    return null;
  };
  const root = renderer.create(
    <UserProvider>
      <Test />
    </UserProvider>
  );
  await act(async () => {
    await true;
  });
  expect(api.me).toHaveBeenCalled();
  expect(context.user).toEqual({});
});

it("should signin with success", async () => {
  jest.spyOn(api, "me").mockRejectedValue("fail");
  jest.spyOn(api, "signin").mockReturnValue(
    Promise.resolve({
      headers: { "x-prismeai-session-token": "token" },
      id: "42",
    } as any)
  );
  let context: any = {};
  const Test = () => {
    context = useUser();
    return null;
  };
  const root = renderer.create(
    <UserProvider>
      <Test />
    </UserProvider>
  );
  let promise: Promise<any>;
  act(() => {
    promise = context.signin("email", "password");
  });
  expect(context.loading).toBe(true);
  await act(async () => {
    await promise;
  });
  expect(api.signin).toHaveBeenCalledWith("email", "password");
  expect(context.loading).toBe(false);
  expect(context.user).toEqual({
    id: "42",
  });
});

it("should signin without success", async () => {
  jest.spyOn(api, "me").mockRejectedValue("fail");
  jest
    .spyOn(api, "signin")
    .mockRejectedValue(
      new ApiError({ error: "auth failed", message: "auth failed" }, 401)
    );
  let promise: Promise<any>;
  let context: any = {};
  const Test = () => {
    context = useUser();
    return null;
  };
  const root = renderer.create(
    <UserProvider>
      <Test />
    </UserProvider>
  );
  act(() => {
    promise = context.signin("email", "password");
  });
  expect(context.loading).toBe(true);
  await act(async () => {
    await promise;
  });
  expect(api.signin).toHaveBeenCalledWith("email", "password");
  expect(context.loading).toBe(false);
  expect(context.user).toEqual(null);
  expect(context.error).toEqual(
    new ApiError({ error: "auth failed", message: "auth failed" }, 401)
  );
});

it("should signout", async () => {
  jest.spyOn(Storage, "remove");
  api.token = "token";
  let context: any = {};
  const Test = () => {
    context = useUser();
    return null;
  };
  const root = renderer.create(
    <UserProvider>
      <Test />
    </UserProvider>
  );
  context.signout();
  expect(Storage.remove).toHaveBeenCalledWith("auth-token");
  expect(context.user).toBeNull();
});
