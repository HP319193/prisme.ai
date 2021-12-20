import { FC, useCallback, useEffect, useState } from "react";
import context, { UserContext } from "./context";
import api from "../../api/api";
import ApiError from "../../api/ApiError";

export const UserProvider: FC = ({ children }) => {
  const [user, setUser] = useState<UserContext["user"]>(null);
  const [loading, setLoading] = useState<UserContext["loading"]>(false);
  const [error, setError] = useState<ApiError>();

  const fetchMe = useCallback(async () => {
    setLoading(true);
    try {
      const user = await api.me();
      setUser(user);
    } catch (e) {}
    setLoading(false);
  }, []);

  //@ts-ignore
  const signin: UserContext["signin"] = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const {
        headers: { ["x-prismeai-session-token"]: token },
        ...user
      } = await api.signin(email, password);
      api.token = token;
      setError(undefined);
      //@ts-ignore
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
  const signout: UserContext["signout"] = useCallback(async () => {
    api.token = null;
    setUser(null);
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <context.Provider value={{ user, loading, error, signin, signout }}>
      {children}
    </context.Provider>
  );
};

export default UserProvider;
