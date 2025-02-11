import express from "express";
import { protect } from "../utils/protect/protect";
import {
  processRecordsByDaySummary,
  processRecordsByMonthSummary,
} from "../controllers/automatedController";

const automatedRouter = express.Router();

automatedRouter.use(protect);
automatedRouter.post("/day-summary", processRecordsByDaySummary);
automatedRouter.post("/monthly-summary", processRecordsByMonthSummary);
export { automatedRouter };
