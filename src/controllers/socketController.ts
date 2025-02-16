import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
import { ConversationSchema } from "../models/ConversationSchema";
import { MessageSchema } from "../models/MessageSchema";

export const createConversation =
  (socket: Socket, io: Server) => async (data: any) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      //@ts-ignore
      const userId = socket.handshake.user._id.toString();
      const newConversation = await ConversationSchema.create(
        [
          {
            userId,
          },
        ],
        { session }
      );
      io.to(userId).emit(
        "conversation-created",
        JSON.stringify({ conversation: newConversation[0] })
      );

      await session.commitTransaction();
    } catch (err) {
      console.log(err);
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  };

export const dmUser = (socket: Socket, io: Server) => async (data: any) => {
  const { conversation, message } = JSON.parse(data);
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    //@ts-ignore
    const userId = socket.handshake.user._id.toString();
    const newMessage = await MessageSchema.create(
      [
        {
          userId,
          conversationId: conversation,
          sent_by: "user",
          message,
        },
      ],
      { session }
    );
    //@ts-ignore
    io.to(socket.handshake.user?._id.toString()).emit(
      "dm-user-answer",
      JSON.stringify({
        message: newMessage[0],
      })
    );
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
  } finally {
    await session.endSession();
  }
};
