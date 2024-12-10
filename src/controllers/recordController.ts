import { createRecordValidation } from "../joi/recordJOI";
import { RecordSchema } from "../models/RecordSchema";

export const createNewRecord = async (req: any, res: any) => {
  try {
    const { error } = createRecordValidation.validate(req.body);
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
