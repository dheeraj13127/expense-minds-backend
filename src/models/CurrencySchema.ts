import mongoose from "mongoose";

const currencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const CurrencySchema = mongoose.model("currency", currencySchema);
export { CurrencySchema };
