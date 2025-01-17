import mongoose from "mongoose";
import { RecordSchema } from "../models/RecordSchema";
import {
  getStatisticsMonthlyValidation,
  getStatisticsYearlyValidation,
} from "../joi/statisticsJOI";

export const getStatisticsMonthly = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { month, amountType } = req.query;
    const { error } = getStatisticsMonthlyValidation.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let filter = {
      userId: req.user._id,
    };
    const statisticsMonthly = await RecordSchema.aggregate([
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
          yearAndMonth: month,
          amountType: amountType,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $group: {
          _id: "$category",
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
          data: {
            $map: {
              input: "$data",
              as: "item",
              in: {
                _id: "$$item._id",
                expense: "$$item.expense",
                income: "$$item.income",
                percentage: {
                  $cond: [
                    {
                      $gt: [
                        `${
                          amountType === "expense"
                            ? "$totalExpenseSum"
                            : "$totalIncomeSum"
                        }`,
                        0,
                      ],
                    },
                    {
                      $multiply: [
                        {
                          $divide: [
                            `${
                              amountType === "expense"
                                ? "$$item.expense"
                                : "$$item.income"
                            }`,
                            `${
                              amountType === "expense"
                                ? "$totalExpenseSum"
                                : "$totalIncomeSum"
                            }`,
                          ],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          labels: {
            $map: {
              input: "$data",
              as: "item",
              in: "$$item._id",
            },
          },
          percentages: {
            $map: {
              input: "$data",
              as: "item",
              in: "$$item.percentage",
            },
          },
        },
      },
    ]);
    await session.commitTransaction();
    return res.status(200).json({
      message: "Fetched records successfully",
      result: statisticsMonthly,
    });
  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to fetch records !" });
  } finally {
    await session.endSession();
  }
};

export const getStatisticsYearly = async (req: any, res: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { year, amountType } = req.query;
    const { error } = getStatisticsYearlyValidation.validate(req.query);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    let filter = {
      userId: req.user._id,
    };
    const statisticsMonthly = await RecordSchema.aggregate([
      {
        $match: filter,
      },
      {
        $addFields: {
          year: {
            $dateToString: { format: "%Y", date: "$createdAt" },
          },
        },
      },
      {
        $match: {
          year: year,
          amountType: amountType,
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $group: {
          _id: "$category",
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
          data: {
            $map: {
              input: "$data",
              as: "item",
              in: {
                _id: "$$item._id",
                expense: "$$item.expense",
                income: "$$item.income",
                percentage: {
                  $cond: [
                    {
                      $gt: [
                        `${
                          amountType === "expense"
                            ? "$totalExpenseSum"
                            : "$totalIncomeSum"
                        }`,
                        0,
                      ],
                    },
                    {
                      $multiply: [
                        {
                          $divide: [
                            `${
                              amountType === "expense"
                                ? "$$item.expense"
                                : "$$item.income"
                            }`,
                            `${
                              amountType === "expense"
                                ? "$totalExpenseSum"
                                : "$totalIncomeSum"
                            }`,
                          ],
                        },
                        100,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          labels: {
            $map: {
              input: "$data",
              as: "item",
              in: "$$item._id",
            },
          },
          percentages: {
            $map: {
              input: "$data",
              as: "item",
              in: "$$item.percentage",
            },
          },
        },
      },
    ]);
    await session.commitTransaction();
    return res.status(200).json({
      message: "Fetched records successfully",
      result: statisticsMonthly,
    });
  } catch (err) {
    await session.abortTransaction();
    return res.status(400).json({ message: "Failed to fetch records !" });
  } finally {
    await session.endSession();
  }
};
