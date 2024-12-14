import mongoose from "mongoose";
import { createRecordValidation } from "../joi/recordJOI";
import { RecordSchema } from "../models/RecordSchema";

export const createNewRecord = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { error } = createRecordValidation.validate(req.body.data);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newRecord = await RecordSchema.create(req.body.data);
    await session.commitTransaction();
    return res
      .status(200)
      .json({ message: "New record created", record: newRecord });
  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to create new record !" });
  } finally {
    await session.endSession();
  }
};

export const getRecordsByDay = async (req: any, res: any) => {
  const { day } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let filter = {
      userId: req.user._id,
    };
    const recordsByDay = await RecordSchema.aggregate([
      {
        $match: filter,
      },
      {
        $addFields: {
          yearAndMonth: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
          day: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          yearAndMonth: day,
        },
      },

      {
        $group: {
          _id: "$day",
          expense: {
            $sum: {
              $cond: [
                {
                  $eq: ["$amountType", "expense"],
                },
                "$amount",
                0,
              ],
            },
          },
          income: {
            $sum: {
              $cond: [
                {
                  $eq: ["$amountType", "income"],
                },
                "$amount",
                0,
              ],
            },
          },
          records: {
            $push: {
              _id: "$_id",
              amount: "$amount",
              category: "$category",
              amountType: "$amountType",
              account: "$account",
              note: "$note",
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalExpenseSum: { $sum: "$expense" },
          totalIncomeSum: { $sum: "$income" },
          data: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $addFields: {
          netTotal: {
            $subtract: ["$totalIncomeSum", "$totalExpenseSum"],
          },
        },
      },
    ]);
    await session.commitTransaction();
    return res
      .status(200)
      .json({ message: "Fetched records successfully", result: recordsByDay });
  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to fetch records !" });
  } finally {
    await session.endSession();
  }
};

export const getRecordsByMonth = async (req: any, res: any) => {
  const { month } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let filter = {
      userId: req.user._id,
    };
    const recordsByDay = await RecordSchema.aggregate([
      {
        $match: filter,
      },
      {
        $addFields: {
          year: {
            $dateToString: { format: "%Y", date: "$createdAt" },
          },
          yearAndMonth: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          year: month,
        },
      },

      {
        $group: {
          _id: "$yearAndMonth",
          expense: {
            $sum: {
              $cond: [
                {
                  $eq: ["$amountType", "expense"],
                },
                "$amount",
                0,
              ],
            },
          },
          income: {
            $sum: {
              $cond: [
                {
                  $eq: ["$amountType", "income"],
                },
                "$amount",
                0,
              ],
            },
          },
          records: {
            $push: {
              _id: "$_id",
              amount: "$amount",
              category: "$category",
              amountType: "$amountType",
              account: "$account",
              note: "$note",
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalExpenseSum: { $sum: "$expense" },
          totalIncomeSum: { $sum: "$income" },
          data: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $addFields: {
          netTotal: {
            $subtract: ["$totalIncomeSum", "$totalExpenseSum"],
          },
        },
      },
    ]);
    await session.commitTransaction();
    return res
      .status(200)
      .json({ message: "Fetched records successfully", result: recordsByDay });
  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to fetch records !" });
  } finally {
    await session.endSession();
  }
};
