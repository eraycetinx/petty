import { PrismaClient } from "@prisma/client";

export interface Context {
  prisma: PrismaClient;
  loginedUser: {
    username: string;
    email: string;
    uuid: string;
  };
}
