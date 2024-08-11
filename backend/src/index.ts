import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { PrismaClient } from "@prisma/client";
import schema from "./graphql/schema";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "./helpers/constant";

// Create Prism client instance.
const prisma = new PrismaClient();

// anonymous async function
async function main() {
  // Create a Yoga instance with a GraphQL schema.
  const yoga = createYoga({
    schema,
    context: async ({ request }) => {
      if (
        request.headers.get("authorization") !== null &&
        request.headers.get("authorization") !== undefined
      ) {
        const token = request.headers.get("authorization") as string;
        const loginedUserInfo = await jwt.verify(token, JWT_SECRET); // Explicitly typecast the result to JwtPayload.

        return {
          prisma,
          loginedUser: loginedUserInfo,
        };
      }
      if (
        request.headers.get("authorization") === null ||
        request.headers.get("authorization") === undefined
      ) {
        return {
          prisma,
          loginedUser: null,
        };
      }
    },
  });

  // Pass it into a server to hook into request handlers.
  const server = createServer(yoga);

  // Start the server and you're done!
  server.listen(4000, () => {
    console.info("Server is running on http://localhost:4000/graphql");
  });
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
