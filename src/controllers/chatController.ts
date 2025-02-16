import { ConversationSchema } from "../models/ConversationSchema";
import { MessageSchema } from "../models/MessageSchema";

export const getConversation = async (req: any, res: any) => {
  try {
    const conversation = await ConversationSchema.findOne({
      userId: req.user._id,
    });

    return res.status(200).json({
      message: "Fetched conversation successfully",
      conversation: conversation,
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to get conversation !" });
  }
};

export const getMessages = async (req: any, res: any) => {
  try {
    const messages = await MessageSchema.find({
      userId: req.user._id,
    });

    return res.status(200).json({
      message: "Fetched messages successfully",
      messages: messages,
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to get messages !" });
  }
};
