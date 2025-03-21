import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import dotenv from "dotenv";
import Cookies from "cookies";

dotenv.config({ path: ".env" });

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export const hashPw = async (password: string) => {
  const costFactor = 12;
  const hashedPw = await bcrypt.hash(password, costFactor);
  return hashedPw;
};

export const checkPw = async (password: string, hashedPw: string) => {
  return await bcrypt.compare(password, hashedPw);
};

export const isPasswordSecure = (password: string) => {
  // TODO: Check whether the password meets the security requirements
  return password.length >= 6;
};

export function signJWT(userId: string) {
  const payload = { userId };
  return jwt.sign(payload, process.env.PRIVATE_KEY, {
    algorithm: "RS256",
    expiresIn: "24h",
  });
}

export function verifyJWT(token: string): {
  userId: string;
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

export function setCookie(cookies: Cookies, id: string) {
  cookies.set("bctp_token", signJWT(id), {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
}
