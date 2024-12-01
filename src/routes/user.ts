import express from "express";

import { getProfile } from "../controllers/userController";
import { protect } from "../utils/protect/protect";

const userRouter = express.Router();

userRouter.use(protect);
userRouter.get("/profile", getProfile);

export { userRouter };
