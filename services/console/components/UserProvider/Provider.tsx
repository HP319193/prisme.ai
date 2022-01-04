import { FC, useCallback, useEffect, useRef, useState } from "react";
import context, { UserContext } from "./context";
import api from "../../api/api";
import ApiError from "../../api/ApiError";
import { useRouter } from "next/router";

const PUBLIC_URLS = ["/signin"];

export const UserProvider: FC = ({ children }) => {
  const [user, setUser] = useState<UserContext["user"]>(null);
  const [loading, setLoading] = useState<UserContext["loading"]>(true);
  const [error, setError] = useState<ApiError>();

  const { push, route } = useRouter();

  const signin: UserContext["signin"] = useCallback(
    async (username, password) => {
      setLoading(true);
      try {
        const {
          headers: { ["x-prismeai-session-token"]: token },
          ...user
        } = await api.signin(username, password);
        api.token = token;
        setError(undefined);
        setUser(user);
        setLoading(false);
        return user;
      } catch (e) {
        api.token = null;
        setUser(null);
        setLoading(false);
        setError(e as ApiError);
        return null;
      }
    },
    []
  );
  const signout: UserContext["signout"] = useCallback(async () => {
    api.token = null;
    setUser(null);
    if (!PUBLIC_URLS.includes(route)) {
      push("/");
    }
  }, [push, route]);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const user = await api.me();
      setUser(user);
      setLoading(false);
    } catch (e) {
      signout();
      setTimeout(() => setLoading(false), 200);
    }
  }, [signout]);

  const initialFetch = useRef(fetchMe);

  useEffect(() => {
    initialFetch.current();
  }, []);

  return (
    <context.Provider value={{ user, loading, error, signin, signout }}>
      {children}
    </context.Provider>
  );
};

export default UserProvider;
