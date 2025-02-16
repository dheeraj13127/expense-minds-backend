import mongoose from "mongoose";
import {
  createRecordValidation,
  deleteRecordValidation,
  getRecordByDayValidation,
  getRecordByMonthValidation,
  getRecordBySummaryValidation,
  updatedRecordValidation,
} from "../joi/recordJOI";
import { RecordSchema } from "../models/RecordSchema";
import { recordsType } from "../interfaces/recordsInterface";
import {
  getLatestRecordsForDaily,
  getLatestRecordsForMonthly,
} from "../utils/recordHelpers/recordHelpers";

const monthsRange = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
];

export const createNewRecord = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { userId, amount, category, amountType, account, note, createdAt } =
      req.body.data;
    const { error } = createRecordValidation.validate(req.body.data);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newRecord = await RecordSchema.create(
      [
        {
          userId,
          amount,
          category,
          amountType,
          account,
          note,
        },
      ],
      { session }
    );
    const updatedRecord = await RecordSchema.findByIdAndUpdate(
      { _id: newRecord[0]._id },
      { createdAt: createdAt },
      { session, new: true, upsert: true }
    );

    await session.commitTransaction();
    return res
      .status(200)
      .json({ message: "New record created", record: updatedRecord });
  } catch (err) {
    console.log(err);
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to create new record !" });
  } finally {
    await session.endSession();
  }
};

export const getRecordsByDay = async (req: any, res: any) => {
  try {
    const { day } = req.query;
    const { error } = getRecordByDayValidation.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
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
        $sort: {
          _id: -1,
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
          _id: -1,
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

    return res
      .status(200)
      .json({ message: "Fetched records successfully", result: recordsByDay });
  } catch (err) {
    return res.status(400).json({ message: "Failed to fetch records !" });
  }
};

export const getRecordsByMonth = async (req: any, res: any) => {
  try {
    const { month } = req.query;
    const { error } = getRecordByMonthValidation.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let filter = {
      userId: req.user._id,
    };

    const recordsByMonth = await RecordSchema.aggregate([
      {
        $match: filter,
      },
      {
        $addFields: {
          year: {
            $dateToString: { format: "%Y", date: "$createdAt" },
          },

          exactMonth: {
            $dateToString: { format: "%m", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          year: month,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },

      {
        $group: {
          _id: "$exactMonth",

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
          _id: -1,
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
          missingMonths: {
            $filter: {
              input: monthsRange,
              as: "missingMonth",
              cond: { $not: { $in: ["$$missingMonth", "$data._id"] } },
            },
          },
        },
      },
      {
        $addFields: {
          data: {
            $concatArrays: [
              {
                $map: {
                  input: "$missingMonths",
                  as: "month",
                  in: {
                    _id: "$$month",
                    expense: 0,
                    income: 0,
                    records: [],
                  },
                },
              },
              "$data",
            ],
          },
        },
      },
      {
        $addFields: {
          data: {
            $sortArray: {
              input: "$data",
              sortBy: { _id: -1 },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          totalExpenseSum: 1,
          totalIncomeSum: 1,
          data: 1,
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

    return res.status(200).json({
      message: "Fetched records successfully",
      result: recordsByMonth,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Failed to fetch records !" });
  }
};

export const getRecordsBySummary = async (req: any, res: any) => {
  try {
    const { day } = req.query;
    const { error } = getRecordBySummaryValidation.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let filter = {
      userId: req.user._id,
    };
    const recordsBySumary = await RecordSchema.aggregate([
      {
        $match: filter,
      },
      {
        $addFields: {
          yearAndMonth: {
            $dateToString: { format: "%Y-%m", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          yearAndMonth: day,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $group: {
          _id: "$account",
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
          _id: -1,
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

    return res.status(200).json({
      message: "Fetched records successfully",
      result: recordsBySumary,
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to fetch records !" });
  }
};

export const updateIndividualRecord = async (req: any, res: any) => {
  const { _id, amount, category, amountType, account, note, recordType } =
    req.body.data;
  try {
    const { error } = updatedRecordValidation.validate(req.body.data);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedRecord = await RecordSchema.findOneAndUpdate(
      {
        userId: req.user._id,
        _id: _id,
      },
      {
        amount,
        category,
        amountType,
        account,
        note,
      },
      { upsert: true, new: true }
    );

    const filterDate = new Date(updatedRecord.createdAt);
    const year = filterDate.getFullYear();
    const month = (filterDate.getMonth() + 1).toString();
    const date = filterDate.getDate().toString();
    const updatedMonth = month.length <= 1 ? "0" + month : month;
    const updatedDate = date.length <= 1 ? "0" + date : date;
    let day = `${year}-${updatedMonth}`;
    let latestRecords: recordsType[];
    if (recordType === "daily") {
      latestRecords = await getLatestRecordsForDaily(
        req.user._id,
        year,
        updatedMonth,
        updatedDate,
        day
      );
    } else {
      latestRecords = await getLatestRecordsForMonthly(
        req.user._id,
        year,
        updatedMonth
      );
    }

    return res.status(200).json({
      message: "Updated record successfully",
      records: latestRecords[0],
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to fetch records !" });
  }
};

export const deleteIndividualRecord = async (req: any, res: any) => {
  const { id, recordType } = req.query;
  try {
    const { error } = deleteRecordValidation.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const deletedRecord = await RecordSchema.findOneAndDelete({
      userId: req.user._id,
      _id: id,
    });
    //@ts-ignore
    const filterDate = new Date(deletedRecord?.createdAt);
    const year = filterDate.getFullYear();
    const month = (filterDate.getMonth() + 1).toString();
    const date = filterDate.getDate().toString();
    const updatedMonth = month.length <= 1 ? "0" + month : month;
    const updatedDate = date.length <= 1 ? "0" + date : date;
    let day = `${year}-${updatedMonth}`;
    let latestRecords: recordsType[];
    if (recordType === "daily") {
      latestRecords = await getLatestRecordsForDaily(
        req.user._id,
        year,
        updatedMonth,
        updatedDate,
        day
      );
    } else {
      latestRecords = await getLatestRecordsForMonthly(
        req.user._id,
        year,
        updatedMonth
      );
    }

    return res.status(200).json({
      message: "Deleted record successfully",
      records: latestRecords[0],
    });
  } catch (err) {
    return res.status(400).json({ message: "Failed to fetch records !" });
  }
};
