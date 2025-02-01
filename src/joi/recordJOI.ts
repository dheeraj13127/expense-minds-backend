import Joi from "joi";

export const createRecordValidation = Joi.object({
  userId: Joi.string()
    .required()
    .regex(/^[a-fA-F0-9]{24}$/),
  amount: Joi.number().required(),
  category: Joi.string().required(),
  amountType: Joi.string().required(),
  account: Joi.string().required(),
  note: Joi.string().allow(null, ""),
  createdAt: Joi.date().required(),
});

export const getRecordByDayValidation = Joi.object({
  day: Joi.string().required(),
});

export const getRecordByMonthValidation = Joi.object({
  month: Joi.string().required(),
});

export const getRecordBySummaryValidation = Joi.object({
  day: Joi.string().required(),
});

export const updatedRecordValidation = Joi.object({
  _id: Joi.string().required(),
  amount: Joi.number().required(),
  category: Joi.string().required(),
  amountType: Joi.string().required(),
  account: Joi.string().required(),
  note: Joi.string().allow(null, ""),
  recordType: Joi.string().required(),
});

export const deleteRecordValidation = Joi.object({
  id: Joi.string().required(),
  recordType: Joi.string().required(),
});
