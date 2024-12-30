import express from "express";
import {
  createNewRecord,
  getRecordsByDay,
  getRecordsByMonth,
  getRecordsBySummary,
} from "../controllers/recordController";
import { protect } from "../utils/protect/protect";

const recordRouter = express.Router();

recordRouter.use(protect);
recordRouter.post("/create", createNewRecord);
recordRouter.get("/getRecords/day", getRecordsByDay);
recordRouter.get("/getRecords/month", getRecordsByMonth);
recordRouter.get("/getRecords/summary", getRecordsBySummary);

export { recordRouter };
