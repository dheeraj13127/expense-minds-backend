import { OAuth2Client } from "google-auth-library";
import { authVerifySchema } from "../joi/authJOI";
import { sign } from "../utils/jwt/jwt";
import { UserSchema } from "../models/UserSchema";
import {
  initialExpenseCategoriesData,
  initialIncomeCategoriesData,
} from "../utils/intialData/initialCategoriesData";
import { initialAccountsData } from "../utils/intialData/initialAccountsData";
import { CurrencySchema } from "../models/CurrencySchema";
import mongoose from "mongoose";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const authenticateUser = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
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
      const userToken = sign({ id: existingUser._id }, "7d");
      return res.status(200).json({
        userToken,
        message: "Authenticated Successfully",
      });
    } else {
      const newUser = await UserSchema.create(
        [
          {
            name: name,
            email: email,
          },
        ],
        { session: session }
      );
      const usdCurrency = await CurrencySchema.findOne({
        name: "USD",
        country: "USA",
      });
      const addUserCurrency = await UserSchema.updateOne(
        { _id: newUser[0]._id },

        {
          currency: usdCurrency?._id,
        },

        { session, upsert: true }
      );
      const addUserCategories = await UserSchema.updateOne(
        { _id: newUser[0]._id },
        {
          $push: {
            "categories.expense": { $each: initialExpenseCategoriesData },
            "categories.income": { $each: initialIncomeCategoriesData },
          },
        },
        { session, upsert: true }
      );
      const addUserAccounts = await UserSchema.updateOne(
        { _id: newUser[0]._id },
        {
          $push: { accounts: { $each: initialAccountsData } },
        },
        { session, upsert: true }
      );
      await session.commitTransaction();
      const userToken = sign({ id: newUser[0]._id }, "7d");

      return res.status(200).json({
        userToken,
        message: "Authenticated Successfully",
      });
    }
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return res.status(400).json({ message: "Authentication failed !" });
  } finally {
    await session.endSession();
  }
};
