import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amountType: {
      type: String,
      enum: ["expense", "income"],
      default: "expense",
      required: true,
    },
    account: {
      type: String,
      required: true,
    },
    note: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

const RecordSchema = mongoose.model("record", recordSchema);
export { RecordSchema };
