import { createRecordValidation } from "../joi/recordJOI";
import { RecordSchema } from "../models/RecordSchema";

export const createNewRecord = async (req: any, res: any) => {
  try {
    const { error } = createRecordValidation.validate(req.body.data);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newRecord = await RecordSchema.create(req.body.data);
    return res
      .status(200)
      .json({ message: "New record created", record: newRecord });
  } catch (err) {
    return res.status(400).json({ message: "Failed to create new record !" });
  }
};

export const getRecordsByDay = async (req: any, res: any) => {
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
          yearAndMonth: "2024-12",
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

    return res
      .status(200)
      .json({ message: "Fetched records successfully", result: recordsByDay });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Failed to fetch records !" });
  }
};

export const getRecordsByMonth = async (req: any, res: any) => {
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
          year: "2024",
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

    return res
      .status(200)
      .json({ message: "Fetched records successfully", result: recordsByDay });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Failed to fetch records !" });
  }
};
