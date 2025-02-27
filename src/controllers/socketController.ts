import mongoose from "mongoose";
import { Server, Socket } from "socket.io";
import { ConversationSchema } from "../models/ConversationSchema";
import { MessageSchema } from "../models/MessageSchema";
import { embeddings, openAiModel, pinecone } from "../..";
import {
  botAnswerPromptTemplate,
  standAloneQuestionPromptTemplate,
} from "../utils/templates/templates";

export const generateBotReply = async (
  previousChats: any,
  userId: string,
  lastMessage: any
) => {
  try {
    const indexName = process.env?.PINCECONE_INDEX_NAME;
    const index = pinecone.Index(indexName ? indexName : "");
    let chats = "";
    for (let i = 0; i < previousChats.length; i++) {
      chats += `${previousChats[i].sent_by}: ${previousChats[i].message}`;
    }
    const standAloneQuestionPrompt = standAloneQuestionPromptTemplate(
      chats,
      lastMessage.message
    );
    const questionResponse = await openAiModel.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [{ role: "user", content: standAloneQuestionPrompt }],
      temperature: 0,
      max_tokens: 500,
    });

    const standaloneQuestion =
      questionResponse.choices[0].message.content?.split(
        "rephrased last user message :####"
      )[1];
    const standaloneQuestionEmbeddings = await embeddings.embedQuery(
      standaloneQuestion ? standaloneQuestion : ""
    );
    let questionQueryResponse = await index.namespace(userId).query({
      topK: 5,
      vector: standaloneQuestionEmbeddings,
      includeMetadata: true,
      includeValues: true,
    });

    const queryMetadata = questionQueryResponse.matches
      .map((match) => match.metadata?.details)
      .join(" ");
    const botAnswerPrompt = botAnswerPromptTemplate(
      chats,
      queryMetadata.toString(),
      lastMessage.message
    );
    const answerResponse = await openAiModel.chat.completions.create({
      model: "gpt-4o-mini",

      messages: [{ role: "user", content: botAnswerPrompt }],
      temperature: 0,
      max_tokens: 500,
    });
    const finalBotAnswer = answerResponse.choices[0].message.content?.split(
      "Response to user:####"
    )[1];
    return {
      response: finalBotAnswer,
    };
  } catch (err) {
    console.log("Error in generating bot reply");
  }
};
2;

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
  //@ts-ignore
  const userId = socket.handshake.user?._id.toString();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
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
    //@ts-ignore
    io.to(socket.handshake.user?._id.toString()).emit("typing-answer");

    const previousChats = await MessageSchema.find({
      conversationId: conversation,
      userId,
    });
    const messageResponse = await generateBotReply(
      previousChats,
      userId,
      newMessage[0]
    );
    const botMessage = await MessageSchema.create(
      [
        {
          userId,
          conversationId: conversation,
          sent_by: "bot",
          message: messageResponse?.response,
        },
      ],
      { session }
    );

    //@ts-ignore
    io.to(socket.handshake.user?._id.toString()).emit(
      "dm-user-answer",
      JSON.stringify({
        message: botMessage[0],
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
