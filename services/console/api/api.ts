import "@prisme.ai/types";
import Fetcher from "./fetcher";

export class Api extends Fetcher {
  async me() {
    return await this.get("/me");
  }

  async signin(
    email: string,
    password: string
  ): Promise<
    Prismeai.GenericError & {
      headers: {
        ["x-prismeai-session-token"]: string;
      };
    }
  > {
    return await this.post("/login", {
      email,
      password,
    });
  }
}

export default new Api(process.env.NEXT_PUBLIC_API_HOST || "");
