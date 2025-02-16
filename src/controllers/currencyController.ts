import { createCurrencyValidation } from "../joi/currencyJOI";
import { CurrencySchema } from "../models/CurrencySchema";
import { UserSchema } from "../models/UserSchema";

export const createNewCurrency = async (req: any, res: any) => {
  try {
    const { error } = createCurrencyValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newCurrency = await CurrencySchema.create(req.body);

    return res
      .status(200)
      .json({ message: "New currency created", currency: newCurrency });
  } catch (err) {
    return res.status(400).json({ message: "Failed to create new currency !" });
  }
};

export const getUserCurrency = async (req: any, res: any) => {
  try {
    const user = await UserSchema.findById({ _id: req.user._id });
    const userCurrency = await CurrencySchema.findById({ _id: user?.currency });
    return res.status(200).json({
      message: "Fetched currency successfully",
      currency: userCurrency,
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to get currency !" });
  }
};
