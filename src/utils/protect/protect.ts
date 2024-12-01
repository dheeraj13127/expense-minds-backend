import { NextFunction } from "express";
import { JwtPayload } from "../../interfaces/jwtInterface";
import { UserSchema } from "../../models/UserSchema";
import { verify } from "../jwt/jwt";

//@ts-ignore
export const protect = async (req: any, res: any, next: NextFunction) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid token",
      });
    }
    const validPayload = verify(token) as JwtPayload;
    const user = await UserSchema.findById(validPayload.id);
    if (!user) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid token",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: "Error in authenticating",
    });
  }
};
