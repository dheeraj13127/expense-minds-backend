import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    currency: {
      type: mongoose.Schema.ObjectId,
      ref: "currency",
    },
    categories: {
      type: {
        expense: [
          {
            categoryName: {
              type: String,
              required: true,
            },
            categorySymbol: {
              type: String,
              required: true,
            },
          },
        ],
        income: [
          {
            categoryName: {
              type: String,
              required: true,
            },
            categorySymbol: {
              type: String,
              required: true,
            },
          },
        ],
      },
    },
    accounts: {
      type: [
        {
          groupName: String,
          subAccounts: [
            {
              name: {
                type: String,
                required: true,
              },
              description: {
                type: String,
              },
              amount: {
                type: Number,
                required: true,
              },
            },
          ],
        },
      ],
    },
  },
  { timestamps: true }
);

const UserSchema = mongoose.model("user", userSchema);
export { UserSchema };
