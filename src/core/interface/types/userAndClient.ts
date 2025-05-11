import { Client, User } from "@prisma/client";

export type UserWithClient = User & { client: Client };