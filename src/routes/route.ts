import express from "express";
import { createNewRecord } from "../controllers/recordController";
import { protect } from "../utils/protect/protect";

const recordRouter = express.Router();

recordRouter.use(protect);
recordRouter.post("/create", createNewRecord);

export { recordRouter };
