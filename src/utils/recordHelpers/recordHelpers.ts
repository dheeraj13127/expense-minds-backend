import { recordsType } from "../../interfaces/recordsInterface";
import { RecordSchema } from "../../models/RecordSchema";

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
export const getLatestRecordsForDaily = async (
  userId: string,
  year: number,
  updatedMonth: string,
  updatedDate: String,
  day: string
): Promise<recordsType[]> => {
  try {
    const latestRecords = await RecordSchema.aggregate([
      {
        $match: {
          userId,
        },
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
          filteredData: {
            $filter: {
              input: "$data",
              as: "item",
              cond: {
                $eq: ["$$item._id", `${year}-${updatedMonth}-${updatedDate}`],
              },
            },
          },
        },
      },
      {
        $project: {
          data: "$filteredData",
          totalIncomeSum: 1,
          totalExpenseSum: 1,
          netTotal: 1,
        },
      },
    ]);
    return latestRecords;
  } catch (err) {
    throw err;
  }
};

export const getLatestRecordsForMonthly = async (
  userId: string,
  year: number,
  updatedMonth: string
): Promise<recordsType[]> => {
  try {
    const latestRecords = await RecordSchema.aggregate([
      {
        $match: {
          userId,
        },
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
          year: year.toString(),
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
          filteredData: {
            $filter: {
              input: "$data",
              as: "item",
              cond: {
                $eq: ["$$item._id", `${updatedMonth}`],
              },
            },
          },
        },
      },
      {
        $project: {
          data: "$filteredData",
          totalIncomeSum: 1,
          totalExpenseSum: 1,
          netTotal: 1,
        },
      },
    ]);

    return latestRecords;
  } catch (err) {
    throw err;
  }
};
