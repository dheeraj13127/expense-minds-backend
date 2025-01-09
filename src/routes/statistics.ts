import express from "express";

import { protect } from "../utils/protect/protect";
import { getStatisticsMonthly } from "../controllers/statisticsController";

const statisticsRouter = express.Router();

statisticsRouter.use(protect);
statisticsRouter.get("/monthly", getStatisticsMonthly);

export { statisticsRouter };
