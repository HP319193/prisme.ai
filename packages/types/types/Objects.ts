export interface BaseObject {
  createdAt: string;
  updatedAt: string;
  objectId: string;
}

export interface User extends BaseObject {
  email?: string;
  authData: {
    provider: "anonymous" | "credentials";
  };
  firstName: string;
  lastName: string;
  photo: string;
}
