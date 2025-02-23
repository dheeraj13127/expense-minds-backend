import { Document } from "mongoose";

interface MessageType extends Document {
  userId: string;
  conversationId: string;
  sent_by: string;
  message: string;
  _id: string;
}

export { MessageType };
