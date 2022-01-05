import { FC, useCallback, useEffect, useRef, useState } from "react";
import context, { UserContext } from "./context";
import api from "../../api/api";
import ApiError from "../../api/ApiError";
import { useRouter } from "next/router";

const PUBLIC_URLS = ["/signin", "/signup"];

export const UserProvider: FC = ({ children }) => {
  const [user, setUser] = useState<UserContext["user"]>(null);
  const [loading, setLoading] = useState<UserContext["loading"]>(true);
  const [error, setError] = useState<ApiError>();

  const { push, route } = useRouter();

  const signin: UserContext["signin"] = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const {
        headers: { ["x-prismeai-session-token"]: token },
        ...user
      } = await api.signin(email, password);
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
  }, []);

  const signup: UserContext["signup"] = useCallback(
    async (email, password, firstName, lastName) => {
      setLoading(true);
      try {
        const {
          headers: { ["x-prismeai-session-token"]: token },
          ...user
        } = await api.signup(email, password, firstName, lastName);
        api.token = token;
        setError(undefined);
        setUser(user);

        setLoading(false);
        return user;
      } catch (e) {
        const { error } = e as ApiError;
        if (error === "AlreadyUsed") {
          // Try to log in
          try {
            const user = await signin(email, password);
            return user;
          } catch (e) {
            setError(e as ApiError);
          }
        }
        api.token = null;
        setUser(null);
        setLoading(false);
        setError(e as ApiError);
        return null;
      }
    },
    [signin]
  );

  const signout: UserContext["signout"] = useCallback(async () => {
    api.signout();
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
    <context.Provider value={{ user, loading, error, signin, signup, signout }}>
      {children}
    </context.Provider>
  );
};

export default UserProvider;
