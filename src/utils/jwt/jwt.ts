import jwt from "jsonwebtoken";
require("dotenv").config();
const secret = process.env.JWT_SECRET as string;
export const sign = (payload: any, expiry: string) => {
  return jwt.sign(payload, secret, { expiresIn: expiry });
};

export const verify = (token: string) => {
  return jwt.verify(token, secret);
};
