import express from "express";
import {
  createNewCurrency,
  getUserCurrency,
} from "../controllers/currencyController";
import { protect } from "../utils/protect/protect";

const currencyRouter = express.Router();

currencyRouter.post("/create", createNewCurrency);
currencyRouter.use(protect);
currencyRouter.get("/user-currency", getUserCurrency);

export { currencyRouter };
