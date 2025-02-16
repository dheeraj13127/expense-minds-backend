import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.ObjectId,
      ref: "conversation",
      required: true,
    },
    sent_by: {
      type: String,
      enum: ["user", "bot"],
      default: "user",
    },
    message: { type: String },
  },
  { timestamps: true }
);

const MessageSchema = mongoose.model("message", messageSchema);
export { MessageSchema };
