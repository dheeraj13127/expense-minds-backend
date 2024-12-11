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
          yearAndMonth: "2024-11",
        },
      },
      {
        $group: {
          _id: "$yearAndMonth",
          records: {
            $push: {
              day: "$day",
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
        $unwind: {
          path: "$records",
          preserveNullAndEmptyArrays: false,
        },
      },

      {
        $group: {
          _id: "$records.day",
          records: {
            $push: {
              // day: "$_id",
              amount: "$records.amount",
              category: "$records.category",
              amountType: "$records.amountType",
              account: "$records.account",
              note: "$records.note",
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);
    console.log(recordsByDay);
    return res.status(200).json({ message: "Fetched records successfully" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Failed to fetch records !" });
  }
};
