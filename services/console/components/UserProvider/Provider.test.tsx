import UserProvider from "./Provider";
import renderer, { act } from "react-test-renderer";
import { useUser } from ".";
import api from "../../api/api";
import ApiError from "../../api/ApiError";
import Storage from "../../utils/Storage";

jest.mock("../../api/api", () => ({
  me: jest.fn(),
  signin: jest.fn(),
  signout: jest.fn(),
  signup: jest.fn(),
}));

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
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
  await act(async () => {
    await true;
  });
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
  expect(api.signout).toHaveBeenCalled();
  expect(context.user).toBeNull();
});

it("should signup with a new account", async () => {
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
  await act(async () => {
    // Because of initial fetch me
    await true;
  });
  (api.signup as jest.Mock).mockImplementation(async () => ({
    headers: {
      "x-prismeai-session-token": "dev-token",
    },
    id: "42",
    email: "email",
    firstName: "firstname",
    lastName: "lastname",
  }));
  act(() => {
    promise = context.signup("email", "password", "firstname", "lastname");
  });
  expect(context.loading).toBe(true);
  await act(async () => {
    await promise;
  });
  expect(api.signup).toHaveBeenCalledWith(
    "email",
    "password",
    "firstname",
    "lastname"
  );
  expect(context.loading).toBe(false);

  expect(context.user).toEqual({
    id: "42",
    email: "email",
    firstName: "firstname",
    lastName: "lastname",
  });
});

it("should signup with an existing account", async () => {
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
    // Because of initial fetch me
    await true;
  });
  (api.signup as jest.Mock).mockImplementation(async () => {
    throw new ApiError({ error: "AlreadyUsed", message: "" }, 401);
  });

  await act(async () => {
    await context.signup("email", "password", "firstname", "lastname");
  });

  expect(api.signin).toHaveBeenCalledWith("email", "password");
});

it("should fail to signup", async () => {
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
    // Because of initial fetch me
    await true;
  });
  (api.signup as jest.Mock).mockImplementation(async () => {
    throw new ApiError({ error: "InvalidEmail", message: "" }, 400);
  });

  await act(async () => {
    await context.signup("email", "password", "firstname", "lastname");
  });

  expect(context.user).toBe(null);
  expect(context.error).toEqual(
    new ApiError({ error: "InvalidEmail", message: "" }, 400)
  );
});
