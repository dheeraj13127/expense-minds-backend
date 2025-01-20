import express from "express";
import { protect } from "../utils/protect/protect";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controllers/settingsController";

const settingsRouter = express.Router();

settingsRouter.use(protect);
settingsRouter.post("/category/create", createCategory);
settingsRouter.put("/category/update", updateCategory);
settingsRouter.delete("/category/delete", deleteCategory);

export { settingsRouter };
