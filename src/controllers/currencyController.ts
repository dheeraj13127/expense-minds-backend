import { createCurrencyValidation } from "../joi/currencyJOI";
import { CurrencySchema } from "../models/CurrencySchema";

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
