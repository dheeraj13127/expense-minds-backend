import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const ConversationSchema = mongoose.model("conversation", conversationSchema);
export { ConversationSchema };
