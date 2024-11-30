import express from "express";
import { authenticateUser } from "../controllers/authController";

const authRouter = express.Router();

authRouter.post("/google", authenticateUser);

export { authRouter };
