import { OAuth2Client } from "google-auth-library";
import { authVerifySchema } from "../joi/authJOI";
import { sign } from "../utils/jwt/jwt";
import { UserSchema } from "../models/UserSchema";
import { initialCategoriesData } from "../utils/intialData/initialCategoriesData";
import { initialAccountsData } from "../utils/intialData/initialAccountsData";
import mongoose from "mongoose";
import { CurrencySchema } from "../models/CurrencySchema";

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
      const usdCurrency = await CurrencySchema.findOne({
        name: "USD",
        country: "USA",
      });
      const addUserCurrency = await UserSchema.updateOne(
        { _id: newUser._id },
        {
          currency: usdCurrency?._id,
        },
        { upsert: true }
      );
      const addUserCategories = await UserSchema.updateOne(
        { _id: newUser._id },
        {
          $push: { categories: { $each: initialCategoriesData } },
        },
        { upsert: true }
      );
      const addUserAccounts = await UserSchema.updateOne(
        { _id: newUser._id },
        {
          $push: { accounts: { $each: initialAccountsData } },
        },
        { upsert: true }
      );
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
