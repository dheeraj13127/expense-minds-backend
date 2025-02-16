import mongoose from "mongoose";
import {
  createCategoryValidation,
  createSubAccountValidation,
  deleteCategoryValidation,
  deleteSubAccountValidation,
  updateCategoryValidation,
  updateSubAccountValidation,
} from "../joi/settingsJOI";
import { UserSchema } from "../models/UserSchema";

export const createCategory = async (req: any, res: any) => {
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

    return res.status(200).json({
      message: "Created category successfully",
      result:
        categoryType === "expense"
          ? createdCategory?.categories?.expense
          : createdCategory?.categories?.income,
    });
  } catch (err) {
    console.log(err);

    return res.status(400).json({ message: "Failed to create category !" });
  }
};

export const updateCategory = async (req: any, res: any) => {
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
    return res.status(400).json({ message: "Failed to update category !" });
  }
};

export const deleteCategory = async (req: any, res: any) => {
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

    return res.status(200).json({
      message: "Deleted category successfully",
    });
  } catch (err) {
    console.log(err);

    return res.status(400).json({ message: "Failed to delete category !" });
  }
};

export const createSubAccount = async (req: any, res: any) => {
  try {
    const { groupId, name, description, amount } = req.body.data;
    const { error } = createSubAccountValidation.validate(req.body.data);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const createdSubAccount = await UserSchema.findOneAndUpdate(
      {
        _id: req.user._id,
        "accounts._id": groupId,
      },
      {
        $push: {
          "accounts.$.subAccounts": {
            name,
            description,
            amount,
          },
        },
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: "Created sub account successfully",
      result: createdSubAccount.accounts,
    });
  } catch (err) {
    console.log(err);

    return res.status(400).json({ message: "Failed to create sub account !" });
  }
};

export const updateSubAccount = async (req: any, res: any) => {
  try {
    const { _id, groupId, name, description, amount } = req.body.data;
    const { error } = updateSubAccountValidation.validate(req.body.data);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedSubAccount = await UserSchema.findOneAndUpdate(
      {
        _id: req.user._id,
        "accounts._id": groupId,
        "accounts.subAccounts._id": _id,
      },
      {
        $set: {
          "accounts.$[acc].subAccounts.$[subAcc].name": name,
          "accounts.$[acc].subAccounts.$[subAcc].description": description,
          "accounts.$[acc].subAccounts.$[subAcc].amount": amount,
        },
      },
      {
        arrayFilters: [{ "acc._id": groupId }, { "subAcc._id": _id }],
        new: true,
        upsert: true,
      }
    );

    return res.status(200).json({
      message: "Updated sub account successfully",
      result: updatedSubAccount.accounts
        .find((acc) => acc._id.toHexString() === groupId)
        ?.subAccounts.find((subAcc) => subAcc._id.toHexString() === _id),
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Failed to update sub account !" });
  }
};

export const deleteSubAccount = async (req: any, res: any) => {
  try {
    const { id, groupId } = req.query;
    const { error } = deleteSubAccountValidation.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    await UserSchema.findOneAndUpdate(
      {
        _id: req.user._id,
        "accounts._id": groupId,
        "accounts.subAccounts._id": id,
      },
      {
        $pull: {
          "accounts.$.subAccounts": {
            _id: id,
          },
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      message: "Deleted sub account successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Failed to delete sub account !" });
  }
};
