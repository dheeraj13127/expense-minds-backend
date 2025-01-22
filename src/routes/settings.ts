import express from "express";
import { protect } from "../utils/protect/protect";
import {
  createCategory,
  createSubAccount,
  deleteCategory,
  deleteSubAccount,
  updateCategory,
  updateSubAccount,
} from "../controllers/settingsController";

const settingsRouter = express.Router();

settingsRouter.use(protect);
settingsRouter.post("/category/create", createCategory);
settingsRouter.put("/category/update", updateCategory);
settingsRouter.delete("/category/delete", deleteCategory);
settingsRouter.post("/account/create", createSubAccount);
settingsRouter.put("/account/update", updateSubAccount);
settingsRouter.delete("/account/delete", deleteSubAccount);

export { settingsRouter };
