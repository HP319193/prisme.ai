import UserProvider from './Provider';
import renderer, { act } from 'react-test-renderer';
import { useUser } from './context';
import api from '../../utils/api';
import { ApiError } from '@prisme.ai/sdk';
import Storage from '../../utils/Storage';

jest.mock('../../utils/api', () => ({
  me: jest.fn(),
  signin: jest.fn(),
  getSignoutURL: jest.fn(() => {
    return 'http://test.fr/signout';
  }),
  signup: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));
beforeEach(() => {
  Storage.remove('access-token');
  jest.resetAllMocks();
});

it('should fetch me without auth', async () => {
  jest.spyOn(api, 'me');
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

it('should fetch me with auth', async () => {
  jest.spyOn(api, 'me').mockReturnValue(Promise.resolve({ id: 'id' }));
  api.token = 'token';
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
  expect(context.user).toEqual({ id: 'id' });
});

it('should signin with success', async () => {
  jest.spyOn(api, 'me').mockRejectedValue('fail');
  jest.spyOn(api, 'signin').mockReturnValue(
    Promise.resolve({
      redirectTo: 'redirectTo',
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
  await act(async () => {
    delete (window as any).location;
    (window as any).location = new URL(
      'http://test.jest/signin?interaction=interaction'
    );
    (window as any).location.assign = jest.fn();
    await context.signin('email', 'password');
  });
  expect(api.signin).toHaveBeenCalledWith({
    login: 'email',
    password: 'password',
    interaction: 'interaction',
  });
  expect(window.location.assign).toHaveBeenCalledWith('redirectTo');
});

it('should signin without success', async () => {
  jest.spyOn(api, 'me').mockRejectedValue('fail');
  jest
    .spyOn(api, 'signin')
    .mockRejectedValue(
      new ApiError({ error: 'auth failed', message: 'auth failed' }, 401)
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
  await act(async () => {
    delete (window as any).location;
    (window as any).location = new URL(
      'http://test.jest/signin?interaction=interaction'
    );
    await context.signin('email', 'password');
  });
  expect(api.signin).toHaveBeenCalledWith({
    login: 'email',
    password: 'password',
    interaction: 'interaction',
  });
  expect(context.loading).toBe(false);
  expect(context.user).toEqual(null);
  expect(context.error).toEqual(
    new ApiError({ error: 'auth failed', message: 'auth failed' }, 401)
  );
});

it('should signout', async () => {
  jest.spyOn(Storage, 'remove');
  api.token = 'token';
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

  await act(async () => {
    api.getSignoutURL = jest.fn(() => 'http://test.fr/signout');
    (window as any).location.assign = jest.fn();
    await context.signout();
  });

  expect(api.getSignoutURL).toHaveBeenCalled();
  expect(context.user).toBeNull();
  expect(window.location.assign).toHaveBeenCalledWith('http://test.fr/signout');
});

it('should not signup with a new account, as a new account should be validated', async () => {
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
    id: '42',
    email: 'email',
    firstName: 'firstname',
    lastName: 'lastname',
    token: 'dev-token',
  }));
  await act(async () => {
    await context.signup(
      'email',
      'password',
      'firstname',
      'lastname',
      'language'
    );
  });
  expect(api.signup).toHaveBeenCalledWith(
    'email',
    'password',
    'firstname',
    'lastname',
    'language'
  );
  expect(context.loading).toBe(false);

  expect(context.user).toEqual(null);
});

it('should fail to signup', async () => {
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
    throw new ApiError({ error: 'InvalidEmail', message: '' }, 400);
  });

  await act(async () => {
    await context.signup('email', 'password', 'firstname', 'lastname');
  });

  expect(context.user).toBe(null);
  expect(context.error).toEqual(
    new ApiError({ error: 'InvalidEmail', message: '' }, 400)
  );
});
