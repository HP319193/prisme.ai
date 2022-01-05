import getConfig from "next/config";
import Fetcher from "./fetcher";
import { Workspace } from "./types";

export class Api extends Fetcher {
  async me() {
    return await this.get("/me");
  }

  async signin(
    email: string,
    password: string
  ): Promise<
    Prismeai.User & {
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

  async signup(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<
    Prismeai.User & {
      headers: {
        ["x-prismeai-session-token"]: string;
      };
    }
  > {
    return await this.post("/signup", {
      email: email,
      password,
      firstName,
      lastName,
    });
  }

  async signout() {
    await this.post("/logout");
    this.token = null;
  }

  async getWorkspaces(): Promise<Workspace[]> {
    return await this.get("/workspaces");
  }

  async getWorkspace(id: string): Promise<Workspace | null> {
    return await this.get(`/workspaces/${id}`);
  }

  async createWorkspace(name: string): Promise<Workspace> {
    return await this.post("/workspaces", { name });
  }

  async updateWorkspace(workspace: Workspace): Promise<Workspace> {
    return await this.patch(`/workspaces/${workspace.id}`, workspace);
  }
}

export default new Api(process.env.API_HOST || "");
