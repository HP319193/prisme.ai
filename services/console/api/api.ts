import getConfig from "next/config";
import Fetcher from "./fetcher";
import { Workspace } from "./types";

const { publicRuntimeConfig } = getConfig();

export class Api extends Fetcher {
  async me() {
    return await this.get("/me");
  }

  async signin(
    username: string,
    password: string
  ): Promise<
    Prismeai.User & {
      headers: {
        ["x-prismeai-session-token"]: string;
      };
    }
  > {
    return await this.post("/login", {
      username,
      password,
    });
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

export default new Api(publicRuntimeConfig.API_HOST || "");
