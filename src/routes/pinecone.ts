import express from "express";
import { protect } from "../utils/protect/protect";

import { indexRecordsToPineCone } from "../controllers/pineconeController";

const pineconeRouter = express.Router();

pineconeRouter.use(protect);
pineconeRouter.post("/indexRecords", indexRecordsToPineCone);

export { pineconeRouter };
