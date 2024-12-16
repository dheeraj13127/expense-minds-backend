import mongoose from "mongoose";
import {
  createCurrencyValidation,
  getUserCurrencyValidation,
} from "../joi/currencyJOI";
import { CurrencySchema } from "../models/CurrencySchema";
import { UserSchema } from "../models/UserSchema";

export const createNewCurrency = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { error } = createCurrencyValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newCurrency = await CurrencySchema.create(req.body);
    await session.commitTransaction();
    return res
      .status(200)
      .json({ message: "New currency created", currency: newCurrency });
  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to create new currency !" });
  } finally {
    await session.endSession();
  }
};

export const getUserCurrency = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await UserSchema.findById({ _id: req.user._id });
    const userCurrency = await CurrencySchema.findById({ _id: user?.currency });
    return res.status(200).json({
      message: "Fetched currency successfully",
      currency: userCurrency,
    });
  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to get currency !" });
  } finally {
    await session.endSession();
  }
};
