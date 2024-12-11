import express from "express";
import { createNewCurrency } from "../controllers/currencyController";

const currencyRouter = express.Router();

currencyRouter.post("/create", createNewCurrency);

export { currencyRouter };
