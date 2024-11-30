import { OAuth2Client } from "google-auth-library";
import { authVerifySchema } from "../joi/authJOI";
import { sign } from "../utils/jwt/jwt";
import { UserSchema } from "../models/UserSchema";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authenticateUser = async (req: any, res: any) => {
  try {
    const { error } = authVerifySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const email = ticket.getPayload()?.email;
    const name = ticket.getPayload()?.name;
    let existingUser = await UserSchema.findOne({ email, name });
    if (existingUser) {
      const userToken = sign({ id: existingUser._id }, "23h");
      return res.status(200).json({
        userToken,
        message: "Authenticated Successfully",
      });
    } else {
      const newUser = await UserSchema.create({
        name: name,
        email: email,
      });
      const userToken = sign({ id: newUser._id }, "23h");
      return res.status(200).json({
        userToken,
        message: "Authenticated Successfully",
      });
    }
  } catch (err) {
    return res.status(400).json({ message: "Authentication failed !" });
  }
};
