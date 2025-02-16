import express from "express";
import { protect } from "../utils/protect/protect";

import { getConversation, getMessages } from "../controllers/chatController";

const chatRouter = express.Router();

chatRouter.use(protect);
chatRouter.get("/getConversation", getConversation);
chatRouter.get("/getMessages", getMessages);

export { chatRouter };
