import { Socket } from "socket.io";
import { verify } from "../utils/jwt/jwt";
import { JwtPayload } from "../interfaces/jwtInterface";
import { UserSchema } from "../models/UserSchema";

export const getProfile = async (req: any, res: any) => {
  try {
    return res.status(200).json({
      status: "success",
      user: req.user,
    });
  } catch (err) {
    return res.status(400).json({ message: "failed to fetch the profile" });
  }
};

export const authenticateSocketUser = async (socket: Socket, next: any) => {
  try {
    let rooms;
    if (!socket.handshake.query || !socket.handshake.query.token) {
      console.log("token not provided");
      next();
      return;
    }
    let token = socket.handshake.query.token as string;
    const validPayload = verify(token) as JwtPayload;
    const freshUser = await UserSchema.findById({ _id: validPayload.id });
    if (!freshUser) {
      next();
      return;
    }
    rooms = [String(freshUser?._id)];
    //@ts-ignore
    socket.handshake.user = freshUser;
    socket.join(rooms);
    next();
  } catch (err) {
    console.log(
      " Error in authenticating socket ",
      socket.handshake.query,
      err
    );
    socket.disconnect();
    return;
  }
};
