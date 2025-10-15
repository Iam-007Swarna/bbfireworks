import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    email: string;
    name?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
