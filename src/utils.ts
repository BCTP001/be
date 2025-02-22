import bcrypt from "bcrypt";

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
