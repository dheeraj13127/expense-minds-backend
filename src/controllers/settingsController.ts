import mongoose from "mongoose";
import {
  createCategoryValidation,
  deleteCategoryValidation,
  updateCategoryValidation,
} from "../joi/settingsJOI";
import { UserSchema } from "../models/UserSchema";

export const createCategory = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { categoryName, categorySymbol, categoryType } = req.body.data;
    const { error } = createCategoryValidation.validate(req.body.data);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let createdCategory;
    if (categoryType === "expense") {
      createdCategory = await UserSchema.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $push: {
            "categories.expense": {
              categoryName: categoryName,
              categorySymbol: categorySymbol,
            },
          },
        },
        { new: true, upsert: true }
      );
    } else if (categoryType === "income") {
      createdCategory = await UserSchema.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $push: {
            "categories.income": {
              categoryName: categoryName,
              categorySymbol: categorySymbol,
            },
          },
        },
        { new: true, upsert: true }
      );
    }
    await session.commitTransaction();
    return res.status(200).json({
      message: "Created category successfully",
      result:
        categoryType === "expense"
          ? createdCategory?.categories?.expense
          : createdCategory?.categories?.income,
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to create category !" });
  } finally {
    await session.endSession();
  }
};

export const updateCategory = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { categoryName, categorySymbol, categoryType, _id } = req.body.data;
    const { error } = updateCategoryValidation.validate(req.body.data);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let updatedCategory;
    if (categoryType === "expense") {
      updatedCategory = await UserSchema.findOneAndUpdate(
        {
          _id: req.user._id,
          "categories.expense._id": _id,
        },
        {
          $set: {
            "categories.expense.$.categoryName": categoryName,
            "categories.expense.$.categorySymbol": categorySymbol,
          },
        },
        { new: true, upsert: true }
      );
    } else if (categoryType === "income") {
      updatedCategory = await UserSchema.findOneAndUpdate(
        {
          _id: req.user._id,
          "categories.income._id": _id,
        },
        {
          $set: {
            "categories.income.$.categoryName": categoryName,
            "categories.income.$.categorySymbol": categorySymbol,
          },
        },

        { new: true, upsert: true }
      );
    }
    await session.commitTransaction();
    return res.status(200).json({
      message: "Updated category successfully",
      result:
        categoryType === "expense"
          ? updatedCategory?.categories?.expense.find(
              (exp) => exp._id.toHexString() === _id
            )
          : updatedCategory?.categories?.income.find(
              (inc) => inc._id.toHexString() === _id
            ),
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to update category !" });
  } finally {
    await session.endSession();
  }
};

export const deleteCategory = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { id, categoryType } = req.query;
    const { error } = deleteCategoryValidation.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let deletedCategory;
    if (categoryType === "expense") {
      deletedCategory = await UserSchema.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $pull: {
            "categories.expense": {
              _id: id,
            },
          },
        },
        { new: true, upsert: true }
      );
    } else if (categoryType === "income") {
      deletedCategory = await UserSchema.findOneAndUpdate(
        {
          _id: req.user._id,
        },
        {
          $pull: {
            "categories.income": {
              _id: id,
            },
          },
        },
        { new: true, upsert: true }
      );
    }
    await session.commitTransaction();
    return res.status(200).json({
      message: "Deleted category successfully",
    });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to delete category !" });
  } finally {
    await session.endSession();
  }
};
