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
  },
  { timestamps: true }
);

const UserSchema = mongoose.model("user", userSchema);
export { UserSchema };
