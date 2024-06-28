export type DeserializeUser = (
  id: string | { provider: string; authData: Prismeai.AuthData },
  done: (err: Error | undefined, user: Prismeai.User | null) => void
) => void;
