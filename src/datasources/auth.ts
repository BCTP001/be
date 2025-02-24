import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import dotenv from "dotenv";

interface DecodedToken {
  userId: number;
  iat: number;
  exp: number;
}

dotenv.config({ path: ".env" });

export function signJWT(userId: number) {
  const payload = { userId };
  return jwt.sign(payload, process.env.PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "24h",
  });
}

export function verifyJWT(token: string): {
  userId: number;
  isNotExp: boolean;
} {
  try {
    const decoded = jwt.verify(token, process.env.PUBLIC_KEY) as DecodedToken;
    const currentTime: number = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      throw new GraphQLError("You are not Signed in", {
        extensions: {
          code: "UNAUTHENTICATED",
        },
      });
    }

    if (decoded.exp - currentTime < 3600) {
      return {
        userId: decoded.userId,
        isNotExp: false,
      };
    }

    return {
      userId: decoded.userId,
      isNotExp: true,
    };
  } catch (err) {
    throw new GraphQLError(err);
  }
}
